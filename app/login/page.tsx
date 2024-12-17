"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();

  const handleLogin = () => {
    // 로그인 로직을 여기에 추가하세요.
    // 로그인 성공 시 페이지 이동
    router.push('/activity');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <div className="text-center flex flex-col items-center w-80">
        <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Pretendard' }}>
          로그인 하기
        </h1>
        <input
          type="text"
          placeholder="이메일"
          className="border border-gray-200 rounded-full p-2 mb-4 w-full text-center"
          style={{ backgroundColor: 'transparent', color: 'white', outline: 'none' }}
          onFocus={(e) => e.target.placeholder = ''}
          onBlur={(e) => e.target.placeholder = '이메일'}
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="border border-gray-200 rounded-full p-2 mb-4 w-full text-center"
          style={{ backgroundColor: 'transparent', color: 'white', outline: 'none' }}
          onFocus={(e) => e.target.placeholder = ''}
          onBlur={(e) => e.target.placeholder = '비밀번호'}
        />
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
      `}</style>
    </div>
  );
};

export default LoginPage; 