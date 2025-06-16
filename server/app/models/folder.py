from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from pathlib import Path

class FolderBase(BaseModel):
    name: str
    description: Optional[str] = None

class FolderCreate(FolderBase):
    pass

class FolderUpdate(FolderBase):
    name: Optional[str] = None
    description: Optional[str] = None

class Folder(FolderBase):
    id: str
    path: str  # Store as string but handle as Path in code
    created_at: datetime
    updated_at: datetime
    lecture_count: int = 0

    class Config:
        from_attributes = True
        json_encoders = {
            Path: str  # Convert Path objects to strings for JSON serialization
        } 