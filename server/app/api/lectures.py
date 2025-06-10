from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form
from ..models.lecture import Lecture, ProcessingStatus
from ..services.storage import storage_service
from ..services.transcription import transcription_service
from ..services.notes import notes_service
import uuid
from typing import List, Optional
from datetime import datetime


router = APIRouter()

# In-memory storage for demo (replace with database in production)
lectures = {}

async def process_lecture(lecture_id: str):
    """Background task to process the lecture"""
    lecture = lectures[lecture_id]
    
    try:
        print(f"Starting background processing for lecture {lecture_id}")
        # Update status to transcribing
        lecture.status = ProcessingStatus.TRANSCRIBING
        print(f"Status updated to {lecture.status}")
        
        # Transcribe the audio file
        print(f"Starting transcription of audio file: {lecture.audio_url}")
        transcript, duration = await transcription_service.transcribe(lecture.audio_url)
        print(f"Transcription completed. Length: {len(transcript)} chars, Duration: {duration}s")
        
        # Update lecture with transcript and duration
        lecture.transcript = transcript
        lecture.duration = duration
        
        # Generate notes from transcript
        print(f"Generating notes for lecture {lecture_id}")
        lecture.status = ProcessingStatus.GENERATING_NOTES
        notes = await notes_service.generate_notes(transcript, lecture.title)
        lecture.notes = notes
        print(f"Notes generation completed. Length: {len(notes)} chars")
        
        # Mark as completed
        lecture.status = ProcessingStatus.COMPLETED
        print(f"Lecture {lecture_id} processing completed successfully")
        
    except Exception as e:
        print(f"Error processing lecture {lecture_id}: {str(e)}")
        lecture.status = ProcessingStatus.FAILED
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/lectures/upload", response_model=Lecture)
async def upload_lecture(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    folder_id: str = Form(...),  # Make folder_id required form field
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None)
):
    """Upload a new lecture audio file and start processing"""
    print(f"Received form data - folder_id: {folder_id}, title: {title}")  # Debug log
    
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    try:
        # Use a default user_id if none provided
        effective_user_id = user_id or "default_user"
        
        # Upload file to storage
        audio_url = await storage_service.upload_file(file, effective_user_id)
        
        # Create new lecture with required fields
        lecture_id = str(uuid.uuid4())
        current_time = datetime.now()
        
        # Create lecture dictionary with all required fields
        lecture_data = {
            "id": lecture_id,
            "title": title or file.filename,
            "description": description,
            "audio_url": audio_url,
            "user_id": effective_user_id,
            "folder_id": folder_id,
            "status": ProcessingStatus.PENDING,
            "created_at": current_time,
            "updated_at": current_time,
            "duration": 0,
            "transcript": None,
            "notes": None
        }
        
        print(f"Creating lecture with data: {lecture_data}")  # Debug log
        
        # Create lecture instance
        lecture = Lecture(**lecture_data)
        
        # Store lecture
        lectures[lecture_id] = lecture
        
        # Start background processing
        background_tasks.add_task(process_lecture, lecture_id)
        
        return lecture
    
    except Exception as e:
        print(f"Error in upload_lecture: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/lectures/{lecture_id}", response_model=Lecture)
async def get_lecture(lecture_id: str):
    """Get lecture by ID"""
    if lecture_id not in lectures:
        raise HTTPException(status_code=404, detail="Lecture not found")
    return lectures[lecture_id]

@router.get("/lectures", response_model=List[Lecture])
async def list_lectures(user_id: str = None):
    """List all lectures for a user"""
    if user_id:
        return [lecture for lecture in lectures.values() if lecture.user_id == user_id]
    return list(lectures.values())

@router.delete("/lectures/{lecture_id}")
async def delete_lecture(lecture_id: str):
    """Delete a lecture by ID"""
    if lecture_id not in lectures:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    try:
        # Delete the audio file from storage
        lecture = lectures[lecture_id]
        await storage_service.delete_file(lecture.audio_url)
        
        # Remove from in-memory storage
        del lectures[lecture_id]
        
        return {"message": "Lecture deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 