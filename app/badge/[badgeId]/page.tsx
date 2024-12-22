'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const supabase = createClientComponentClient();

interface Badge {
  id: number;
  name: string;
  description: string;
  image_url: string;
  month: number;
  image_name: string;
  image_path: string;
}

export default function BadgePage({ params }: { params: { badgeId: string } }) {
  const router = useRouter();
  const [badge, setBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [isAlreadyCollected, setIsAlreadyCollected] = useState(false);
  const [badgeImage, setBadgeImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const { data: badges, error } = await supabase
          .from('badges')
          .select('*')
          .eq('id', params.badgeId)
          .limit(1);

        if (error) {
          setError(error.message);
          return;
        }
        
        if (!badges || badges.length === 0) {
          setError('배지를 찾을 수 없습니다.');
          setBadgeImage(null);
          setLoading(false);
          return;
        }

        const badge = badges[0];
        setBadge(badge);

        const { data: imageData } = supabase
          .storage
          .from('badges')
          .getPublicUrl(badge.image_url);

        if (imageData?.publicUrl) {
          setBadgeImage(imageData.publicUrl);
        } else {
          console.error('이미지 URL을 가져올 수 없음');
          setBadgeImage(null);
        }
      } catch (error) {
        console.error('배지 정보를 가져오는 중 오류 발생:', error);
        setError('배지 정보를 불러오는 중 오류가 발생했습니다.');
        setBadgeImage(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.badgeId) {
      fetchBadge();
    }
  }, [params.badgeId]);

  const handleActivateBadge = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      setIsActivating(true);
      console.log('배지 활성화 시작');

      // 배지 활성화 로직 추가
      const { error } = await supabase
        .from('user_badges')
        .insert({ user_id: user.id, badge_id: badge?.id });

      if (error) throw error;

      console.log('배지 활성화 성공');
      setIsAlreadyCollected(true);
    } catch (error) {
      console.error('배지 활성화 중 오류 발생:', error);
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4">
              {badgeImage ? (
                <Image 
                  src={badgeImage}
                  alt="배지 이미지"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                <p>이미지를 불러올 수 없습니다.</p>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2">{badge.name}</h1>
            <p className="text-gray-300 text-center mb-4">{badge.description}</p>
            <div className="text-sm text-gray-400 mb-4">
              {badge.month}월의 배지
            </div>
            <button
              onClick={handleActivateBadge}
              disabled={isActivating || isAlreadyCollected}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isAlreadyCollected ? '이미 활성화됨' : '배지 활성화하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 