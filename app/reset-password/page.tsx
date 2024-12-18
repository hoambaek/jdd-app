"use client";

import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient'; // Supabase 클라이언트 가져오기
import { useRouter } from 'next/navigation';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handlePasswordReset = async () => {
    if (password !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage('비밀번호 재설정에 실패했습니다. 다시 시도해주세요.');
    } else {
      setMessage('비밀번호가 성공적으로 재설정되었습니다.');
      setTimeout(() => router.push('/login'), 3000); // 3초 후 로그인 페이지로 이동
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-8 rounded-lg shadow-lg w-96 bg-white">
        <h1 className="text-2xl font-bold text-center mb-4">비밀번호 재설정</h1>
        <input
          type="password"
          placeholder="새 비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        />
        <button
          onClick={handlePasswordReset}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded w-full"
        >
          비밀번호 재설정
        </button>
        {message && <p className="text-center mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPasswordPage; 