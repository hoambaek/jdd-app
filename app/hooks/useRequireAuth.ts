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
    const initSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (!currentSession) {
          router.push('/login');
        }
      } catch (error) {
        console.error('세션 초기화 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setLoading(false);
      
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    initSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return { session, loading };
} 