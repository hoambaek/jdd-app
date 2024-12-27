import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import QRCode from './qrcode';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface BadgeLinkProps {
  badgeId: string;
  userId: string;
}

export default function BadgeLink({ badgeId, userId }: BadgeLinkProps) {
  const supabase = createClientComponentClient();
  const [showQR, setShowQR] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function checkPermissions() {
      // admin/badge-manager 경로가 아니면 QR 코드를 표시하지 않음
      if (!pathname.startsWith('/admin/badge-manager')) {
        setShowQR(false);
        return;
      }

      // 현재 로그인한 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      
      // 관리자 권한만 확인
      const { data: userRole } = await supabase
        .from('users')
        .select('role')
        .eq('id', user?.id)
        .single();

      // 관리자인 경우에만 QR 표시
      setShowQR(userRole?.role === 'admin');
    }

    checkPermissions();
  }, [pathname]);

  if (!showQR) return null;

  return (
    <div className="flex flex-col items-center">
      <QRCode badgeId={badgeId} userId={userId} />
    </div>
  );
}

export async function createBadgeLink(badgeId: number): Promise<string> {
  const supabase = createClientComponentClient();
  
  try {
    const timestamp = Date.now();
    const uniqueId = `${badgeId}-${timestamp}`;
    
    const { data, error } = await supabase
      .from('badge_links')
      .insert([
        {
          badge_id: badgeId,
          unique_code: uniqueId,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    const baseUrl = window.location.origin;
    const finalUrl = `${baseUrl}/badge/${uniqueId}`;

    return finalUrl;
  } catch (err) {
    console.error('Error creating badge link:', err);
    throw err;
  }
} 