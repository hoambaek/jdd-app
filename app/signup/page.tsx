"use client";

import React, { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from 'next/navigation';

const supabase = createClient("https://qloytvrhkjviqyzuimio.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsb3l0dnJoa2p2aXF5enVpbWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MzkxNzYsImV4cCI6MjA1MDAxNTE3Nn0.JJlf2uXjbk48w0rSGF2b8PDHz8U_TLYoxdTRdKnbqkc");

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    baptismalName: "",
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
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      console.error("Error signing up:", error.message);
      alert("가입 중 오류가 발생했습니다: " + error.message);
    } else {
      console.log("User signed up successfully!");

      // 사용자 정의 테이블에 데이터 삽입
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id: data.user?.id, // auth.users의 id 사용
          name: formData.name,
          baptismalName: formData.baptismalName,
          grade: formData.grade,
          email: formData.email,
          role: formData.role,
        },
      ]);

      if (insertError) {
        console.error("Error inserting into profiles:", insertError);
        alert("프로필 저장 중 오류가 발생했습니다: " + (insertError.message || "알 수 없는 오류"));
      } else {
        // 로그인 상태 유지
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          console.error("Error signing in:", signInError.message);
          alert("로그인 중 오류가 발생했습니다: " + signInError.message);
        } else {
          alert("가입이 성공적으로 완료되었습니다!");
          router.push('/signup/complete');
        }
      }
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

        <div className="p-4">
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
                className="w-full p-2 mb-4 rounded-full bg-white/10 text-white placeholder-gray-300 text-center outline-none focus:ring-0"
              />
            </>
          )}
          {step === 2 && (
            <>
              <p className="text-center text-white mb-2">세례명을 입력해주세요.</p>
              <input
                ref={baptismalNameRef}
                type="text"
                name="baptismalName"
                placeholder="세례명"
                value={formData.baptismalName}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="w-full p-2 mb-4 rounded-full bg-white/10 text-white placeholder-gray-300 text-center outline-none focus:ring-0"
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
                className="w-full p-2 mb-4 rounded-full bg-white/10 text-white text-center appearance-none outline-none focus:ring-0"
                style={{ padding: '0.5rem', lineHeight: '1.5rem' }}
              >
                <option value="">학년 선택</option>
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
                className="w-full p-2 mb-4 rounded-full bg-white/10 text-white placeholder-gray-300 text-center outline-none focus:ring-0"
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
                className="w-full p-2 mb-4 rounded-full bg-white/10 text-white placeholder-gray-300 text-center outline-none focus:ring-0"
              />
            </>
          )}

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={step === 1}
              className="btn-grad disabled:opacity-50 px-4 py-1"
              style={{
                background: "transparent",
                border: "2px solid white",
                borderRadius: "50px",
                color: "white",
                boxShadow: "none"
              }}
            >
              이전
            </button>
            {step < 5 ? (
              <button
                onClick={handleNext}
                className="btn-grad px-4 py-1"
                style={{ 
                  background: "white",
                  borderRadius: "50px",
                  boxShadow: "none",
                  color: "#4CB8C4"
                }}
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="btn-grad px-4 py-1"
                style={{ 
                  background: "white",
                  borderRadius: "50px",
                  boxShadow: "none",
                  color: "#4CB8C4"
                }}
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