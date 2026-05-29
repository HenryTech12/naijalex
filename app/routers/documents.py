from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.deps import get_db, get_redis
from app.models.document import Document, DocumentAnalysis
from app.schemas.analysis import DocumentAnalysisResponse
from app.services.document_ingestion import ingest_document
from app.agents.pipeline import run_pipeline
from app.config import settings
import uuid
import os
import json

router = APIRouter(prefix="/documents", tags=["Documents"])

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
