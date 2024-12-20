'use client';

import BottomNav from '../components/BottomNav';

export default function ChatPage() {
  return (
    <div 
      className="min-h-screen p-4 pb-24"
      style={{
        background: `
          linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px),
          #f9f5eb
        `,
        backgroundSize: '20px 20px',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.1)'
      }}
    >
      <div className="relative min-h-[calc(100vh-200px)] mb-20">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          준비중입니다
        </div>
      </div>

      <BottomNav />
    </div>
  );
} 