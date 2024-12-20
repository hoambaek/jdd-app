import styles from './Gradient.module.css';
import BottomNav from '../components/BottomNav';

export default function ChatPage() {
  return (
    <div className="min-h-screen relative">
      {/* 그라데이션 배경 */}
      <div className={styles.gradientBackground} />

      {/* 컨텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold text-white mb-2">Coming soon</h1>
        <p className="text-white/80">새로운 기능을 준비중입니다</p>
      </div>

      {/* 하단 네비게이션 */}
      <div className="relative z-10">
        <BottomNav />
      </div>
    </div>
  );
} 