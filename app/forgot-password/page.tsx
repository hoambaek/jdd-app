"use client";

import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleResetRequest = async () => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage('비밀번호 재설정 이메일 전송에 실패했습니다.');
        console.error(error);
      } else {
        setMessage('비밀번호 재설정 링크를 이메일로 전송했습니다.');
        setEmail('');
      }
    } catch (error) {
      console.error(error);
      setMessage('오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-8 rounded-lg w-96 bg-white">
        <h1 className="text-2xl font-bold text-center mb-4">비밀번호 찾기</h1>
        <input
          type="email"
          placeholder="이메일을 입력해주세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-md p-2 w-full mb-4 text-center"
        />
        <button
          onClick={handleResetRequest}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full w-full"
        >
          비밀번호 재설정 이메일 받기
        </button>
        {message && <p className="text-center mt-4">{message}</p>}
      </div>
      <style jsx>{`
        input::placeholder {
          color: gray;
          text-align: center;
        }
        input:focus::placeholder {
          color: transparent;
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage; 