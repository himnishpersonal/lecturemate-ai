from fastapi import APIRouter, HTTPException
from app.models.flashcard import FlashcardRequest, FlashcardResponse
from app.services.flashcards import FlashcardService

router = APIRouter()
flashcard_service = FlashcardService()

@router.post("/generate", response_model=FlashcardResponse)
async def generate_flashcards(request: FlashcardRequest):
    try:
        if request.card_count not in [10, 20, 30]:
            raise HTTPException(status_code=400, detail="Card count must be 10, 20, or 30")
            
        flashcards = await flashcard_service.generate_flashcards(
            request.lecture_id,
            request.card_count
        )
        return FlashcardResponse(flashcards=flashcards)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 