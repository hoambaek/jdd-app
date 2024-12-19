"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { supabase } from '../../utils/supabaseClient'; // Supabase 클라이언트 가져오기

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    // 비디오 프리로드
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.preload = "auto";
    }
  }, []);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('로그인 오류:', error);
      setErrorMessage('이메일 혹은 비밀번호가 틀려요.');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setErrorMessage('');
      }, 5000); // 5초 후에 오류 메시지 제거
    } else {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      router.push('/activity');
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden">
      {errorMessage && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-2">
          {errorMessage}
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        webkit-playsinline
        preload="auto"
        className="absolute w-full h-full object-cover"
      >
        <source src="bg.mp4" type="video/mp4" />
      </video>
      <div
        className={`relative z-10 p-8 rounded-lg w-96 shadow-lg ${shake ? 'shake' : ''}`}
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.1)', 
          border: '0.3px  white',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)' // Safari 지원을 위해 추가
        }}
      >
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Login</h1>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={(e) => e.target.placeholder = ''}
            onBlur={(e) => e.target.placeholder = 'email'}
            className="border border-transparent rounded-full p-3 w-full pr-10 text-left"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', color: '#ffffff', outline: 'none', paddingLeft: '1rem' }}
          />
          <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" />
        </div>
        <div className="relative mb-4">
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={(e) => e.target.placeholder = ''}
            onBlur={(e) => e.target.placeholder = 'password'}
            className="border border-transparent rounded-full p-3 w-full pr-10 text-left"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', color: '#ffffff', outline: 'none', paddingLeft: '1rem' }}
          />
          <FaLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" />
        </div>
        <div className="flex justify-between items-center mb-6">
          <label className="text-white">
            <input
              type="checkbox"
              className="mr-2"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            로그인 기억하기
          </label>
          <a href="/forgot-password" className="text-white">비밀번호 찾기</a>
        </div>
        <button
          onClick={handleLogin}
          className="text-green-500 font-bold py-2 px-4 rounded-full w-full"
          style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}
        >
          로그인 하기
        </button>
        <p className="text-center text-white mt-4">
          <a href="/signup" className="font-bold">회원가입</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 