"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  const [loading, setLoading] = useState(true);

  const monthNames = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    checkUser();
    loadBadges();
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
      const { data: { user } } = await supabase.auth.getUser();

      const { data: badgesData, error } = await supabase
        .from('badges')
        .select(`
          *,
          user_badges!left(user_id)
        `)
        .order('month')
        .order('position');

      if (error) {
        console.error('배지 로딩 에러:', error);
        return;
      }

      const formattedBadges = badgesData.map(badge => {
        const monthStr = badge.month.toString().padStart(2, '0');
        const positionStr = badge.position.toString().padStart(2, '0');
        const folderName = `${monthStr}_${monthNames[badge.month - 1].toLowerCase()}`;
        const fileName = `badge_${positionStr}.png`;
        const filePath = `${folderName}/${fileName}`;

        const { data: { publicUrl } } = supabase.storage
          .from('badges')
          .getPublicUrl(filePath);

        console.log('월:', badge.month, '위치:', badge.position);
        console.log('생성된 경로:', filePath);
        console.log('최종 URL:', publicUrl);

        return {
          ...badge,
          image_url: publicUrl,
          is_collected: badge.user_badges.some(ub => ub?.user_id === user?.id)
        };
      });

      setBadges(formattedBadges);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
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
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold mb-2">나의 리워드 현황</h1>
          <p className="text-gray-400 mb-12">매월 출석체크와 활동에 참여해서 배지를 모아보세요</p>
          
          {months.map(month => (
            <div key={month} className="mb-16">
              <div className="flex items-baseline mb-6">
                <h2 className="text-2xl font-bold">{month}월</h2>
                <span className="ml-2 text-lg text-gray-400">January</span>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {Array(6).fill(null).map((_, position) => {
                  const badge = badges.find(b => b.month === month && b.position === position + 1);
                  
                  return (
                    <div 
                      key={`${month}-${position}`}
                      className="relative aspect-square"
                    >
                      <Image
                        src={badge?.image_url || '/badges/placeholder-badge.png'}
                        alt={badge?.name || '배지'}
                        fill
                        className={`
                          object-contain p-1
                          ${badge?.is_collected ? 'opacity-100' : 'opacity-80 grayscale'}
                        `}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/badges/placeholder-badge.png';
                          console.error('이미지 로딩 실패:', badge?.image_url);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 