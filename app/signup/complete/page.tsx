"use client";

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

export default function SignupComplete() {
  const router = useRouter();

  const handleConfetti = () => {
    function randomInRange(min: number, max: number): number {
      return Math.random() * (max - min) + min;
    }

    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: { spread?: number; startVelocity?: number; decay?: number; origin?: { y: number } }) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  useEffect(() => {
    for (let i = 0; i < 3; i++) {
      setTimeout(handleConfetti, i * 500); // 500ms 간격으로 3번 실행
    }
  }, []);

  const handleImageClick = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: { spread?: number; startVelocity?: number; decay?: number; scalar?: number }) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleStartClick = () => {
    router.push('/activity');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <div className="text-center flex flex-col items-center">
        <img 
          src="/con.png" 
          alt="Confetti" 
          style={{ width: '200px', height: '198px', transition: 'transform 0.2s' }}
          onClick={handleImageClick}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        <h1 className="text-4xl mt-6 font-bold text-white mb-4" style={{ fontFamily: 'KyoboHand' }}>
          가입을 축하합니다!
        </h1>
        <button
          onClick={handleStartClick}
          className="mt-5 px-6 py-2 bg-white text-blue-500 rounded-full shadow-lg hover:bg-gray-200 active:scale-95 transition-transform duration-300"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
