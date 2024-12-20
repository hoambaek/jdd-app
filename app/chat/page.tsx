import BottomNav from '../components/BottomNav';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Coming soon</h1>
          <p className="text-white/80">새로운 기능을 준비중입니다</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
} 