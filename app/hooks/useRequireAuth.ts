import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../components/SessionProvider';

export function useRequireAuth() {
  const { session, loading } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!session) {
        const currentPath = window.location.pathname;
        router.push(`/login?redirectTo=${currentPath}`);
      }
      setIsChecking(false);
    }
  }, [session, loading, router]);

  return { session, loading: loading || isChecking };
} 