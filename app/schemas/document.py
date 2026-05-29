from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class DocumentBase(BaseModel):
    filename: str
    file_type: str
    document_type: Optional[str] = None
    jurisdiction: Optional[str] = None
    governing_law: Optional[str] = None
    estimated_value: Optional[int] = None

class DocumentCreate(DocumentBase):
    user_id: UUID
    file_path: str
    raw_text: str
    ocr_used: bool = False

class DocumentResponse(DocumentBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    ocr_used: bool

    model_config = ConfigDict(from_attributes=True)
