import React from 'react';

const ChatPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow-lg p-8 max-w-md text-center">
        <h1 className="text-4xl font-bold text-white mb-4">공사중!</h1>
        <p className="text-lg text-white mb-6">
          
        </p>
        <div className="flex justify-center">
          <img
            src="/under_construction.png"
            alt="Under Construction"
            className="w-64 h-64 opacity-100"
          />
        </div>
        <p className="text-sm text-white mt-4">
          
        </p>
      </div>
    </div>
  );
};

export default ChatPage; 