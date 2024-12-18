"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

// Pretendard 폰트 가져오기
import "../app/globals.css"; // 이 파일에 @import 추가

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-pretendard">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black" style={{ opacity: 0.17 }}></div>
      <div className="relative z-10 text-center text-white">
        <Image
          className="fade-in"
          src="/logo.png"
          alt="Logo"
          width={250}
          height={146}
        />
        <h1 className="text-xl mt-4 fade-in">
        장덕독성당 중고등부 앱
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <button
            onClick={() => router.push("/login")}
            className="bg-green-500 text-white py-2 px-4 rounded-full transition duration-300 ease-in-out hover:bg-green-600 fade-in"
          >
            로그인
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="border border-white text-white py-2 px-4 rounded-full transition duration-300 ease-in-out hover:border-green-400 hover:text-green-400 fade-in"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
