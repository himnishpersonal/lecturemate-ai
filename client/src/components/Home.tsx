import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to LectureMate AI</h1>
      <p className="text-gray-600">
        Upload your lectures and let AI help you create study materials.
      </p>
    </div>
  );
};

export default Home; 