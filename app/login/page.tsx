"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { supabase } from '../../utils/supabaseClient'; // Supabase 클라이언트 가져오기

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    } else {
      router.push('/activity'); // 로그인 성공 시 대시보드로 이동
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <div className="text-center flex flex-col items-center w-80 space-y-4">
        <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Pretendard' }}>
          로그인
        </h1>
        <div className={`relative w-full ${error ? 'animate-shake' : ''}`} style={{ marginBottom: '0.25rem !important' }}>
          <input
            type="text"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-white rounded-full p-2 w-full pr-10 pl-4 text-left"
            style={{ backgroundColor: 'transparent', color: '#ffffff', outline: 'none' }}
            onFocus={(e) => e.target.placeholder = ''}
            onBlur={(e) => e.target.placeholder = '이메일'}
          />
          <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" />
        </div>
        <div className={`relative w-full ${error ? 'animate-shake' : ''}`} style={{ marginBottom: '3rem !important' }}>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-white rounded-full p-2 w-full pr-10 pl-4 text-left"
            style={{ backgroundColor: 'transparent', color: '#ffffff', outline: 'none' }}
            onFocus={(e) => e.target.placeholder = ''}
            onBlur={(e) => e.target.placeholder = '비밀번호'}
          />
          <FaLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" />
          {error && (
            <p className="text-red-500 absolute left-0 right-0 text-center" style={{ top: '100%', marginTop: '0.5rem' }}>
              이메일 or 비밀번호가 틀렸어요.
            </p>
          )}
        </div>
        <button
          onClick={handleLogin}
          className="bg-white text-blue-500 font-bold py-2 px-4 rounded-full w-40"
        >
          로그인하기
        </button>
      </div>
      <style jsx>{`
        input::placeholder {
          color: #d3d3d3; /* 밝은 회색 */
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default LoginPage; 