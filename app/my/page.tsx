'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import BottomNav from '../components/BottomNav';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MyPage() {
  const router = useRouter();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>('/profile-placeholder.png');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('Component mounted');
    fetchProfileImages();
    fetchUserData();
  }, []);

  const fetchProfileImages = async () => {
    try {
      const { data: imageList, error } = await supabase.storage
        .from('profile-images')
        .list();
      
      if (error) {
        console.error('이미지 목록 가져오기 실패:', error);
        return;
      }

      if (imageList) {
        const imageUrls = await Promise.all(
          imageList.map(async (file) => {
            const { data: { publicUrl } } = supabase.storage
              .from('profile-images')
              .getPublicUrl(file.name);
            return publicUrl;
          })
        );
        setProfileImages(imageUrls);
      }
    } catch (error) {
      console.error('이미지 처리 중 오류:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }

      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        // DB의 is_admin 필드로 admin 체크
        setIsAdmin(profileData?.is_admin || false);
        console.log('Is admin from DB:', profileData?.is_admin);

        setUserData({
          ...profileData,
          email: user.email,
          church: '장덕동성당'
        });
        
        setSelectedImage(profileData?.avatar_url || '/profile-placeholder.png');
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    }
  };

  const updateProfileImage = async (imageUrl: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: imageUrl })
          .eq('id', user.id);

        if (error) {
          console.error('프로필 업데이트 실패:', error);
          return;
        }

        setSelectedImage(imageUrl);
        setShowImagePicker(false);
      }
    } catch (error) {
      console.error('프로필 이미지 업데이트 중 오류:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/'); // 로그아웃 후 메인 페이지로 이동
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  console.log('Rendering with isAdmin:', isAdmin); // 렌더링시 isAdmin 상태 확인

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h1>
      
      {/* 프로필 섹션 - 이미지와 기본 정보 */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/60 mb-6">
        <div className="flex items-center gap-6">
          {/* 프로필 이미지 */}
          <div 
            className="relative w-20 h-20 flex-shrink-0 cursor-pointer group"
            onClick={() => setShowImagePicker(true)}
          >
            <Image
              src={selectedImage}
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
                <p className="text-sm text-gray-500">{userData.baptismalName || '세례명 미입력'}</p>
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
      <div className="mt-6 mb-20">
        <button
          onClick={handleLogout}
          className="w-full bg-white/50 backdrop-blur-sm text-gray-700 py-3.5 rounded-2xl shadow-lg hover:bg-white/60 transition-all duration-300 font-medium border border-white/60"
        >
          로그아웃
        </button>
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