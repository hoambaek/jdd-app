import React from 'react';

const ActivityPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-400 to-pink-500">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Pretendard' }}>
          Today
        </h1>
        <p className="text-white">활동을 확인하세요!</p>
      </div>
    </div>
  );
};

export default ActivityPage; 