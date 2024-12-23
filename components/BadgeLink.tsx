import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import QRCode from './qrcode';

interface BadgeLinkProps {
  badgeId: string;
  userId: string;
}

export default function BadgeLink({ badgeId, userId }: BadgeLinkProps) {
  const supabase = createClientComponentClient();

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