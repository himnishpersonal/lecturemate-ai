import json
from typing import List
import aiohttp
from app.models.flashcard import Flashcard
from app.models.lecture import Lecture

class FlashcardService:
    def __init__(self):
        print("Initializing Ollama client...")
        self.api_url = "https://ollama.snagaquadart.com/api/generate"
        print("Ollama client initialized successfully")

    async def generate_flashcards(self, lecture_id: str, card_count: int) -> List[Flashcard]:
        content = lecture_id  # Using lecture_id as content directly for now

        prompt = f"""You are an AI tutor creating {card_count} flashcards from lecture content to help a student review the material. 
Your goal is to extract important facts, definitions, and key concepts. For each flashcard, create a concise question and a clear, factual answer.
Do not include any filler or explanations. Format your response as a JSON array of flashcards, where each flashcard has two fields: question and answer.

Guidelines:
- Only include helpful study flashcards
- Prioritize academic clarity
- Limit answers to 1-2 sentences max
- Do not include introductory or summary text
- Strictly return only the JSON array
- Generate exactly {card_count} flashcards

Content to process:
{content}

Return the response in this exact format:
[
  {{
    "question": "What is X?",
    "answer": "X is Y."
  }},
  ...
]"""

        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "model": "gemma3:4b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.95,
                        "top_k": 40,
                        "num_ctx": 32768,
                        "max_tokens": 4000
                    }
                }
                
                async with session.post(self.api_url, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise Exception(f"API request failed with status {response.status}: {error_text}")
                    
                    result = await response.json()
                    response_text = result.get("response", "").strip()
                    
                    # Parse the JSON response
                    flashcards_data = json.loads(response_text)
                    
                    # Convert to Flashcard objects
                    flashcards = [
                        Flashcard(question=card["question"], answer=card["answer"])
                        for card in flashcards_data
                    ]
                    
                    return flashcards[:card_count]  # Ensure we return exactly the requested number
                    
        except json.JSONDecodeError:
            raise ValueError("Failed to parse flashcards from model response")
        except Exception as e:
            print(f"Ollama API error: {str(e)}")
            raise Exception(f"Error generating flashcards: {str(e)}") 