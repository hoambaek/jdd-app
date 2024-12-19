import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function createBadgeLink(badgeId: number): Promise<string> {
  try {
    // 현재 시간을 기준으로 고유한 링크 생성
    const timestamp = Date.now();
    const uniqueId = `${badgeId}-${timestamp}`;
    
    // badge_links 테이블에 새로운 레코드 생성
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

    // 프론트엔드 URL 구성
    const baseUrl = window.location.origin;
    const finalUrl = `${baseUrl}/badge/${uniqueId}`;

    return finalUrl;
  } catch (err) {
    console.error('Error creating badge link:', err);
    throw err;
  }
}

interface BadgeLinkProps {
  data?: any; // 사용하지 않는 prop 제거
}

export const BadgeLink: React.FC<BadgeLinkProps> = () => {
  // 구현
}; 