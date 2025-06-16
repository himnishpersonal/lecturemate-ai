from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid
import os
import shutil
from ..models.folder import Folder, FolderCreate, FolderUpdate

router = APIRouter()

# In-memory storage for folders (replace with database in production)
folders = {}
# In-memory storage for user paths
user_storage_paths = {}

def get_user_storage_path(user_id: str) -> str:
    """Get the user's storage path from memory"""
    if user_id not in user_storage_paths:
        raise HTTPException(status_code=400, detail="Storage path not set. Please configure storage location in settings.")
    return user_storage_paths[user_id]

@router.post("/storage/path")
async def set_storage_path(user_id: str, path: str):
    """Set the storage path for a user"""
    try:
        # Verify the path exists
        if not os.path.exists(path):
            raise HTTPException(status_code=400, detail="Directory does not exist")
        
        # Store the path in memory
        user_storage_paths[user_id] = path
        return {"message": "Storage path set successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/folders", response_model=Folder)
async def create_folder(folder: FolderCreate, user_id: str):
    """Create a new folder both in-memory and in the file system"""
    folder_id = str(uuid.uuid4())
    current_time = datetime.now()
    
    # Get user's storage path
    base_path = get_user_storage_path(user_id)
    
    # Create physical folder
    folder_path = os.path.join(base_path, folder.name)
    try:
        if os.path.exists(folder_path):
            raise HTTPException(status_code=400, detail="Folder already exists")
        
        # Create the physical folder
        os.makedirs(folder_path)
        
        new_folder = Folder(
            id=folder_id,
            name=folder.name,
            description=folder.description,
            created_at=current_time,
            updated_at=current_time,
            lecture_count=0,
            path=folder_path  # Store the physical path
        )
        
        folders[folder_id] = new_folder
        return new_folder
    except Exception as e:
        # Clean up if folder was partially created
        if os.path.exists(folder_path):
            shutil.rmtree(folder_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/folders", response_model=List[Folder])
async def list_folders(user_id: str):
    """List all folders for a user"""
    try:
        base_path = get_user_storage_path(user_id)
        # Only return folders that exist in the user's storage path
        return [
            folder for folder in folders.values()
            if folder.path.startswith(base_path)
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/folders/{folder_id}", response_model=Folder)
async def get_folder(folder_id: str, user_id: str):
    """Get folder by ID"""
    if folder_id not in folders:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    folder = folders[folder_id]
    base_path = get_user_storage_path(user_id)
    
    # Verify folder belongs to user
    if not folder.path.startswith(base_path):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return folder

@router.put("/folders/{folder_id}", response_model=Folder)
async def update_folder(folder_id: str, folder_update: FolderUpdate, user_id: str):
    """Update folder"""
    if folder_id not in folders:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    current_folder = folders[folder_id]
    base_path = get_user_storage_path(user_id)
    
    # Verify folder belongs to user
    if not current_folder.path.startswith(base_path):
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # If name is being updated, rename the physical folder
        if folder_update.name and folder_update.name != current_folder.name:
            old_path = current_folder.path
            new_path = os.path.join(base_path, folder_update.name)
            
            if os.path.exists(new_path):
                raise HTTPException(status_code=400, detail="A folder with this name already exists")
            
            # Rename the physical folder
            os.rename(old_path, new_path)
            current_folder.path = new_path
        
        # Update other fields
        update_data = folder_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(current_folder, field, value)
        
        current_folder.updated_at = datetime.now()
        return current_folder
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/folders/{folder_id}")
async def delete_folder(folder_id: str, user_id: str):
    """Delete folder"""
    if folder_id not in folders:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    folder = folders[folder_id]
    base_path = get_user_storage_path(user_id)
    
    # Verify folder belongs to user
    if not folder.path.startswith(base_path):
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Delete physical folder and all its contents
        if os.path.exists(folder.path):
            shutil.rmtree(folder.path)
        
        # Remove from in-memory storage
        del folders[folder_id]
        return {"message": "Folder deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 