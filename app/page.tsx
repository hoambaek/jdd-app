"use client";

import Image from "next/image";

// Pretendard 폰트 가져오기
import "../app/globals.css"; // 이 파일에 @import 추가

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-pretendard">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/bg.mp4"
        autoPlay
        loop
        muted
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black" style={{ opacity: 0.4 }}></div>
      <div className="relative z-10 text-center text-white">
        <Image
          src="/logo.png"
          alt="Logo"
          width={250}
          height={146}
        />
        <h1 className="text-xl mt-4">
        장덕독성당 중고등부 앱
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <button className="bg-green-500 text-white py-2 px-4 rounded-full transition duration-300 ease-in-out hover:bg-white hover:text-green-500">
            로그인
          </button>
          <button className="border border-green-300 text-green-300 py-2 px-4 rounded-full transition duration-300 ease-in-out hover:bg-white hover:text-green-400">
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
