import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text, ForeignKey, BigInteger
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class SessionHistory(Base):
    __tablename__ = "session_history"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_profiles.id"))
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    channel: Mapped[str] = mapped_column(String) # web/whatsapp
    summary_text: Mapped[str] = mapped_column(Text)
    
    whatsapp_message_sid: Mapped[str] = mapped_column(String, nullable=True)
