import React, { useState } from 'react';

interface FlashcardProps {
  question: string;
  answer: string;
}

const Flashcard: React.FC<FlashcardProps> = ({ question, answer }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="w-full max-w-xl h-64 cursor-pointer perspective"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full bg-white rounded-xl shadow-lg p-6 backface-hidden">
          <div className="flex flex-col items-center justify-center h-full">
            <h3 className="text-xl font-semibold text-gray-800 text-center">
              {question}
            </h3>
            <p className="text-sm text-gray-500 mt-4">Click to flip</p>
          </div>
        </div>

        {/* Back of card */}
        <div className="absolute w-full h-full bg-white rounded-xl shadow-lg p-6 backface-hidden rotate-y-180">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-gray-700 text-center">{answer}</p>
            <p className="text-sm text-gray-500 mt-4">Click to flip back</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard; 