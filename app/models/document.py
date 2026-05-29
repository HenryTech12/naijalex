import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text, Boolean, ForeignKey, JSON, Integer, BigInteger
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Document(Base):
    __tablename__ = "documents"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_profiles.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    filename: Mapped[str] = mapped_column(String)
    file_path: Mapped[str] = mapped_column(String)
    file_type: Mapped[str] = mapped_column(String)
    
    raw_text: Mapped[str] = mapped_column(Text)
    ocr_used: Mapped[bool] = mapped_column(Boolean, default=False)
    
    document_type: Mapped[str] = mapped_column(String, nullable=True)
    jurisdiction: Mapped[str] = mapped_column(String, nullable=True)
    governing_law: Mapped[str] = mapped_column(String, nullable=True)
    estimated_value: Mapped[int] = mapped_column(BigInteger, nullable=True)

class DocumentAnalysis(Base):
    __tablename__ = "document_analyses"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    language_mode: Mapped[str] = mapped_column(String, default="english")
    clauses: Mapped[list] = mapped_column(JSON)
    overall_risk: Mapped[str] = mapped_column(String)
    summary: Mapped[str] = mapped_column(Text)
    top_3_actions: Mapped[list] = mapped_column(JSON)
    
    risk_card_url: Mapped[str] = mapped_column(String, nullable=True)
    processing_time_ms: Mapped[int] = mapped_column(Integer)
