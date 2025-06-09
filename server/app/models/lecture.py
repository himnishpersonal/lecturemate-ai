from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class ProcessingStatus(str, Enum):
    PENDING = "pending"
    TRANSCRIBING = "transcribing"
    GENERATING_NOTES = "generating_notes"
    COMPLETED = "completed"
    FAILED = "failed"

class Lecture(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    audio_url: str
    transcript: Optional[str] = None
    notes: Optional[str] = None
    status: ProcessingStatus = ProcessingStatus.PENDING
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    duration: Optional[float] = None
    user_id: str 