from pydantic import BaseModel
from typing import Optional

class WhatsAppMessage(BaseModel):
    SmsMessageSid: str
    NumMedia: int
    ProfileName: str
    MessageType: str
    From: str
    To: str
    Body: str
    MediaUrl0: Optional[str] = None
    MediaContentType0: Optional[str] = None
