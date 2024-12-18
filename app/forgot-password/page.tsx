"use client";

import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient'; // Supabase 클라이언트 가져오기
import { useRouter } from 'next/navigation';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setMessage('이메일 전송에 실패했습니다. 다시 시도해주세요.');
    } else {
      setMessage('비밀번호 재설정 이메일이 전송되었습니다. 메일을 확인해주세요.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-8 rounded-lg shadow-lg w-96 bg-white">
        <h1 className="text-2xl font-bold text-center mb-4">비밀번호를 잊어렸나요?</h1>
        <p className="text-center mb-6">이메일 입력 후 비밀번호를 재설정하세요.</p>
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        />
        <button
          onClick={handlePasswordReset}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded w-full"
        >
          재설정 메일 보내기
        </button>
        {message && <p className="text-center mt-4">{message}</p>}
        <button
          onClick={() => router.push('/login')}
          className="text-blue-500 mt-4 block text-center"
        >
          다시 로그인하기
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 