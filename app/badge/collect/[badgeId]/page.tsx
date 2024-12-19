"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const monthNames = [
  'january', 'february', 'march', 'april',
  'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december'
];

function getBadgePath(month: number, position: number) {
  const monthPadded = month.toString().padStart(2, '0');
  const monthName = monthNames[month - 1];
  const badgePadded = position.toString().padStart(2, '0');
  return `badges/${monthPadded}_${monthName}/badge_${badgePadded}.png`;
}

export default function BadgeCollect({ params }: { params: { badgeId: string } }) {
  const router = useRouter();
  const [message, setMessage] = useState('배지 획득 중...');

  useEffect(() => {
    const collectBadge = async () => {
      try {
        const [month, position] = params.badgeId.split('-').map(Number);
        
        if (!month || !position || month < 1 || month > 12 || position < 1) {
          setMessage('잘못된 배지 정보입니다');
          setTimeout(() => router.push('/badges'), 2000);
          return;
        }

        // Supabase Storage 경로 생성
        const badgePath = getBadgePath(month, position);
        
        // 배지 이미지 존재 여부 확인
        const { data, error: storageError } = await supabase
          .storage
          .from('badges')
          .list(badgePath.split('/').slice(0, -1).join('/'));

        if (storageError || !data.some(file => file.name === `badge_${position.toString().padStart(2, '0')}.png`)) {
          setMessage('존재하지 않는 배지입니다');
          setTimeout(() => router.push('/badges'), 2000);
          return;
        }

        // 1. 사용자 확인
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setMessage('로그인이 필요합니다');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // 2. 이미 획득한 배지인지 확인
        const { data: existingBadge } = await supabase
          .from('user_badges')
          .select()
          .eq('user_id', user.id)
          .eq('month', month)
          .eq('position', position)
          .single();

        if (existingBadge) {
          setMessage('이미 획득한 배지입니다');
          setTimeout(() => router.push('/badges'), 2000);
          return;
        }

        // 3. 배지 정보 가져오기
        const { data: badge, error: badgeError } = await supabase
          .from('badges')
          .select()
          .eq('month', month)
          .eq('position', position)
          .single();

        if (badgeError || !badge) {
          throw new Error('배지 정보를 찾을 수 없습니다');
        }

        // 4. 새로운 배지 획득 기록
        const { error } = await supabase
          .from('user_badges')
          .insert({
            user_id: user.id,
            badge_id: badge.id,
            month: month,
            position: position,
            collected_at: new Date().toISOString()
          });

        if (error) throw error;

        setMessage('배지를 획득했습니다!');
        setTimeout(() => router.push('/badges'), 2000);

      } catch (error) {
        console.error('배지 획득 실패:', error);
        setMessage('배지 획득에 실패했습니다');
        setTimeout(() => router.push('/badges'), 2000);
      }
    };

    collectBadge();
  }, [params.badgeId, router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{message}</h1>
      </div>
    </div>
  );
} 