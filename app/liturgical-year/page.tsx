'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import Image from 'next/image';

// 전례주년 데이터
const liturgicalSeasons = [
  {
    id: 'default',
    name: '전례주년',
    color: 'gray-200',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    bgColor: 'bg-gray-100',
    iosColor: '#8E8E93',
    description: '가톨릭 교회의 전례주년을 알아보세요',
    image: '/lesson/01/1.png',
  },
  {
    id: 'ordinary',
    name: '연중 시기',
    color: 'green-500',
    textColor: 'text-green-600',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-50',
    iosColor: '#34C759',
    description: '그리스도의 신비를 전체적으로 기념하는 시기',
    image: '/lesson/01/2_green.png',
  },
  {
    id: 'advent',
    name: '대림 시기',
    color: 'purple-500',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-50',
    iosColor: '#AF52DE',
    description: '구세주 오심을 기다리며 준비하는 시기',
    image: '/lesson/01/3-purple.png',
  },
  {
    id: 'christmas',
    name: '성탄 시기',
    color: 'white',
    textColor: 'text-black',
    borderColor: 'border-gray-300',
    bgColor: 'bg-blue-50',
    iosColor: '#000000',
    description: '예수 그리스도의 탄생을 축하하는 시기',
    image: '/lesson/01/6-white.png',
  },
  {
    id: 'pentecost',
    name: '성령 강림',
    color: 'red-500',
    textColor: 'text-red-600',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-50',
    iosColor: '#FF3B30',
    description: '성령의 강림을 기념하는 대축일',
    image: '/lesson/01/4-red.png',
  },
  {
    id: 'easter',
    name: '부활 시기',
    color: 'yellow-400',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-400',
    bgColor: 'bg-yellow-50',
    iosColor: '#FFCC00',
    description: '그리스도의 부활을 기념하고 축하하는 시기',
    image: '/lesson/01/5-yellow.png',
  }
];

// 컬러 버튼 데이터
const colorButtons = [
  { id: 'white', bgColor: '#FFFFFF', borderColor: '#E5E5EA', season: 'christmas', iosColor: '#FFFFFF' },
  { id: 'green', bgColor: '#34C759', borderColor: '#34C759', season: 'ordinary', iosColor: '#34C759' },
  { id: 'purple', bgColor: '#AF52DE', borderColor: '#AF52DE', season: 'advent', iosColor: '#AF52DE' },
  { id: 'red', bgColor: '#FF3B30', borderColor: '#FF3B30', season: 'pentecost', iosColor: '#FF3B30' },
  { id: 'yellow', bgColor: '#FFCC00', borderColor: '#FFCC00', season: 'easter', iosColor: '#FFCC00' },
];

// 파티클 생성 함수
const generateParticles = (count: number) => {
  // iOS 컬러 배열
  const iosColors = [
    'rgba(255, 59, 48, 0.8)',    // Red
    'rgba(255, 204, 0, 0.8)',    // Yellow
    'rgba(52, 199, 89, 0.8)',    // Green
    'rgba(0, 122, 255, 0.8)',    // Blue
    'rgba(175, 82, 222, 0.8)',   // Purple
    'rgba(255, 149, 0, 0.8)',    // Orange
    'rgba(90, 200, 250, 0.8)',   // Light Blue
    'rgba(88, 86, 214, 0.8)',    // Indigo
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 3,
    duration: Math.random() * 2 + 1,
    delay: Math.random() * 0.5,
    color: iosColors[Math.floor(Math.random() * iosColors.length)],
  }));
};

