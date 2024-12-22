"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import QRCode from '@/components/qrcode';
import { createBadgeLink } from '@/utils/badge';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

export default function AdminPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    image_url: ''
  });

  const checkAdmin = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!session) {
        setIsAdmin(false);
        setError('로그인이 필요합니다.');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile && profile.role === 'admin') {
        setIsAdmin(true);
        setError(null);
      } else {
        setIsAdmin(false);
        setError('관리자 권한이 없습니다.');
      }
    } catch (error: any) {
      console.error('Admin check error:', error);
      setIsAdmin(false);
      setError('권한 확인 중 오류가 발생했습니다.');
    }
  };

  const loadBadges = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('로그인이 필요합니다.');
        return;
      }

      // 배지 데이터 가져오기
      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: false });

      if (badgesError) {
        console.error('Error fetching badges:', badgesError);
        throw badgesError;
      }

      console.log('Loaded badges:', badgesData);
      setBadges(badgesData || []);
      setIsAdmin(true);
      setError(null);
      
    } catch (error: any) {
      console.error('Error in loadBadges:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBadges();
  }, []);

  const handleGenerateLink = async (badge: Badge) => {
    try {
      const url = await createBadgeLink(badge.id);
      if (!url) throw new Error('링크 생성에 실패했습니다.');

      const { data, error: updateError } = await supabase
        .from('badges')
        .update({ qr_code_url: url })
        .eq('id', badge.id)
        .select();

      if (updateError) throw updateError;
      
      if (!data || data.length === 0) {
        throw new Error('배지 업데이트 실패');
      }

      setBadges(prevBadges => 
        prevBadges.map(b => 
          b.id === badge.id ? { ...b, qr_code_url: url } as Badge : b
        )
      );

      alert('QR 코드가 성공적으로 생성되었습니다!');
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'QR 코드 생성 중 오류가 발생했습니다.');
    }
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.description || !formData.image_url) {
        throw new Error('모든 필드를 입력해주세요.');
      }

      // Supabase Storage에 이미지 업로드 후 URL 가져오기
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('your-bucket-name') // 버킷 이름을 적절히 변경하세요
        .upload(`public/${formData.name}.png`, formData.image_url);

      if (uploadError) {
        throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
      }

      const imageUrl = supabase
        .storage
        .from('your-bucket-name')
        .getPublicUrl(`public/${formData.name}.png`).publicURL;

      if (!imageUrl) {
        throw new Error('이미지 URL 생성 실패');
      }

      const currentMonth = new Date().getMonth() + 1;
      const maxPosition = badges.length > 0 
        ? Math.max(...badges.map(b => b.position || 0))
        : 0;

      const newBadgeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image_url: imageUrl, // 올바른 이미지 URL 설정
        month: currentMonth,
        position: maxPosition + 1,
        created_at: new Date().toISOString()
      };

      console.log('Creating badge with data:', newBadgeData);

      const { data, error } = await supabase
        .from('badges')
        .insert([newBadgeData])
        .select('*');

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`배지 생성 실패: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('배지 데이터 생성 실패');
      }

      const newBadge = data[0];
      console.log('Successfully created badge:', newBadge);

      // 새로운 배지 데이터로 상태 업데이트
      setBadges(prevBadges => [newBadge, ...prevBadges]);
      
      // 폼 초기화
      setFormData({
        name: '',
        description: '',
        image_url: ''
      });
      
      setIsEditMode(false);
      alert('배지가 성공적으로 생성되었습니다!');

      // 배지 목록 새로고침
      await loadBadges();

    } catch (err: any) {
      console.error('Error creating badge:', err);
      alert(err.message || '배지 생성 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteBadge = async (id: number) => {
    try {
      const { error } = await supabase
        .from('badges')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBadges(prevBadges => prevBadges.filter(badge => badge.id !== id));
      alert('배지가 성공적으로 삭제되었습니다!');

    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || '배지 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteQRCode = async (badge: Badge) => {
    try {
      const { data, error: updateError } = await supabase
        .from('badges')
        .update({ qr_code_url: null })
        .eq('id', badge.id)
        .select();

      if (updateError) throw updateError;

      if (!data || data.length === 0) {
        throw new Error('QR 코드 삭제 실패');
      }

      setBadges(prevBadges =>
        prevBadges.map(b =>
          b.id === badge.id ? { ...b, qr_code_url: null } : b
        )
      );

      alert('QR 코드가 성공적으로 삭제되었습니다!');
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'QR 코드 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl">로딩 중...</h1>
        </div>
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl">{error || '접근 권한이 없습니다.'}</h1>
          <button 
            onClick={loadBadges}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">배지 관리</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 12 }, (_, month) => (
          <div key={month} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{month + 1}월</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {badges
                .filter(badge => badge.month === month + 1)
                .sort((a, b) => a.position - b.position)
                .map(badge => (
                  <div key={badge.id} className="p-2 border border-gray-700 rounded-lg">
                    {badge.image_url && (
                      <img
                        src={badge.image_url}
                        alt={badge.name}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    <h3 className="text-lg font-medium">{badge.name}</h3>
                    <p className="text-gray-400 mt-1">{badge.description}</p>

                    {badge.qr_code_url && (
                      <div className="mt-2">
                        <QRCode url={badge.qr_code_url} />
                        <button
                          onClick={() => handleDeleteQRCode(badge)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-600 rounded hover:bg-red-700 mt-2"
                        >
                          QR코드 삭제
                        </button>
                      </div>
                    )}

                    <div className="mt-2">
                      {!badge.qr_code_url && (
                        <button
                          onClick={() => handleGenerateLink(badge)}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600 rounded hover:bg-green-700"
                        >
                          QR코드 생성
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 