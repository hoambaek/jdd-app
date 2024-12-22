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
  const [isLoading, setIsLoading] = useState(true);

  // 기본 이미지 URL을 Supabase Storage의 이미지로 설정
  const defaultBadgeImage = supabase
    .storage
    .from('badges')
    .getPublicUrl('default-badge.png').data.publicUrl;  // Storage에 업로드한 기본 이미지 파일명

  useEffect(() => {
    const fetchBadge = async () => {
      console.log('fetchBadge 시작');
      try {
        setIsLoading(true);  // 로딩 시작
        const { data: badges, error } = await supabase
          .from('badges')
          .select('*')
          .eq('id', badgeId)
          .limit(1);

        console.log('쿼리 결과:', badges, error);

        if (error) throw error;
        if (!badges || badges.length === 0) {
          setBadgeImage(defaultBadgeImage);
          return;
        }

        const badge = badges[0];
        const imageUrl = supabase
          .storage
          .from('badges')
          .getPublicUrl(badge.image_url);

        console.log('이미지 URL:', imageUrl);

        if (imageUrl.data.publicUrl) {
          setBadgeImage(imageUrl.data.publicUrl);
          setBadge(badge);
        } else {
          setBadgeImage(defaultBadgeImage);
        }
      } catch (error) {
        console.error('배지 정보를 가져오는 중 오류 발생:', error);
        setBadgeImage(defaultBadgeImage);
      } finally {
        setIsLoading(false);  // 로딩 종료
        console.log('fetchBadge 종료');
      }
    };

    if (badgeId) {
      fetchBadge();
    }
  }, [badgeId, supabase]);

  useEffect(() => {
    const collectBadge = async () => {
      try {
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('인증 오류:', authError);
          setMessage('로그인 상태를 확인하는 중 오류가 발생했습니다.');
          return;
        }

        if (!currentUser) {
          setMessage('로그인이 필요합니다.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        if (currentUser.id !== userId) {
          setMessage('본인의 배지 URL만 사용할 수 있습니다.');
          setTimeout(() => router.push('/badges'), 2000);
          return;
        }

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
        const imageUrl = supabase
          .storage
          .from('badges')
          .getPublicUrl(`badges/${badge.image_url}`);

        setBadgeImage(imageUrl.data.publicUrl);

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

    collectBadge();
  }, []);

  // 배지 활성화하기 버튼 클릭 이벤트 핸들러 추가
  const handleActivateBadge = async () => {
    try {
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('인증 오류:', authError);
        setMessage('로그인 상태를 확인하는 중 오류가 발생했습니다.');
        return;
      }

      if (!currentUser) {
        setMessage('로그인이 필요합니다.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      // 배지 활성화 로직 추가
      // 예: 서버에 배지 활성화 요청 보내기

      setMessage('배지가 활성화되었습니다!');
    } catch (error) {
      console.error('배지 활성화 중 오류 발생:', error);
      setMessage('배지 활성화 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        {isLoading ? (
          <div className="mb-4 text-2xl">로딩 중...</div>
        ) : (
          <>
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
            <button 
              onClick={handleActivateBadge} 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              배지 활성화하기
            </button>
            <div className="text-gray-400">잠시 후 배지 페이지로 이동합니다...</div>
          </>
        )}
      </div>
    </div>
  );
} 