from pathlib import Path
from typing import Optional
import os
from fastapi import HTTPException

class PathManager:
    @staticmethod
    def sanitize_path(path: str) -> Path:
        """
        Sanitize and resolve a path string to an absolute Path object.
        Prevents directory traversal and ensures the path is absolute.
        """
        try:
            # Convert to Path object and resolve to absolute path
            path_obj = Path(path).resolve()
            
            # Basic security checks
            if not path_obj.exists():
                raise HTTPException(status_code=400, detail="Path does not exist")
            
            if not path_obj.is_dir():
                raise HTTPException(status_code=400, detail="Path is not a directory")
                
            return path_obj
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid path: {str(e)}")
    
    @staticmethod
    def ensure_user_path(user_id: str, base_path: Path) -> Path:
        """
        Ensure user's directory exists and return the Path object.
        """
        user_path = base_path / str(user_id)
        user_path.mkdir(parents=True, exist_ok=True)
        return user_path
    
    @staticmethod
    def create_folder_path(base_path: Path, folder_name: str) -> Path:
        """
        Create a new folder path and ensure it's valid.
        Returns an absolute path.
        """
        # Remove any potentially dangerous characters
        safe_name = "".join(c for c in folder_name if c.isalnum() or c in (' ', '-', '_'))
        folder_path = (base_path / safe_name).resolve()
        
        if folder_path.exists():
            raise HTTPException(status_code=400, detail="Folder already exists")
            
        folder_path.mkdir(parents=True, exist_ok=True)
        return folder_path
    
    @staticmethod
    def get_relative_path(path: Path, base_path: Path) -> str:
        """
        Get the relative path from base_path to path.
        Useful for storing relative paths in the database.
        """
        try:
            # Ensure both paths are absolute
            abs_path = path.resolve()
            abs_base = base_path.resolve()
            return str(abs_path.relative_to(abs_base))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid path relationship")
    
    @staticmethod
    def join_paths(*paths: str) -> Path:
        """
        Safely join path components and return a Path object.
        """
        return Path(*paths).resolve()
    
    @staticmethod
    def create_lecture_directory(folder_path: Path, lecture_id: str) -> Path:
        """
        Create and return a lecture directory path.
        """
        lecture_path = folder_path / lecture_id
        lecture_path.mkdir(parents=True, exist_ok=True)
        return lecture_path 