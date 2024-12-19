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
        const folderName = `${monthStr}_${getMonthName(badge.month)}`;
        const fileName = `badge_${positionStr}.png`;
        const filePath = `badges/${folderName}/${fileName}`;

        const { data: { publicUrl } } = supabase.storage
          .from('badges')
          .getPublicUrl(filePath);

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

  const getMonthName = (month: number): string => {
    const months = [
      'january', 'february', 'march', 'april',
      'may', 'june', 'july', 'august',
      'september', 'october', 'november', 'december'
    ];
    return months[month - 1];
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
              
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6">
                {badges
                  .filter(badge => badge.month === month)
                  .map(badge => (
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
                          ${badge.is_collected ? 'opacity-100' : 'opacity-30 grayscale'}
                        `}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-badge.png'; // 기본 이미지 경로
                        }}
                      />
                      
                      {!badge.is_collected && (
                        <a
                          href={`/badge/${badge.id}/${userId}`}
                          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <div className="w-full h-full flex items-center justify-center rounded-full border-2 border-gray-500 hover:border-white transition-colors">
                            <span className="text-sm text-white">획득하기</span>
                          </div>
                        </a>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 