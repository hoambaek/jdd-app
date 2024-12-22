"use client";

import { useEffect, useState, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import BottomNav from '../components/BottomNav';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Badge {
  id: string;
  month: number;
  position: number;
  name: string;
  image_url: string;
  description: string;
  is_collected: boolean;
}

export default function BadgeCollection() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  const monthNames = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const badgeId = searchParams.get('badgeId');
    const userIdFromUrl = searchParams.get('userId');

    if (badgeId && userIdFromUrl) {
      collectBadge(badgeId, userIdFromUrl);
    } else {
      checkUser();
      loadBadges();
    }
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserId(user.id);
  };

  const loadBadges = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User fetch error:', userError);
        return;
      }

      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select(`
          *,
          user_badges!left(user_id)
        `)
        .order('month')
        .order('position');

      if (badgesError) {
        console.error('배지 로딩 에러:', badgesError);
        return;
      }

      const formattedBadges = badgesData.map(badge => ({
        ...badge,
        is_collected: badge.user_badges.some((ub: { user_id: string | undefined }) => ub?.user_id === user?.id)
      }));

      setBadges(formattedBadges);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const collectBadge = async (badgeId: string, userIdFromUrl: string) => {
    try {
      const { error } = await supabase
        .from('user_badges')
        .insert([{ user_id: userIdFromUrl, badge_id: badgeId }]);

      if (error) {
        console.error('배지 획득 에러:', error);
        return;
      }

      alert('배지를 성공적으로 획득했습니다!');
      router.push('/badges');
    } catch (error) {
      console.error('Error collecting badge:', error);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-black text-white px-4 py-8 pb-24">
        {loading ? (
          <div className="container mx-auto max-w-6xl">
            <div className="animate-pulse">
              {[1, 2, 3].map(month => (
                <div key={month} className="mb-16">
                  <div className="h-8 bg-gray-700 rounded w-32 mb-6"></div>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6">
                    {Array(8).fill(0).map((_, i) => (
                      <div key={i} className="aspect-square rounded-full bg-gray-700"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="container mx-auto max-w-6xl">
              <h1 className="text-3xl font-bold mb-2">나의 배지 현황</h1>
              <p className="text-gray-400 mb-12">
                매월 출석체크와 다양한 활동에 참여하여<br />
                특별한 배지를 수집해보세요! 😘
              </p>
              
              {months.map(month => (
                <div key={month} className="mb-16">
                  <div className="flex items-baseline mb-6">
                    <h2 className="text-2xl font-bold">{month}월</h2>
                    <span className="ml-2 text-lg text-gray-400">{monthNames[month-1]}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {badges
                      .filter(badge => badge.month === month)
                      .map((badge) => (
                        <div 
                          key={badge.id}
                          className="relative aspect-square"
                        >
                          <Image
                            src={badge.image_url}
                            alt={badge.name}
                            fill
                            className={`
                              object-contain p-1
                              ${badge.is_collected ? 'opacity-100' : 'opacity-50 grayscale'}
                            `}
                            loading="lazy"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            <BottomNav />
          </>
        )}
      </div>
    </Suspense>
  );
} 