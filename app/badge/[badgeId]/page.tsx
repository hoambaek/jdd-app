'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Badge {
  id: number;
  name: string;
  description: string;
  image_url: string;
  month: number;
}

export default function BadgePage({ params }: { params: { badgeId: string } }) {
  const router = useRouter();
  const [badge, setBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [isAlreadyCollected, setIsAlreadyCollected] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadBadge = async () => {
      try {
        setLoading(true);
        
        // 세션 확인
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
          return;
        }

        // 배지 정보 로드
        const { data: badge, error: badgeError } = await supabase
          .from('badges')
          .select('*')
          .eq('id', params.badgeId)
          .single();

        if (badgeError) throw badgeError;

        if (!badge) {
          throw new Error('배지를 찾을 수 없습니다.');
        }

        setBadge(badge);

        // 이미 수집한 배지인지 확인
        const { data: existingBadge, error: collectionError } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('badge_id', params.badgeId)
          .single();

        if (existingBadge) {
          setIsAlreadyCollected(true);
        }

      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadBadge();
  }, [params.badgeId, router]);

  const activateBadge = async () => {
    try {
      setIsActivating(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('로그인이 필요합니다.');
      }

      // user_badges 테이블에 데이터 추가
      const { error: insertError } = await supabase
        .from('user_badges')
        .insert([
          {
            user_id: session.user.id,
            badge_id: params.badgeId,
            collected_at: new Date().toISOString()
          }
        ]);

      if (insertError) throw insertError;

      setIsAlreadyCollected(true);
      alert('배지가 성공적으로 활성화되었습니다!');
      router.push('/badges'); // 배지 컬렉션 페이지로 이동

    } catch (err: any) {
      console.error('Error activating badge:', err);
      alert(err.message || '배지 활성화 중 오류가 발생했습니다.');
    } finally {
      setIsActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl">로딩 중...</h1>
        </div>
      </div>
    );
  }

  if (error || !badge) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl">{error || '배지를 찾을 수 없습니다.'}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4">
              <Image
                src={badge.image_url}
                alt={badge.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold mb-2">{badge.name}</h1>
            <p className="text-gray-300 text-center mb-4">{badge.description}</p>
            <div className="text-sm text-gray-400 mb-4">
              {badge.month}월의 배지
            </div>
            {!isAlreadyCollected ? (
              <button
                onClick={activateBadge}
                disabled={isActivating}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isActivating ? '활성화 중...' : '배지 활성화하기'}
              </button>
            ) : (
              <div className="text-green-500 font-semibold">
                이미 수집한 배지입니다
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 