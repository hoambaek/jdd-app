'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import BottomNav from '../components/BottomNav';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MyPage() {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>('/profile-placeholder.png');

  useEffect(() => {
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
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserData({
        ...profileData,
        email: user.email,
        church: '장덕동성당'
      });
      
      setSelectedImage(profileData?.avatar_url || '/profile-placeholder.png');
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      {/* 프로필 이미지 섹션 */}
      <div className="flex justify-center mb-8">
        <div 
          className="relative w-32 h-32 cursor-pointer"
          onClick={() => setShowImagePicker(true)}
        >
          <Image
            src={selectedImage}
            alt="Profile"
            width={128}
            height={128}
            className="rounded-full object-cover"
            priority
          />
          <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 이미지 선택 오버레이 */}
      {showImagePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Select Profile Image</h2>
              <button 
                onClick={() => setShowImagePicker(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {profileImages.map((imageUrl, index) => (
                <div 
                  key={index}
                  className="aspect-square cursor-pointer hover:opacity-75"
                  onClick={() => updateProfileImage(imageUrl)}
                >
                  <Image
                    src={imageUrl}
                    alt={`Profile ${index + 1}`}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 사용자 정보 섹션 */}
      {userData && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">이름</label>
              <p className="text-lg">{userData.name || '미입력'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">세례명</label>
              <p className="text-lg">{userData.baptismalName || '미입력'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">학년</label>
              <p className="text-lg">{userData.grade || '미입력'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">이메일</label>
              <p className="text-lg">{userData.email || '미입력'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">소속 본당</label>
              <p className="text-lg">장덕동성당</p>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
} 