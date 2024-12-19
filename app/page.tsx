"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Video } from 'some-video-library';

// Pretendard 폰트 가져오기
import "../app/globals.css"; // 이 파일에 @import 추가

export default function Home() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 비디오 프리로드
    if (videoRef.current) {
      videoRef.current.load();
      // 비디오 캐싱을 위한 설정
      videoRef.current.preload = "auto";
    }
    // 다른 페이지의 비디오도 미리 로드
    const preloadVideo = new Video();
    preloadVideo.src = "/bg.mp4";
    preloadVideo.preload = "auto";
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-pretendard">
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
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
