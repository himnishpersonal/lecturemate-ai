from pydantic import BaseModel
from typing import List
from datetime import datetime

class Folder(BaseModel):
    id: str
    name: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime
    lecture_count: int = 0
    
class FolderCreate(BaseModel):
    name: str
    description: str | None = None

class FolderUpdate(BaseModel):
    name: str | None = None
    description: str | None = None 