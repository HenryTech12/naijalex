from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class UserProfileBase(BaseModel):
    phone_number: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    risk_tolerance: str = "medium"
    typical_contracts: List[str] = []

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    session_count: int
    last_seen: datetime

    model_config = ConfigDict(from_attributes=True)
