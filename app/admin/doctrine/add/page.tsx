'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/BottomNav';

export default function AddDoctrinePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }

        // 사용자의 admin 상태 확인
        const { data, error: roleError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (roleError || !data?.is_admin) {
          router.push('/my');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('관리자 확인 오류:', error);
        router.push('/login');
      }
    };

    checkAdminStatus();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError('제목과 설명은 필수 입력 항목입니다.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 실제로는 Supabase에 데이터 저장 로직이 여기에 들어갈 것입니다
      // 현재는 단순히 mock 응답을 보여주고 리다이렉트합니다
      
      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/admin/doctrine');
      }, 1000);
      
    } catch (error) {
      console.error('교리 수업 저장 오류:', error);
      setError('교리 수업을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-indigo-700 font-medium">권한 확인 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 pb-24">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="mr-4 text-indigo-700 hover:text-indigo-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-indigo-900">새 교리 수업 추가</h1>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/60">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              수업 제목
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="예: 전례주년: 신앙의 흐름을 따라가는 여정"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              수업 설명
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="수업에 대한 간략한 설명을 입력하세요."
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              대표 이미지 URL (선택사항)
            </label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-1 text-xs text-gray-500">
              이미지가 없는 경우 기본 이미지가 사용됩니다.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  저장 중...
                </>
              ) : (
                '저장하기'
              )}
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
    </div>
  );
} 