"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Session } from '@supabase/supabase-js';

export function useRequireAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 현재 세션 가져오기
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('세션 확인 중 오류:', error);
          router.push('/login');
          return;
        }

        setSession(currentSession);
        
        if (!currentSession) {
          console.log('세션이 없습니다. 로그인 페이지로 이동합니다.');
          router.push('/login');
        }
      } catch (error) {
        console.error('인증 확인 중 오류:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    // 초기 세션 확인
    checkAuth();

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  return { session, loading };
} 