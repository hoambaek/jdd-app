"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CollectBadge() {
  const router = useRouter();

  useEffect(() => {
    const collectBadge = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const badgeId = urlParams.get('badgeId');

      if (badgeId) {
        const { error } = await supabase
          .from('user_badges')
          .insert({ user_id: user.id, badge_id: badgeId });

        if (error) {
          console.error('배지 획득 중 오류 발생:', error.message);
          alert(`배지 획득 중 오류가 발생했습니다: ${error.message}`);
        } else {
          alert('배지를 성공적으로 획득했습니다!');
          router.push('/badges');
        }
      } else {
        alert('유효한 배지 ID가 제공되지 않았습니다.');
      }
    };

    collectBadge();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p>배지를 획득 중입니다...</p>
    </div>
  );
} 