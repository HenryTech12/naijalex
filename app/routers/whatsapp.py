from fastapi import APIRouter, Depends, Request, Response, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import async_session
from app.deps import get_db, get_redis
from app.services.whatsapp_service import whatsapp_service
from app.services.session_service import SessionService
from app.services.document_ingestion import ingest_document
from app.agents.pipeline import run_pipeline
from app.models.user import UserProfile
from app.models.document import Document, DocumentAnalysis
from app.config import settings
import uuid
import os

router = APIRouter(tags=["WhatsApp"])

async def process_whatsapp_document(
    file_id: str,
    user_id: str,
    phone_number: str,
    content_type: str,
    raw_text: str,
    redis
):
    """Background task: run pipeline and notify user when done."""
    try:
        final_state = await run_pipeline(file_id, user_id, raw_text, "pidgin")
        
        # Fetch saved analysis
        async with async_session() as db:
            from sqlalchemy import select
            from app.models.document import DocumentAnalysis, Document
            import uuid
            res = await db.execute(
                select(DocumentAnalysis).where(DocumentAnalysis.document_id == uuid.UUID(file_id))
            )
            analysis = res.scalar_one_or_none()
            doc_res = await db.execute(
                select(Document).where(Document.id == uuid.UUID(file_id))
            )
            doc = doc_res.scalar_one_or_none()
            
            if analysis:
                session_service = SessionService(redis)
                summary_msg = whatsapp_service.build_analysis_summary_message({
                    "id": str(analysis.id),
                    "document_type": doc.document_type if doc and doc.document_type else "Legal Document",
                    "overall_risk": analysis.overall_risk,
                    "clauses": analysis.clauses,
                    "top_3_actions": analysis.top_3_actions,
                    "language_mode": "pidgin"
                })
                await whatsapp_service.send_message(phone_number, summary_msg)
                await session_service.set_state(phone_number, "analysis_ready")
                await session_service.save_context(phone_number, {"analysis_id": str(analysis.id)})
            else:
                await whatsapp_service.send_message(
                    phone_number,
                    "E get problem with your document. Abeg try again or send am for different format. 🙏"
                )
    except Exception as e:
        await whatsapp_service.send_message(
            phone_number,
            f"Something go wrong with analysis. Abeg try again. Error: {str(e)[:100]}"
        )

@router.post("/webhook/whatsapp")
async def whatsapp_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    redis = Depends(get_redis)
):
    form_data = await request.form()
    phone_number = form_data.get("From")
    body = form_data.get("Body", "")
    num_media = int(form_data.get("NumMedia", "0"))
    
    session_service = SessionService(redis)
    state = await session_service.get_state(phone_number)
    
    # Get or create user
    result = await db.execute(select(UserProfile).where(UserProfile.phone_number == phone_number))
    user = result.scalar_one_or_none()
    if not user:
        user = UserProfile(phone_number=phone_number, business_type="SME")
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
    if num_media > 0:
        media_url = form_data.get("MediaUrl0")
        content_type = form_data.get("MediaContentType0")
        media_sid = form_data.get("SmsMessageSid")
        
        # Download
        media_bytes = await whatsapp_service.download_media(media_url, media_sid)
        ext = ".pdf" if content_type == "application/pdf" else ".jpg"
        file_id = str(uuid.uuid4())
        file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}{ext}")
        
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(media_bytes)
            
        # Ingest document
        raw_text, ocr_used = ingest_document(file_path, content_type)
        
        # Save document to DB
        doc = Document(
            id=uuid.UUID(file_id),
            user_id=user.id,
            filename=f"WhatsApp_Doc_{file_id[:8]}",
            file_path=file_path,
            file_type=content_type,
            raw_text=raw_text,
            ocr_used=ocr_used
        )
        db.add(doc)
        await db.commit()
        
        # ✅ Reply immediately — don't make Twilio wait
        await whatsapp_service.send_message(
            phone_number,
            "I don get your document! I dey analyze am now... e go ready in 30-60 seconds. Abeg wait small ⏳"
        )
        await session_service.set_state(phone_number, "processing")
        
        # ✅ Run pipeline in background — return 200 to Twilio immediately
        background_tasks.add_task(
            process_whatsapp_document,
            file_id, str(user.id), phone_number, content_type, raw_text, redis
        )
        
    else:
        # Text only
        if state == "awaiting_document":
            msg = whatsapp_service.build_onboarding_message()
            await whatsapp_service.send_message(phone_number, msg)
        elif state in ("analysis_ready", "followup"):
            # Get stored analysis context from Redis
            context = await session_service.get_context(phone_number)
            analysis_id = context.get("analysis_id") if context else None
            
            if analysis_id:
                # Fetch the analysis summary from DB or Redis
                async with async_session() as session:
                    from app.models.document import DocumentAnalysis
                    import uuid
                    res = await session.execute(
                        select(DocumentAnalysis).where(DocumentAnalysis.id == uuid.UUID(analysis_id))
                    )
                    analysis = res.scalar_one_or_none()
                
                if analysis:
                    from anthropic import AsyncAnthropic
                    from app.config import settings
                    claude = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
                    
                    followup_prompt = f"""You are NaijaLex, a Nigerian legal assistant. 
A user just analyzed a contract with these results:
- Overall Risk: {analysis.overall_risk}
- Summary: {analysis.summary}
- Top Actions: {analysis.top_3_actions}

The user is now asking: "{body}"

Answer their question in friendly Lagos Pidgin English. Keep your answer short (under 200 words).
Be specific to their contract analysis. End with "Any other question? I dey here!" """

                    response = await claude.messages.create(
                        model="claude-sonnet-4-20250514",
                        max_tokens=500,
                        messages=[{"role": "user", "content": followup_prompt}]
                    )
                    reply = response.content[0].text
                    await whatsapp_service.send_message(phone_number, reply)
                    await session_service.set_state(phone_number, "followup")
                else:
                    await whatsapp_service.send_message(phone_number, "I no fit find your analysis again. Abeg send the contract again make I re-analyze am.")
            else:
                await whatsapp_service.send_message(phone_number, "Abeg send your contract first make I analyze am for you! 📄")
        else:
            await whatsapp_service.send_message(phone_number, "Abeg send me contract make I check am. I no fit talk random matter now.")

    return Response(content="OK", media_type="text/plain")
