import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Flashcard from './Flashcard';

interface FlashcardData {
  question: string;
  answer: string;
}

const FlashcardView: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [cardCount, setCardCount] = useState<number>(10);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);

  // Generate flashcards mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/flashcards/generate', {
        lecture_id: content, // Using content directly as lecture_id for now
        card_count: cardCount,
      });
      return response.data.flashcards;
    },
    onSuccess: (data) => {
      setFlashcards(data);
      setCurrentCardIndex(0);
    },
  });

  const handleGenerate = () => {
    if (content.trim()) {
      generateMutation.mutate();
    }
  };

  const handleNext = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Flashcard Generator</h2>
        
        {/* Controls */}
        <div className="flex flex-col gap-4 mb-8">
          <textarea
            className="w-full h-48 p-4 border rounded resize-none"
            placeholder="Paste your lecture content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <select
            className="p-2 border rounded"
            value={cardCount}
            onChange={(e) => setCardCount(Number(e.target.value))}
          >
            <option value={10}>10 cards</option>
            <option value={20}>20 cards</option>
            <option value={30}>30 cards</option>
          </select>
          
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            onClick={handleGenerate}
            disabled={!content.trim() || generateMutation.isPending}
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate Flashcards'}
          </button>
        </div>
      </div>

      {/* Flashcard display */}
      {flashcards.length > 0 && (
        <div className="flex flex-col items-center">
          <Flashcard
            question={flashcards[currentCardIndex].question}
            answer={flashcards[currentCardIndex].answer}
          />
          
          <div className="flex gap-4 mt-6">
            <button
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:bg-gray-100"
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
            >
              Previous
            </button>
            <span className="py-2">
              {currentCardIndex + 1} / {flashcards.length}
            </span>
            <button
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:bg-gray-100"
              onClick={handleNext}
              disabled={currentCardIndex === flashcards.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardView; 