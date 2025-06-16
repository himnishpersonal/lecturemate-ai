from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid
from pathlib import Path
from ..models.folder import Folder, FolderCreate, FolderUpdate
from ..utils.path_utils import PathManager

router = APIRouter()

# In-memory storage for folders (replace with database in production)
folders = {}
# In-memory storage for user paths
user_storage_paths = {}

def get_user_storage_path(user_id: str) -> Path:
    """Get the user's storage path from memory"""
    if user_id not in user_storage_paths:
        raise HTTPException(status_code=400, detail="Storage path not set. Please configure storage location in settings.")
    return Path(user_storage_paths[user_id])

@router.post("/storage/path")
async def set_storage_path(user_id: str, path: str):
    """Set the storage path for a user"""
    try:
        # Sanitize and validate the path
        base_path = PathManager.sanitize_path(path)
        
        # Ensure user directory exists
        user_path = PathManager.ensure_user_path(user_id, base_path)
        
        # Store the absolute path in memory
        user_storage_paths[user_id] = str(user_path.resolve())
        return {"message": "Storage path set successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/folders", response_model=Folder)
async def create_folder(folder: FolderCreate, user_id: str):
    """Create a new folder both in-memory and in the file system"""
    try:
        # Check if user has a storage path set
        if user_id not in user_storage_paths:
            raise HTTPException(
                status_code=400, 
                detail="Storage path not set. Please configure storage location in settings first."
            )
        
        folder_id = str(uuid.uuid4())
        current_time = datetime.now()
        
        # Get user's storage path
        base_path = get_user_storage_path(user_id)
        
        try:
            # Create physical folder with sanitized name
            folder_path = PathManager.create_folder_path(base_path, folder.name)
            
            new_folder = Folder(
                id=folder_id,
                name=folder.name,
                description=folder.description,
                created_at=current_time,
                updated_at=current_time,
                lecture_count=0,
                path=str(folder_path)  # Store as string
            )
            
            folders[folder_id] = new_folder
            return new_folder
        except Exception as e:
            # Clean up if folder was partially created
            try:
                if 'folder_path' in locals():
                    folder_path.rmdir()
            except:
                pass
            raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating folder: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/folders", response_model=List[Folder])
async def list_folders(user_id: str):
    """List all folders for a user"""
    try:
        # Check if user has a storage path set
        if user_id not in user_storage_paths:
            # Return empty list if no storage path is set
            return []
            
        base_path = get_user_storage_path(user_id)
        # Only return folders that exist in the user's storage path
        return [
            folder for folder in folders.values()
            if Path(folder.path).is_relative_to(base_path)
        ]
    except Exception as e:
        print(f"Error listing folders: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/folders/{folder_id}", response_model=Folder)
async def get_folder(folder_id: str, user_id: str):
    """Get folder by ID"""
    if folder_id not in folders:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    folder = folders[folder_id]
    base_path = get_user_storage_path(user_id)
    
    # Verify folder belongs to user
    if not Path(folder.path).is_relative_to(base_path):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return folder

@router.put("/folders/{folder_id}", response_model=Folder)
async def update_folder(folder_id: str, folder_update: FolderUpdate, user_id: str):
    """Update folder"""
    if folder_id not in folders:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    current_folder = folders[folder_id]
    base_path = get_user_storage_path(user_id)
    current_path = Path(current_folder.path)
    
    # Verify folder belongs to user
    if not current_path.is_relative_to(base_path):
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # If name is being updated, rename the physical folder
        if folder_update.name and folder_update.name != current_folder.name:
            new_path = PathManager.create_folder_path(base_path, folder_update.name)
            current_path.rename(new_path)
            current_folder.path = str(new_path)
        
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
    folder_path = Path(folder.path)
    
    # Verify folder belongs to user
    if not folder_path.is_relative_to(base_path):
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Delete physical folder and all its contents
        if folder_path.exists():
            import shutil
            shutil.rmtree(folder_path)
        
        # Remove from in-memory storage
        del folders[folder_id]
        return {"message": "Folder deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 