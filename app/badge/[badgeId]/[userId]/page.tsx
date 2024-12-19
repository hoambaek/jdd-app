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

  useEffect(() => {
    collectBadge();
  }, []);

  const collectBadge = async () => {
    try {
      // 1. 현재 로그인한 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMessage('로그인이 필요합니다.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      // 2. URL의 사용자 ID와 로그인한 사용자 ID가 일치하는지 확인
      if (user.id !== userId) {
        setMessage('본인의 배지 URL만 사용할 수 있습니다.');
        setTimeout(() => router.push('/badges'), 2000);
        return;
      }

      // 3. 이미 획득한 배지인지 확인
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select()
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .single();

      if (existingBadge) {
        setMessage('이미 획득한 배지입니다!');
        setTimeout(() => router.push('/badges'), 2000);
        return;
      }

      // 4. 배지 획득 조건 확인 (예: 특정 페이지 방문 횟수, 활동 완료 여부 등)
      const { data: badge } = await supabase
        .from('badges')
        .select('*')
        .eq('id', badgeId)
        .single();

      if (!badge) {
        setMessage('존재하지 않는 배지입니다.');
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
        <div className="mb-4 text-2xl">{message}</div>
        <div className="text-gray-400">잠시 후 배지 페이지로 이동합니다...</div>
      </div>
    </div>
  );
} 