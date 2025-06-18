import React, { useState } from 'react';
import { generateFlashcards } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface FlashcardData {
  question: string;
  answer: string;
}

export function FlashcardView() {
  const [content, setContent] = useState<string>('');
  const [cardCount, setCardCount] = useState<number>(10);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setIsGenerating(true);
    try {
      const response = await generateFlashcards(content, cardCount);
      setFlashcards(response.flashcards);
      setCurrentCardIndex(0);
      toast({
        title: "Flashcards generated",
        description: `Created ${response.flashcards.length} flashcards`,
      });
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: "Error generating flashcards",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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

  const handleFlip = (cardElement: HTMLDivElement) => {
    cardElement.classList.toggle('rotate-y-180');
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
            disabled={!content.trim() || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Flashcards'}
          </button>
        </div>
      </div>

      {/* Flashcard display */}
      {flashcards.length > 0 && (
        <div className="flex flex-col items-center">
          <div 
            className="w-full max-w-xl h-64 cursor-pointer perspective"
            onClick={(e) => handleFlip(e.currentTarget.children[0] as HTMLDivElement)}
          >
            <div className="relative w-full h-full transition-transform duration-500 transform-style-3d">
              {/* Front of card */}
              <div className="absolute w-full h-full bg-white rounded-xl shadow-lg p-6 backface-hidden">
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-xl font-semibold text-gray-800 text-center">
                    {flashcards[currentCardIndex].question}
                  </h3>
                  <p className="text-sm text-gray-500 mt-4">Click to flip</p>
                </div>
              </div>

              {/* Back of card */}
              <div className="absolute w-full h-full bg-white rounded-xl shadow-lg p-6 backface-hidden rotate-y-180">
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-lg text-gray-700 text-center">
                    {flashcards[currentCardIndex].answer}
                  </p>
                  <p className="text-sm text-gray-500 mt-4">Click to flip back</p>
                </div>
              </div>
            </div>
          </div>
          
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
} 