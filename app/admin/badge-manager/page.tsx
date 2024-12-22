"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import QRCode from '@/components/qrcode';
import { createBadgeLink } from '@/utils/badge';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/utils/supabaseClient';

// 타입 정의
interface Badge {
  id: number;
  name: string;
  description: string;
  image_url: string;
  qr_code_url?: string;
  month: number;
  position: number;
}

interface FormData {
  name: string;
  description: string;
  image_url: string;
}

// 타입 정의 추가
interface UpdatedBadge extends Badge {
  created_at?: string;
}

const BadgeImage = ({ src, alt }: { src: string; alt: string }) => (
  <img
    src={src}
    alt={alt}
    style={{
      filter: 'grayscale(100%)', // 모노톤으로 변환
      opacity: 0.4, // 투명도 40%
    }}
  />
);

const BadgeDisplay = ({ isAdmin }: { isAdmin: boolean }) => {
  const badgeSrc = isAdmin ? 'admin-badge.png' : 'user-badge.png'; // 예시 이미지 경로
  const badgeAlt = isAdmin ? 'Admin Badge' : 'User Badge';

  return <BadgeImage src={badgeSrc} alt={badgeAlt} />;
};

export default function BadgeManager() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const { data, error } = await supabase
          .from('badges')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBadges(data || []);
      } catch (error: any) {
        console.error('Error fetching badges:', error);
        setError('Failed to load badges');
      }
    };

    fetchBadges();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {badges.map((badge) => (
        <div key={badge.id}>
          <BadgeImage src={badge.qr_code_url} alt={badge.name} />
          {/* 기타 배지 정보 표시 */}
        </div>
      ))}
    </div>
  );
} 