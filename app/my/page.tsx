'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import BottomNav from '../components/BottomNav';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../hooks/useRequireAuth';
import type { Database } from '../types/supabase';
import confetti from 'canvas-confetti';

const supabase = createClientComponentClient<Database>();

interface UserData {
  id: string;
  name: string | null;
  avatar_url: string | null;
  baptismal_name: string | null;
  email: string | null;
  grade: string | null;
  is_admin: boolean;
  
}

export default function MyPage() {
  const router = useRouter();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { session, loading } = useRequireAuth();

  useEffect(() => {
    if (session) {
      console.log('Component mounted');
      fetchProfileImages();
      fetchUserData();
    }
  }, [session]);

  const fetchProfileImages = async () => {
    try {
      // 1부터 30까지의 프로필 이미지 URL 생성
      const imageUrls = Array.from({ length: 30 }, (_, i) => {
        const imageNumber = i + 1;
        return `https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/profile-images/profile${imageNumber}.png`;
      });
      
      console.log('생성된 이미지 URLs:', imageUrls); // 디버깅용
      setProfileImages(imageUrls);
      
    } catch (error) {
      console.error('이미지 처리 중 오류:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      if (!session?.user) return;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      const defaultImage = 'https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/profile-images/profile1.png';
      const avatarUrl = profileData?.avatar_url || defaultImage;

      setIsAdmin(profileData?.is_admin || false);
      setSelectedImage(avatarUrl);

      setUserData({
        id: session.user.id,
        name: profileData?.name || null,
        avatar_url: avatarUrl,
        baptismal_name: profileData?.baptismal_name || null,
        email: session.user.email || null,
        grade: profileData?.grade || null,
        is_admin: profileData?.is_admin || false
      });
      
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    }
  };

  const updateProfileImage = async (imageUrl: string) => {
    try {
      if (!session?.user) {
        console.error('사용자 세션이 없습니다.');
        return;
      }

      console.log('선택된 이미지 URL:', imageUrl);

      // 프로필 업데이트
      const { data, error } = await supabase
        .from('profiles')
        .update({
          avatar_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id)
        .select();

      if (error) {
        console.error('프로필 업데이트 실패:', error);
        alert(`프로필 이미지 업데이트에 실패했습니다: ${error.message}`);
        return;
      }

      if (data) {
        console.log('프로필 업데이트 성공:', data);
        setSelectedImage(imageUrl);
        setShowImagePicker(false);
        setUserData(prevData => {
          if (!prevData) return null;
          return {
            ...prevData,
            avatar_url: imageUrl,
          };
        });
      }

    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      alert('프로필 이미지 업데이트에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // 로컬 상태 초기화
      setUserData(null);
      setSelectedImage(null);
      setIsAdmin(false);
      // 즉시 홈페이지로 리다이렉트
      router.push('/');
      router.refresh(); // 라우터 새로고침을 통해 전체 앱 상태 초기화
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      // 오류가 발생하더라도 홈페이지로 리다이렉트
      router.push('/');
    }
  };

  const handleImageClick = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: { spread?: number; startVelocity?: number; decay?: number; scalar?: number }) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  console.log('Rendering with isAdmin:', isAdmin); // 렌더링시 isAdmin 상태 확인

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div>로딩중...</div>
    </div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h1>
      
      {/* 프로필 섹션 - 이미지와 기본 정보 */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/60 mb-6">
        <div className="flex items-center gap-6">
          {/* 프로필 이미지 */}
          <div 
            className="relative w-20 h-20 flex-shrink-0 cursor-pointer group"
            onClick={() => setShowImagePicker(true)}
          >
            <Image
              src={selectedImage || 'https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/profile-images/profile1.png'}
              alt="Profile"
              width={80}
              height={80}
              className="rounded-2xl object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <div className="absolute bottom-0 right-0 bg-white/80 backdrop-blur-sm p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
          </div>

          {/* 기본 정보 */}
          {userData && (
            <div className="flex-1 space-y-1.5">
              <div>
                <p className="text-xl font-bold text-gray-800">{userData.name || '미입력'}</p>
                <p className="text-sm text-gray-500">{userData.baptismal_name || '세례명 미입력'}</p>
              </div>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {userData.grade || '학년 미입력'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                  장덕동성당
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 추가 정보 섹션 */}
      {userData && (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/60">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">이메일</p>
                <p className="text-gray-800">{userData.email || '미입력'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin 버튼 */}
      {isAdmin && (
        <div className="mt-6 space-y-3">
          <button
            onClick={() => router.push('/admin/feed')}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3.5 rounded-2xl shadow-lg hover:opacity-90 transition-all duration-300 font-medium"
          >
            피드 관리
          </button>
          <button
            onClick={() => router.push('/admin/badge-manager')}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 rounded-2xl shadow-lg hover:opacity-90 transition-all duration-300 font-medium"
          >
            배지 관리
          </button>
          <button
            onClick={() => router.push('/admin/storymod')}
            className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3.5 rounded-2xl shadow-lg hover:opacity-90 transition-all duration-300 font-medium"
          >
            스토리 관리
          </button>
        </div>
      )}

      {/* 로그아웃 버튼 */}
      <div className="mt-6 mb-6">
        <button
          onClick={handleLogout}
          className="w-full bg-white/50 backdrop-blur-sm text-gray-700 py-3.5 rounded-2xl shadow-lg hover:bg-white/60 transition-all duration-300 font-medium border border-white/60"
        >
          로그아웃
        </button>
      </div>

      {/* con.png 이미지 추가 */}
      <div className="flex justify-center mb-20">
        <Image
          src="/con.png"
          alt="Con"
          width={50}
          height={50}
          className="object-contain cursor-pointer"
          onClick={handleImageClick}
          style={{ transition: 'transform 0.2s' }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>
      
      <BottomNav />

      {/* 이미지 선택 오버레이 */}
      {showImagePicker && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">프로필 이미지 선택</h3>
              <button 
                onClick={() => setShowImagePicker(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {profileImages.map((imageUrl, index) => (
                <div 
                  key={index}
                  onClick={() => updateProfileImage(imageUrl)}
                  className="relative aspect-square cursor-pointer group rounded-xl overflow-hidden"
                >
                  <Image
                    src={imageUrl}
                    alt={`Profile option ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 