export default function LiturgicalYearPage() {
  const [step, setStep] = useState(0); // 0: 초기, 1: 이미지 클릭 후, 2: 버튼 선택 가능
  const [selectedSeason, setSelectedSeason] = useState('default');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showClickHint, setShowClickHint] = useState(false);
  const [showButtonHint, setShowButtonHint] = useState(false);
  const [particles, setParticles] = useState(generateParticles(30));
  const imageRef = useRef<HTMLDivElement>(null);
  
  // 현재 선택된 시기 정보
  const currentSeason = liturgicalSeasons.find(season => season.id === selectedSeason) || liturgicalSeasons[0];

  useEffect(() => {
    // 초기 이미지 로드 후 클릭 힌트 표시
    if (step === 0) {
      const timer = setTimeout(() => {
        setShowClickHint(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    
    // 버튼 표시 후 첫 번째 버튼 클릭 힌트 표시
    if (step === 2) {
      const timer = setTimeout(() => {
        setShowButtonHint(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [step]);

  // 이미지 클릭 핸들러
  const handleImageClick = () => {
    if (step === 0) {
      setShowClickHint(false);
      setIsTransitioning(true);
      // 새로운 파티클 생성
      setParticles(generateParticles(30));
      
      setTimeout(() => {
        setStep(1);
        setSelectedSeason('default');
        setIsTransitioning(false);
        
        // 버튼 표시 애니메이션을 위한 타이머
        setTimeout(() => {
          setStep(2);
        }, 1000);
      }, 1500);
    }
  };

  // 시즌 변경 핸들러
  const handleSeasonChange = (seasonId: string) => {
    if (step < 2 || selectedSeason === seasonId) return;
    
    setShowButtonHint(false);
    setIsTransitioning(true);
    // 새로운 파티클 생성
    setParticles(generateParticles(30));
    
    setTimeout(() => {
      setSelectedSeason(seasonId);
      setIsTransitioning(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* iOS 스타일 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-center text-[#000000] mb-1">전례주년</h1>
          <p className="text-center text-[#8E8E93] text-base">
            {step === 0 ? '우리 보좌신부님을 깨워서 전례주년에 대해 알아봐요!' : 
             step === 1 ? '잠시만 기다려주세요...' : 
             '가톨릭 교회는 전례주년에 따라 다른 색깔의 제의를 입습니다.\n각 색깔은 특별한 의미를 담고 있어요!'}
          </p>
          
          {/* 설명 텍스트를 헤더 아래로 이동 */}
          
        </div>
        
        {/* 캐릭터 이미지 및 설명 */}
        <div className="relative flex flex-col items-center justify-center mb-12">
          {/* 캐릭터 이미지 */}
          <div 
            ref={imageRef}
            className={`relative w-64 h-64 md:w-80 md:h-80 ${step === 0 ? 'cursor-pointer' : ''}`}
            onClick={handleImageClick}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step === 0 ? 'initial' : selectedSeason}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { 
                    duration: 0.8,
                    ease: "easeInOut"
                  }
                }}
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* 변신 효과 - 파티클 */}
                {isTransitioning && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    {particles.map((particle) => (
                      <motion.div
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{
                          left: `calc(50% + ${particle.x - 50}%)`,
                          top: `calc(50% + ${particle.y - 50}%)`,
                          width: `${particle.size}px`,
                          height: `${particle.size}px`,
                          background: particle.color,
                          boxShadow: `0 0 10px ${particle.color}, 0 0 20px ${particle.color}`,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: [0, 1.5, 0],
                          opacity: [0, 1, 0],
                          x: [0, (Math.random() - 0.5) * 250],
                          y: [0, (Math.random() - 0.5) * 250],
                        }}
                        transition={{
                          duration: particle.duration,
                          delay: particle.delay,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </div>
                )}
                
                {/* 실제 이미지 */}
                <div className="relative w-full h-full">
                  {step === 0 ? (
                    <Image
                      src="/lesson/01/0.png"
                      alt="시작 이미지"
                      fill
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: 1,
                        rotate: [0, 5, 0, -5, 0],
                      }}
                      transition={{ 
                        opacity: { duration: 0.5 },
                        rotate: {
                          repeat: Infinity, 
                          duration: 4,
                          times: [0, 0.25, 0.5, 0.75, 1],
                          ease: "easeInOut",
                          repeatDelay: 0.2
                        }
                      }}
                      className="w-full h-full"
                    >
                      <Image
                        src={currentSeason.image}
                        alt={currentSeason.name}
                        fill
                        className="object-contain"
                        priority
                      />
                    </motion.div>
                  )}
                  
                  {/* 클릭 힌트 - 손가락 아이콘 */}
                  {step === 0 && showClickHint && (
                    <motion.div 
                      className="absolute bottom-10 right-10 z-10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        y: [0, -10, 0],
                        x: [0, -10, 0]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        repeatType: "reverse" 
                      }}
                    >
                      <div className="bg-white/80 backdrop-blur-md rounded-full p-2 shadow-md">
                        <Image
                          src="/finger.png"
                          alt="클릭 아이콘"
                          width={40}
                          height={40}
                          className="transform"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* 말풍선 설명 박스 - 단계 2에서만 표시 (iOS 스타일) */}
          {step === 2 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSeason}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderColor: currentSeason.iosColor,
                  borderLeftWidth: '4px'
                }}
                className="backdrop-blur-lg rounded-xl shadow-sm p-4 mb-4 w-full max-w-md text-left relative mt-6"
              >
                {/* iOS 스타일 말풍선 꼬리 */}
                <div 
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rotate-45"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  }}
                ></div>
                
                <h2 
                  className="text-xl font-semibold mb-1"
                  style={{ color: currentSeason.iosColor }}
                >
                  {currentSeason.name}
                </h2>
                <p className="text-[#3A3A3C]">{currentSeason.description}</p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
        
        {/* 컬러 버튼 - 단계 2에서만 표시 (iOS 스타일) */}
        {step === 2 && (
          <motion.div 
            className="flex justify-center space-x-4 mb-8 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {colorButtons.map((button, index) => (
              <motion.div key={button.id} className="relative">
                <motion.button
                  onClick={() => handleSeasonChange(button.season)}
                  style={{ 
                    backgroundColor: button.bgColor,
                    borderColor: button.borderColor,
                    boxShadow: selectedSeason === button.season 
                      ? `0 0 0 3px rgba(0, 122, 255, 0.3)` 
                      : `0 2px 8px rgba(0, 0, 0, 0.1)`
                  }}
                  className="w-14 h-14 rounded-full border-2 focus:outline-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                />
                
                {/* 첫 번째 버튼에 클릭 힌트 추가 */}
                {index === 0 && showButtonHint && (
                  <motion.div 
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ 
                      opacity: 1, 
                      y: [5, -5, 5]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }}
                  >
                    <div className="bg-white/80 backdrop-blur-md rounded-full p-2 shadow-sm">
                      <Image
                        src="/finger.png"
                        alt="클릭 아이콘"
                        width={50}
                        height={50}
                        className="transform"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      <BottomNav />
      
      {/* 애니메이션을 위한 스타일 */}
      <style jsx global>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); box-shadow: 0 0 20px currentColor; }
        }
        .sparkle {
          animation: sparkle 1s ease-in-out infinite;
        }
        
        /* iOS 스타일 폰트 적용 */
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
} 