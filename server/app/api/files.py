from fastapi import APIRouter, HTTPException
from typing import Dict
import os

router = APIRouter()

@router.get("/files/read")
async def read_file(path: str) -> Dict[str, str]:
    """Read file contents from a physical path"""
    try:
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="File not found")
            
        # Read file contents
        with open(path, 'r') as f:
            content = f.read()
            
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
 