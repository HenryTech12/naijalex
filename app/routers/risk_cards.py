from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.deps import get_db
from app.models.document import DocumentAnalysis, Document
from app.services.risk_card import generate_risk_card
import uuid

router = APIRouter(tags=["Risk Cards"])

@router.get("/risk-card/{analysis_id}")
async def get_risk_card(
    analysis_id: uuid.UUID,
    redirect: bool = False,
    refresh: bool = False,
    db: AsyncSession = Depends(get_db)
):
    # Get analysis
    result = await db.execute(
        select(DocumentAnalysis).where(DocumentAnalysis.id == analysis_id)
    )
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    if analysis.risk_card_url and not refresh:
        if redirect:
            return RedirectResponse(url=analysis.risk_card_url)
        return {"analysis_id": str(analysis.id), "risk_card_url": analysis.risk_card_url}
        
    # Get doc info for card
    doc_result = await db.execute(select(Document).where(Document.id == analysis.document_id))
    doc = doc_result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    card_data = {
        "document_type": doc.document_type or "Legal Document",
        "date": analysis.created_at.strftime("%Y-%m-%d"),
        "overall_risk": analysis.overall_risk,
        "clauses": analysis.clauses,
        "top_3_actions": analysis.top_3_actions
    }
    
    try:
        pdf_url = generate_risk_card(str(analysis.id), card_data)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    
    # Save back to DB
    analysis.risk_card_url = pdf_url
    await db.commit()

    if redirect:
        return RedirectResponse(url=pdf_url)
    return {"analysis_id": str(analysis.id), "risk_card_url": pdf_url}
