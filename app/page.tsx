"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createClient } from '@supabase/supabase-js';

// 환경 변수 가져오기
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error(error);
    return;
  }
  console.log('User ID:', user?.id);
}

export default function Home() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.oncanplaythrough = () => {
        setVideoLoaded(true);
      };
      videoRef.current.load();
      videoRef.current.preload = "auto";
    }
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-pretendard bg-black">
      <img
        src="/bg.jpg"
        alt="Background"
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}
      />
      <video
        ref={videoRef}
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
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
          src="/logo.png"
          alt="Logo"
          width={250}
          height={146}
          priority
        />
        <h1 className="text-xl mt-4">
          장덕독성당 중고등부 앱
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <button
            onClick={() => router.push("/login")}
            className="bg-green-500 text-white py-2 px-4 rounded-full transition duration-300 ease-in-out hover:bg-green-600"
          >
            로그인
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="border border-white text-white py-2 px-4 rounded-full transition duration-300 ease-in-out hover:border-green-400 hover:text-green-400"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
