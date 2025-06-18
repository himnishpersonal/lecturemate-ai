from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .enums import ProcessingStatus, SubjectCategory

class Lecture(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    audio_url: str
    transcript: Optional[str] = None
    notes: Optional[str] = None
    status: ProcessingStatus = ProcessingStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    duration: float = 0
    user_id: str
    folder_id: str  # Reference to the folder
    subject_category: SubjectCategory

    class Config:
        from_attributes = True

class LectureCreate(BaseModel):
    title: str
    description: Optional[str] = None
    folder_id: str  # Required folder_id when creating a lecture
    subject_category: SubjectCategory

class LectureUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    folder_id: Optional[str] = None  # Allow moving lectures between folders 