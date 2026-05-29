from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.deps import get_db
from app.models.document import DocumentAnalysis, Document
from app.services.risk_card import generate_risk_card
import uuid
from datetime import datetime

router = APIRouter(tags=["Risk Cards"])

@router.get("/risk-card/{analysis_id}")
async def get_risk_card(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    # Get analysis
    result = await db.execute(
        select(DocumentAnalysis).where(DocumentAnalysis.id == analysis_id)
    )
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    if analysis.risk_card_url and os.path.exists(analysis.risk_card_url):
        return FileResponse(analysis.risk_card_url, media_type="application/pdf")
        
    # Get doc info for card
    doc_result = await db.execute(select(Document).where(Document.id == analysis.document_id))
    doc = doc_result.scalar_one_or_none()
    
    card_data = {
        "document_type": doc.document_type or "Legal Document",
        "date": analysis.created_at.strftime("%Y-%m-%d"),
        "overall_risk": analysis.overall_risk,
        "clauses": analysis.clauses,
        "top_3_actions": analysis.top_3_actions
    }
    
    pdf_path = generate_risk_card(str(analysis.id), card_data)
    
    # Save back to DB
    analysis.risk_card_url = pdf_path
    await db.commit()
    
    return FileResponse(pdf_path, media_type="application/pdf")

import os
