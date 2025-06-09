import os
from fastapi import UploadFile
from datetime import datetime
import uuid
import shutil

class StorageService:
    def __init__(self, upload_dir: str = "local_uploads"):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    async def upload_file(self, file: UploadFile, user_id: str) -> str:
        """Save uploaded file locally and return the file path"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{user_id}_{timestamp}_{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(self.upload_dir, unique_filename)

        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Return the actual file path instead of URL
            return file_path
        except Exception as e:
            raise Exception(f"Error saving file locally: {str(e)}")
            
    async def delete_file(self, file_path: str) -> None:
        """Delete a file from storage"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            raise Exception(f"Error deleting file: {str(e)}")

# Initialize the storage service
storage_service = StorageService()
