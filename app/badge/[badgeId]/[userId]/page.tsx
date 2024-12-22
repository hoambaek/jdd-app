"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BadgeCollect({ 
  params: { badgeId, userId } 
}: { 
  params: { badgeId: string; userId: string } 
}) {
  const router = useRouter();
  const [message, setMessage] = useState('배지 획득 처리 중...');
  const [badgeImage, setBadgeImage] = useState('');
  const [badge, setBadge] = useState(null);

  // 기본 이미지 URL을 Supabase Storage의 이미지로 설정
  const defaultBadgeImage = supabase
    .storage
    .from('badges')
    .getPublicUrl('default-badge.png').data.publicUrl;  // Storage에 업로드한 기본 이미지 파일명

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const { data: badges, error } = await supabase
          .from('badges')
          .select('*')
          .eq('id', badgeId)
          .limit(1);

        if (error) throw error;
        if (!badges || badges.length === 0) {
          setBadgeImage(defaultBadgeImage); // 기본 이미지로 설정
          return;
        }

        const badge = badges[0];
        
        const imageUrl = supabase
          .storage
          .from('badges')
          .getPublicUrl(badge.image_url);

        if (imageUrl.data.publicUrl) {
          setBadgeImage(imageUrl.data.publicUrl);
          setBadge(badge);
        } else {
          setBadgeImage(defaultBadgeImage); // 기본 이미지로 설정
        }
      } catch (error) {
        console.error('배지 정보를 가져오는 중 오류 발생:', error);
        setBadgeImage(defaultBadgeImage); // 에러 발생 시 기본 이미지로 설정
      }
    };

    if (badgeId) {
      fetchBadge();
    }
  }, [badgeId, supabase]);

  useEffect(() => {
    collectBadge();
  }, []);

  const collectBadge = async () => {
    try {
      // 1. 현재 로그인한 사용자 확인
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        setMessage('로그인이 필요합니다.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      // 2. URL의 사용자 ID와 로그인한 사용자 ID가 일치하는지 확인
      if (currentUser.id !== userId) {
        setMessage('본인의 배지 URL만 사용할 수 있습니다.');
        setTimeout(() => router.push('/badges'), 2000);
        return;
      }

      // 배지 데이터 조회
      const { data: badges, error: badgeError } = await supabase
        .from('badges')
        .select('*')
        .eq('id', badgeId)
        .limit(1);

      if (badgeError) {
        console.error('배지 조회 오류:', badgeError);
        throw badgeError;
      }

      if (!badges || badges.length === 0) {
        setMessage('존재하지 않는 배지입니다.');
        setTimeout(() => router.push('/badges'), 2000);
        return;
      }

      const badge = badges[0];

      // Supabase Storage에서 이미지 URL 가져오기 수정
      const imageUrl = supabase
        .storage
        .from('badges')
        .getPublicUrl(`badges/${badge.image_url}`);  // 경로 수정

      setBadgeImage(imageUrl.data.publicUrl);

      // 사용자 데이터 조회
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (userError) {
        console.error('사용자 조회 오류:', userError);
        throw userError;
      }

      if (!users || users.length === 0) {
        setMessage('존재하지 않는 사용자입니다.');
        setTimeout(() => router.push('/badges'), 2000);
        return;
      }

      const user = users[0];

      // 이미 획득한 배지인지 확인
      const { data: existingBadges, error: existingError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .limit(1);

      if (existingError) {
        console.error('기존 배지 조회 오류:', existingError);
        throw existingError;
      }

      if (existingBadges && existingBadges.length > 0) {
        setMessage('이미 획득한 배지입니다!');
        setTimeout(() => router.push('/badges'), 2000);
        return;
      }

      // 5. 배지 획득 처리
      const { error: insertError } = await supabase
        .from('user_badges')
        .insert([
          {
            user_id: userId,
            badge_id: badgeId,
            collected_at: new Date().toISOString(),
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      setMessage('🎉 새로운 배지를 획득했습니다!');
      setTimeout(() => router.push('/badges'), 2000);

    } catch (error) {
      console.error('Error:', error);
      setMessage('배지 획득 중 오류가 발생했습니다.');
      setTimeout(() => router.push('/badges'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        {badgeImage && (
          <div className="mb-6">
            <img 
              src={badgeImage} 
              alt="배지 이미지" 
              className="w-32 h-32 mx-auto"
            />
          </div>
        )}
        <div className="mb-4 text-2xl">{message}</div>
        <div className="text-gray-400">잠시 후 배지 페이지로 이동합니다...</div>
      </div>
    </div>
  );
} 