"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BadgeQRCode } from '@/components/qrcode';
import { createBadgeLink } from '@/utils/badge';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBadge, setEditingBadge] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  });

  useEffect(() => {
    checkAdminAndLoadBadges();
  }, []);

  const checkAdminAndLoadBadges = async () => {
    try {
      setLoading(true);
      
      // 1. 사용자 확인
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('User check:', user, userError); // 디버깅용
      
      if (userError) {
        console.error('User error:', userError);
        setError('사용자 인증 오류가 발생했습니다.');
        return;
      }
      
      if (!user) {
        setError('로그인이 필요합니다.');
        return;
      }

      // 2. 관리자 권한 확인
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      console.log('Profile check:', profile, profileError); // 디버깅용

      if (profileError) {
        console.error('Profile error:', profileError);
        setError('프로필 정보를 불러올 수 없습니다.');
        return;
      }

      if (!profile?.is_admin) {
        setError('관리자 권한이 없습니다.');
        return;
      }

      setIsAdmin(true);

      // 3. 배지 목록 로드
      const { data: badgeData, error: badgeError } = await supabase
        .from('badges')
        .select('*')
        .order('id', { ascending: false });

      console.log('Badge data:', badgeData, badgeError); // 디버깅용

      if (badgeError) {
        console.error('Badge error:', badgeError);
        throw badgeError;
      }

      setBadges(badgeData || []);
      setError(null);

    } catch (err: any) {
      console.error('Detailed error:', err);
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async (badge: any) => {
    try {
      const url = await createBadgeLink(badge.id);
      if (!url) throw new Error('링크 생성에 실패했습니다.');

      const { error: updateError } = await supabase
        .from('badges')
        .update({ qr_code_url: url })
        .eq('id', badge.id)
        .select('*')
        .single();

      if (updateError) throw updateError;

      setBadges(prevBadges => 
        prevBadges.map(b => 
          b.id === badge.id ? { ...b, qr_code_url: url } : b
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
      // 폼 데이터 검증
      if (!formData.name || !formData.description || !formData.image_url) {
        throw new Error('모든 필드를 입력해주세요.');
      }

      // 현재 월 구하기 (1-12)
      const currentMonth = new Date().getMonth() + 1;

      // 현재 배지들의 최대 position 값 구하기
      const maxPosition = badges.length > 0 
        ? Math.max(...badges.map(b => b.position))
        : 0;

      console.log('Attempting to create badge with data:', {
        ...formData,
        month: currentMonth,
        position: maxPosition + 1
      });

      // 배지 생성
      const { data, error } = await supabase
        .from('badges')
        .insert([{
          name: formData.name.trim(),
          description: formData.description.trim(),
          image_url: formData.image_url.trim(),
          month: currentMonth,
          position: maxPosition + 1  // 새로운 position 값 추가
        }])
        .select('*');

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`배지 생성 실패: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('배지 데이터 생성 실패');
      }

      console.log('Successfully created badge:', data[0]);

      // 상태 업데이트
      setBadges(prevBadges => [data[0], ...prevBadges]);
      setFormData({ name: '', description: '', image_url: '' });
      setIsEditMode(false);

      alert('배지가 성공적으로 생성되었습니다!');

    } catch (err: any) {
      console.error('Error creating badge:', err);
      alert(err.message || '배지 생성 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('badges')
        .update(formData)
        .eq('id', editingBadge.id);

      if (error) throw error;
      
      setBadges(badges.map(b => 
        b.id === editingBadge.id ? { ...b, ...formData } : b
      ));
      setEditingBadge(null);
      setFormData({ name: '', description: '', image_url: '' });
    } catch (err: any) {
      alert('배지 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteBadge = async (badgeId: number) => {
    if (!window.confirm('정말로 이 배지를 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('badges')
        .delete()
        .eq('id', badgeId);

      if (error) throw error;
      
      setBadges(badges.filter(b => b.id !== badgeId));
    } catch (err: any) {
      alert('배지 삭제 중 오류가 발생했습니다.');
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
            onClick={checkAdminAndLoadBadges}
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
            {badge.imageUrl && (
              <img 
                src={badge.imageUrl} 
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
                    image_url: badge.imageUrl || ''
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