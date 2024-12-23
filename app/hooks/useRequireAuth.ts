"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Session } from '@supabase/supabase-js';

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('인증 확인 중 오류 발생:', error);
          router.push(`/login?redirectTo=${pathname || ''}`);
          return;
        }

        if (!currentSession) {
          router.push(`/login?redirectTo=${pathname || ''}`);
          return;
        }

        setSession(currentSession);
      } catch (error) {
        console.error('인증 확인 중 예외 발생:', error);
        router.push(`/login?redirectTo=${pathname || ''}`);
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      
      if (!session) {
        router.push(`/login?redirectTo=${pathname || ''}`);
      }
    });

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname, supabase.auth]);

  return { session, loading };
} 