from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel as PydanticBaseModel
from app.deps import get_db, get_redis
from app.models.document import Document, DocumentAnalysis
from app.schemas.analysis import DocumentAnalysisResponse
from app.services.document_ingestion import ingest_document
from app.agents.pipeline import run_pipeline
from app.config import settings
from pydantic import BaseModel as PydanticBaseModel
import uuid
import os
import json

router = APIRouter(prefix="/documents", tags=["Documents"])
chat_router = APIRouter(tags=["Documents"])


class ChatRequest(PydanticBaseModel):
    question: str
    language_mode: str = "english"
chat_router = APIRouter(tags=["Documents"])


class ChatRequest(PydanticBaseModel):
    question: str
    language_mode: str = "english"

async def start_analysis_task(doc_id: str, user_id: str, raw_text: str, language_mode: str):
    try:
        await run_pipeline(doc_id, user_id, raw_text, language_mode)
    except Exception as e:
        print(f"Pipeline error: {e}")

@router.post("/analyze")
async def analyze_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: str = Form(...),
    language_mode: str = Form("english"),
    db: AsyncSession = Depends(get_db)
):
    # 1. Save file
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}{file_ext}")
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    # 2. Ingest
    raw_text, ocr_used = ingest_document(file_path, file.content_type)
    
    # 3. Create Document entry
    doc = Document(
        id=uuid.UUID(file_id),
        user_id=uuid.UUID(user_id),
        filename=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        raw_text=raw_text,
        ocr_used=ocr_used
    )
    db.add(doc)
    await db.commit()
    
    # 4. Run pipeline in background
    background_tasks.add_task(start_analysis_task, file_id, user_id, raw_text, language_mode)
    
    return {
        "analysis_id": file_id, # Using doc_id as analysis_id for simplicity
        "status": "processing",
        "estimated_seconds": 30
    }

@router.get("/analysis/{analysis_id}")
async def get_analysis(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    redis = Depends(get_redis)
):
    # Try cache
    cache_key = f"analysis:{analysis_id}"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)
        
    # Check DB (link analysis_id to DocumentAnalysis.document_id or DocumentAnalysis.id)
    # The prompt says GET /analysis/{id} returns DocumentAnalysis. 
    # Let's check both possibilities.
    result = await db.execute(
        select(DocumentAnalysis).where(
            (DocumentAnalysis.id == analysis_id) | (DocumentAnalysis.document_id == analysis_id)
        )
    )
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        # Check if doc exists but still processing
        doc_result = await db.execute(select(Document).where(Document.id == analysis_id))
        if doc_result.scalar_one_or_none():
            return {"status": "processing"}
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    resp = {
        "id": str(analysis.id),
        "document_id": str(analysis.document_id),
        "created_at": analysis.created_at.isoformat(),
        "language_mode": analysis.language_mode,
        "clauses": analysis.clauses,
        "overall_risk": analysis.overall_risk,
        "summary": analysis.summary,
        "top_3_actions": analysis.top_3_actions,
        "risk_card_url": analysis.risk_card_url,
        "processing_time_ms": analysis.processing_time_ms,
        "status": "complete"
    }
    
    # Cache for 1h
    await redis.set(cache_key, json.dumps(resp), ex=3600)
    
    return resp


@chat_router.post("/chat/{analysis_id}")
async def chat_about_document(
    analysis_id: str,
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    import uuid
    import json
    from sqlalchemy import select
    from app.models.document import DocumentAnalysis
    from openai import AsyncOpenAI
    from app.config import settings

    try:
        result = await db.execute(
            select(DocumentAnalysis).where(
                DocumentAnalysis.id == uuid.UUID(analysis_id)
            )
        )
        analysis = result.scalar_one_or_none()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid analysis ID")

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    language_instruction = (
        "Respond in natural Lagos Pidgin English. Sound like a friendly Nigerian legal advisor, not a translator."
        if request.language_mode == "pidgin"
        else "Respond in plain simple English. Be warm and helpful."
    )

    clauses_preview = analysis.clauses[:5] if isinstance(analysis.clauses, list) else []

    prompt = f"""You are NaijaLex, a Nigerian legal assistant helping an SME owner understand their contract.

Contract analysis:
- Overall Risk: {analysis.overall_risk}
- Summary: {analysis.summary}
- Top Actions: {json.dumps(analysis.top_3_actions)}
- Key Clauses: {json.dumps(clauses_preview)}

The user asks: "{request.question}"

{language_instruction}
Be specific to their contract. Keep response under 150 words.
End with "Any other question? I dey here! 💬" if pidgin, or "Any other questions? I'm here to help! 💬" if english."""

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    response = await client.chat.completions.create(
        model="gpt-4o",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )
    return {"answer": response.choices[0].message.content}


@chat_router.post("/chat/{analysis_id}")
async def chat_about_document(
    analysis_id: str,
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    import uuid, json
    from sqlalchemy import select
    from app.models.document import DocumentAnalysis
    from openai import AsyncOpenAI
    from app.config import settings

    try:
        result = await db.execute(
            select(DocumentAnalysis).where(
                DocumentAnalysis.id == uuid.UUID(analysis_id)
            )
        )
        analysis = result.scalar_one_or_none()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid analysis ID")

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    language_instruction = (
        "Respond in natural Lagos Pidgin English. Sound like a friendly Nigerian legal advisor, not a translator."
        if request.language_mode == "pidgin"
        else "Respond in plain simple English. Be warm and helpful."
    )

    clauses_preview = analysis.clauses[:5] if isinstance(analysis.clauses, list) else []

    prompt = f"""You are NaijaLex, a Nigerian legal assistant helping an SME owner understand their contract.

Contract analysis:
- Overall Risk: {analysis.overall_risk}
- Summary: {analysis.summary}
- Top Actions: {json.dumps(analysis.top_3_actions)}
- Key Clauses: {json.dumps(clauses_preview)}

The user asks: "{request.question}"

{language_instruction}
Be specific to their contract. Keep response under 150 words.
End with "Any other question? I dey here! 💬" if pidgin, or "Any other questions? I'm here to help! 💬" if english."""

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    response = await client.chat.completions.create(
        model="gpt-4o",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )
    return {"answer": response.choices[0].message.content}
