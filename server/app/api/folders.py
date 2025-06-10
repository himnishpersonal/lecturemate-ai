from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid

from ..models.folder import Folder, FolderCreate, FolderUpdate

router = APIRouter()

# In-memory storage for folders (replace with database in production)
folders = {}

@router.post("/folders", response_model=Folder)
async def create_folder(folder: FolderCreate):
    """Create a new folder"""
    folder_id = str(uuid.uuid4())
    current_time = datetime.now()
    
    new_folder = Folder(
        id=folder_id,
        name=folder.name,
        description=folder.description,
        created_at=current_time,
        updated_at=current_time,
        lecture_count=0
    )
    
    folders[folder_id] = new_folder
    return new_folder

@router.get("/folders", response_model=List[Folder])
async def list_folders():
    """List all folders"""
    return list(folders.values())

@router.get("/folders/{folder_id}", response_model=Folder)
async def get_folder(folder_id: str):
    """Get folder by ID"""
    if folder_id not in folders:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folders[folder_id]

@router.put("/folders/{folder_id}", response_model=Folder)
async def update_folder(folder_id: str, folder_update: FolderUpdate):
    """Update folder"""
    if folder_id not in folders:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    current_folder = folders[folder_id]
    update_data = folder_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_folder, field, value)
    
    current_folder.updated_at = datetime.now()
    return current_folder

@router.delete("/folders/{folder_id}")
async def delete_folder(folder_id: str):
    """Delete folder"""
    if folder_id not in folders:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Check if folder has lectures (implement this check when lectures are added)
    # if folder has lectures:
    #     raise HTTPException(status_code=400, detail="Cannot delete folder with lectures")
    
    del folders[folder_id]
    return {"message": "Folder deleted successfully"} 