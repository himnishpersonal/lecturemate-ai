import os
from fastapi import UploadFile
from datetime import datetime
import uuid
import shutil

class StorageService:
    def __init__(self):
        pass  # No need for upload_dir anymore as we use user's directory

    async def ensure_directory_exists(self, directory: str):
        """Ensure a directory exists"""
        os.makedirs(directory, exist_ok=True)

    async def save_file(self, file: UploadFile, target_path: str) -> str:
        """Save file to the specified path"""
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            
            # Save the file
            with open(target_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            return target_path
        except Exception as e:
            raise Exception(f"Error saving file: {str(e)}")
            
    async def delete_file(self, file_path: str) -> None:
        """Delete a file from storage"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            raise Exception(f"Error deleting file: {str(e)}")

# Initialize the storage service
storage_service = StorageService()
