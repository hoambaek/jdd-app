"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BadgeQRCode } from '@/components/qrcode';
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
        .single();

      if (profileError) throw profileError;

      if (profile?.role === 'admin') {
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
      await checkAdmin();

      if (!isAdmin) {
        return;
      }

      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 타입 단언 추가
      setBadges(data as Badge[] || []);
      setError(null);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBadges();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerateLink = async (badge: Badge) => {
    try {
      const url = await createBadgeLink(badge.id);
      if (!url) throw new Error('링크 생성에 실패했습니다.');

      const { data: updatedBadge, error: updateError } = await supabase
        .from('badges')
        .update({ qr_code_url: url })
        .eq('id', badge.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // 타입 단언 추가
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

      const currentMonth = new Date().getMonth() + 1;

      // 현재 배지들의 최대 position 값 구하기
      const maxPosition = badges.length > 0 
        ? Math.max(...badges.map(b => b.position || 0))
        : 0;

      const { data, error } = await supabase
        .from('badges')
        .insert([{
          ...formData,
          month: currentMonth,
          position: maxPosition + 1  // position 값 추가
        }])
        .select('*')
        .single();

      if (error) throw error;

      setBadges(prevBadges => [data as Badge, ...prevBadges]);
      setFormData({ name: '', description: '', image_url: '' });
      setIsEditMode(false);
      alert('배지가 성공적으로 생성되었습니다!');

    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || '배지 생성 중 오류가 발생했습니다.');
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
      
      <button
        onClick={() => setIsEditMode(true)}
        className="mb-8 flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
      >
        <PlusIcon className="w-5 h-5" />
        새 배지 만들기
      </button>

      {(isEditMode || editingBadge) && (
        <form 
          onSubmit={editingBadge ? handleUpdateBadge : handleCreateBadge}
          className="mb-8 p-6 border border-gray-700 rounded-lg"
        >
          <h2 className="text-xl font-semibold mb-4">
            {editingBadge ? '배지 수정' : '새 배지 만들기'}
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="배지 이름"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 bg-gray-800 rounded"
              required
            />
            <input
              type="text"
              placeholder="배지 설명"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full p-2 bg-gray-800 rounded"
              required
            />
            <input
              type="url"
              placeholder="이미지 URL"
              value={formData.image_url}
              onChange={e => setFormData({...formData, image_url: e.target.value})}
              className="w-full p-2 bg-gray-800 rounded"
              required
            />
          </div>
          <div className="mt-4 space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              {editingBadge ? '수정하기' : '만들기'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditMode(false);
                setEditingBadge(null);
                setFormData({ name: '', description: '', image_url: '' });
              }}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
            >
              취소
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => (
          <div 
            key={badge.id} 
            className="p-4 border border-gray-700 rounded-lg"
          >
            {badge.image_url && (
              <img 
                src={badge.image_url} 
                alt={badge.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            <h3 className="text-lg font-medium">{badge.name}</h3>
            <p className="text-gray-400 mt-1">{badge.description}</p>
            
            {/* QR 코드 표시 */}
            {badge.qr_code_url && (
              <div className="mt-4">
                <BadgeQRCode url={badge.qr_code_url} />
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setEditingBadge(badge);
                  setFormData({
                    name: badge.name,
                    description: badge.description,
                    image_url: badge.image_url || ''
                  });
                }}
                className="flex items-center gap-1 px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700"
              >
                <PencilIcon className="w-4 h-4" />
                수정
              </button>
              <button
                onClick={() => handleDeleteBadge(badge.id)}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 rounded hover:bg-red-700"
              >
                <TrashIcon className="w-4 h-4" />
                삭제
              </button>
              {!badge.qr_code_url && (
                <button
                  onClick={() => handleGenerateLink(badge)}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 rounded hover:bg-green-700"
                >
                  QR코드 생성
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 