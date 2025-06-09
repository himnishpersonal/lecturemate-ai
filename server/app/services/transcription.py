import whisper
import os
from typing import Tuple
import asyncio
from concurrent.futures import ThreadPoolExecutor

class TranscriptionService:
    def __init__(self):
        self.model = None
        self.executor = ThreadPoolExecutor(max_workers=1)

    async def ensure_model_loaded(self):
        """Ensure the model is loaded"""
        if self.model is None:
            print("Loading Whisper model...")
            loop = asyncio.get_event_loop()
            self.model = await loop.run_in_executor(self.executor, whisper.load_model, "base")
            print("Whisper model loaded successfully")

    async def transcribe(self, audio_path: str) -> Tuple[str, float]:
        """Transcribe audio file and return transcript and duration"""
        try:
            await self.ensure_model_loaded()
            print(f"Starting transcription of {audio_path}")
            
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(self.executor, self.model.transcribe, audio_path)
            
            transcript = result["text"]
            duration = result.get("duration", 0)
            
            print(f"Transcription completed. Duration: {duration}s")
            return transcript, duration
        except Exception as e:
            print(f"Error during transcription: {str(e)}")
            raise Exception(f"Error transcribing audio: {str(e)}")

transcription_service = TranscriptionService() 