'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Workshop } from '@/types/workshop';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [embedCode, setEmbedCode] = useState('');

  useEffect(() => {
    const checkAdminStatus = async () => {
      const supabase = createClientComponentClient();
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          setIsAdmin(false);
          return;
        }

        // 사용자의 admin 상태 확인
        const { data, error: roleError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        setIsAdmin(data?.is_admin || false);
      } catch (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return <div>로딩중...</div>;
  }

  if (!isAdmin) {
    return <div>접근 권한이 없습니다.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">관리자 페이지</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">워크샵 관리</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              임베드 코드
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={4}
              placeholder="<iframe> 코드를 입력하세요"
              value={embedCode}
              onChange={(e) => setEmbedCode(e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500">
              외부 서비스의 임베드 코드를 붙여넣으세요 (예: YouTube, Vimeo 등)
            </p>
          </div>
          
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            저장하기
          </button>
        </form>
      </div>
    </div>
  );
} 