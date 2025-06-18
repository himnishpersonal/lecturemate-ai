from pydantic import BaseModel
from typing import List

class Flashcard(BaseModel):
    question: str
    answer: str

class FlashcardRequest(BaseModel):
    lecture_id: str
    card_count: int

class FlashcardResponse(BaseModel):
    flashcards: List[Flashcard] 