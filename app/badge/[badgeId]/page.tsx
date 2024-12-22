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

        if (error) throw error;
        if (!badges || badges.length === 0) {
          setBadgeImage(null);
          setLoading(false);
          return;
        }

        const badge = badges[0];
        
        const imageUrl = supabase
          .storage
          .from('badges')
          .getPublicUrl(badge.image_url);

        console.log('Generated Image URL:', imageUrl.data.publicUrl);

        if (imageUrl.data.publicUrl) {
          setBadgeImage(imageUrl.data.publicUrl);
          setBadge(badge);
        } else {
          setBadgeImage(null);
        }
      } catch (error) {
        console.error('배지 정보를 가져오는 중 오류 발생:', error);
        setBadgeImage(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.badgeId) {
      fetchBadge();
    }
  }, [params.badgeId, supabase]);

  const handleActivateBadge = async () => {
    const user = supabase.auth.user();
    if (!user) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      // 배지 활성화 로직 추가
      console.log('배지 활성화 중...');
    } catch (error) {
      console.error('배지 활성화 중 오류 발생:', error);
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
              <Image
                src={badgeImage || `${supabaseUrl}/storage/v1/object/public/badges/${badge.image_path}`}
                alt={badge.name}
                fill
                className={`rounded-full object-cover ${
                  isAlreadyCollected ? 'opacity-100' : 'opacity-50'
                }`}
                priority
              />
            </div>
            <h1 className="text-2xl font-bold mb-2">{badge.name}</h1>
            <p className="text-gray-300 text-center mb-4">{badge.description}</p>
            <div className="text-sm text-gray-400 mb-4">
              {badge.month}월의 배지
            </div>
            {!isAlreadyCollected ? (
              <button
                onClick={handleActivateBadge}
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