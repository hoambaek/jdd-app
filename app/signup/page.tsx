"use client";

import React, { useState, useRef, useEffect } from "react";
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    baptismal_name: "",
    grade: "",
    email: "",
    password: "",
    role: "user",
  });

  const nameRef = useRef<HTMLInputElement>(null);
  const baptismalNameRef = useRef<HTMLInputElement>(null);
  const gradeRef = useRef<HTMLSelectElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    switch (step) {
      case 1:
        nameRef.current?.focus();
        break;
      case 2:
        baptismalNameRef.current?.focus();
        break;
      case 3:
        gradeRef.current?.focus();
        break;
      case 4:
        emailRef.current?.focus();
        break;
      case 5:
        passwordRef.current?.focus();
        break;
      default:
        break;
    }
  }, [step]);

  useEffect(() => {
    // 비디오 프리로드
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.preload = "auto";
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNext();
    }
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      // 1. 입력값 검증
      if (!formData.email || !formData.password || !formData.name || !formData.grade) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
      }

      // 2. 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('올바른 이메일 형식을 입력해주세요.');
        return;
      }

      // 3. 비밀번호 길이 검증
      if (formData.password.length < 6) {
        alert('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }

      console.log('회원가입 시도:', { ...formData, password: '***' });

      // 4. 회원가입 시도
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: formData.name,
            baptismal_name: formData.baptismal_name || null,
            grade: formData.grade,
            role: 'user'
          }
        }
      });

      if (signUpError) {
        console.error('회원가입 에러:', signUpError);
        throw new Error(signUpError.message);
      }

      if (!data.user) {
        console.error('사용자 데이터 없음');
        throw new Error('회원가입에 실패했습니다.');
      }

      console.log('회원가입 성공:', { userId: data.user.id });

      // 성공 처리
      alert('축하해요! 가입이 완료되었어요!');
      router.push('/signup/complete');

    } catch (error) {
      console.error('회원가입 처리 중 에러:', error);
      alert(error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.');
    }
  };

  const handleStepClick = (num: number) => {
    setStep(num);
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute w-full h-full object-cover"
        style={{ zIndex: -1 }}
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>
      <div className="max-w-md mx-auto p-6 bg-black/8 backdrop-blur-md rounded-lg border-[1px] border-white/0 shadow-lg shadow-black/50">
        <h1 className="text-2xl font-bold text-center mb-6 text-white">회원가입</h1>
        
        <div className="relative mb-4">
          <div className="flex justify-between relative z-10">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                onClick={() => handleStepClick(num)}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300 ${
                  num <= step ? "bg-green-500 text-white" : "bg-gray-300"
                }`}
              >
                {num}
              </div>
            ))}
          </div>
          <div className="absolute top-1/2 w-full h-1 bg-gray-300 rounded transform -translate-y-1/2"></div>
          <div
            className="absolute top-1/2 h-1 bg-green-500 rounded transform -translate-y-1/2 transition-width duration-300"
            style={{ width: `${(step - 1) * 25}%` }}
          ></div>
        </div>

        <div className="p-4 h-56 flex flex-col justify-center">
          {step === 1 && (
            <>
              <p className="text-center text-white mb-2">이름을 입력해주세요.</p>
              <input
                ref={nameRef}
                type="text"
                name="name"
                placeholder="이름"
                value={formData.name}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                autoComplete="off"
                className="w-full p-3 mb-4 rounded-full bg-white/10 text-white placeholder-gray-300 text-center outline-none focus:ring-0"
              />
            </>
          )}
          {step === 2 && (
            <>
              <p className="text-center text-white mb-2">세례명을 입력해주세요.</p>
              <input
                ref={baptismalNameRef}
                type="text"
                name="baptismal_name"
                placeholder="세례명"
                value={formData.baptismal_name}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="w-full p-3 mb-4 rounded-full bg-white/10 text-white placeholder-gray-300 text-center outline-none focus:ring-0"
              />
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-center text-white mb-2">학년을 선택해주세요.</p>
              <select
                ref={gradeRef}
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full p-3 mb-4 rounded-full bg-white/10 text-white text-center appearance-none outline-none focus:ring-0"
              >
                <option value="중1">중1</option>
                <option value="중2">중2</option>
                <option value="중3">중3</option>
                <option value="고1">고1</option>
                <option value="고2">고2</option>
                <option value="고3">고3</option>
                <option value="선생님">선생님</option>
              </select>
            </>
          )}
          {step === 4 && (
            <>
              <p className="text-center text-white mb-2">이메일을 입력해주세요.</p>
              <input
                ref={emailRef}
                type="email"
                name="email"
                placeholder="이메일"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                autoComplete="off"
                className="w-full p-3 mb-4 rounded-full bg-white/10 text-white placeholder-gray-300 text-center outline-none focus:ring-0"
              />
            </>
          )}
          {step === 5 && (
            <>
              <p className="text-center text-white mb-2">비밀번호를 입력해주세요.</p>
              <input
                ref={passwordRef}
                type="password"
                name="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                autoComplete="new-password"
                className="w-full p-3 mb-4 rounded-full bg-white/10 text-white placeholder-gray-300 text-center outline-none focus:ring-0"
              />
            </>
          )}

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={step === 1}
              className={`px-4 py-1 rounded-full ${
                step === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-400 transition-colors duration-300"
              }`}
            >
              이전
            </button>
            {step < 5 ? (
              <button
                onClick={handleNext}
                className="px-4 py-1 rounded-full bg-white text-blue-400 hover:bg-blue-400 hover:text-white transition-colors duration-300"
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-1 rounded-full bg-white text-blue-400 hover:bg-blue-400 hover:text-white transition-colors duration-300"
              >
                가입
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}