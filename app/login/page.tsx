"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') || '/activity';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [shake, setShake] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const supabase = createClientComponentClient();

  // 저장된 이메일 불러오기
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.oncanplaythrough = () => {
        setVideoLoaded(true);
      };
      videoRef.current.load();
      videoRef.current.preload = "auto";
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('이메일과 비밀번호를 입력해주세요.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setLoading(false);
      return;
    }

    try {
      console.log('로그인 시도:', { email: trimmedEmail });
      setErrorMessage('로그인 중...');
      
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      console.log('로그인 응답:', { session, error });

      if (error) {
        console.error('로그인 에러:', error);
        if (error.message === 'Invalid login credentials') {
          setErrorMessage('이메일 혹은 비밀번호가 틀렸습니다.');
        } else {
          setErrorMessage(`${error.message} (${error.status})`);
        }
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      if (session) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', trimmedEmail);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        console.log('로그인 성공:', session.user);
        router.push(redirectTo);
        router.refresh();
      }

    } catch (error: any) {
      console.error('예외 발생:', error);
      setErrorMessage('로그인 중 오류가 발생했습니다.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden">
      <img
        src="/bg.jpg"
        alt="Background"
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}
      />
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
        <source src="bg.mp4" type="video/mp4" />
      </video>
      {errorMessage && (
        <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-50 text-black text-center py-2">
          {errorMessage}
        </div>
      )}
      <form 
        onSubmit={handleLogin}
        className={`relative z-10 p-8 rounded-lg w-96 shadow-lg ${shake ? 'shake' : ''}`}
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.1)', 
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
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
          type="submit"
          className="text-green-500 font-bold py-2 px-4 rounded-full w-full"
          style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}
          disabled={loading}
        >
          {loading ? '로그인 중...' : '로그인 하기'}
        </button>
        <p className="text-center text-white mt-4">
          <a href="/signup" className="font-bold">회원가입</a>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">
      <div>Loading...</div>
    </div>}>
      <LoginForm />
    </Suspense>
  );
} 