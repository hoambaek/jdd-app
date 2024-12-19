"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    adminCode: "", // 관리자 인증 코드
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 환경 변수에서 관리자 코드 확인
    if (formData.adminCode !== process.env.NEXT_PUBLIC_ADMIN_CODE) {
      alert("관리자 인증 코드가 올바르지 않습니다.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      alert("가입 중 오류가 발생했습니다: " + error.message);
      return;
    }

    const { error: insertError } = await supabase.from('profiles').insert([
      {
        id: data.user?.id,
        name: formData.name,
        email: formData.email,
        role: 'admin',
        grade: '선생님',
      },
    ]);

    if (insertError) {
      alert("프로필 생성 중 오류가 발생했습니다.");
      return;
    }

    alert("관리자 계정이 생성되었습니다!");
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">관리자 계정 생성</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              이름 (실명)
            </label>
            <input
              type="text"
              placeholder="이름을 입력하세요"
              className="w-full p-2 border rounded"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              이메일 주소
            </label>
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              className="w-full p-2 border rounded"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              비밀번호
            </label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              className="w-full p-2 border rounded"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              관리자 인증 코드
            </label>
            <input
              type="password"
              placeholder="관리자 인증 코드를 입력하세요"
              className="w-full p-2 border rounded"
              value={formData.adminCode}
              onChange={(e) => setFormData({...formData, adminCode: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            관리자 계정 생성
          </button>
        </form>
      </div>
    </div>
  );
} 