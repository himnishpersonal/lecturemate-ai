from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
from .api.lectures import router as lectures_router
from .api import folders
import os

app = FastAPI(
    title="LectureMate AI API",
    description="Backend API for LectureMate AI - Lecture transcription and notes generation",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Allow both Next.js and Vite ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(lectures_router, prefix="/api", tags=["lectures"])
app.include_router(folders.router, prefix="/api")

# Create uploads directory if it doesn't exist
os.makedirs("local_uploads", exist_ok=True)

# Mount static file handler for uploads
app.mount("/files", StaticFiles(directory="local_uploads"), name="files")

@app.get("/")
async def root():
    return {"message": "Welcome to LectureMate AI API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
