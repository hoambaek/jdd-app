'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import BottomNav from '../../components/BottomNav';

interface DoctrineClass {
  id: string;
  title: string;
  description: string;
  created_at: string;
  image_url?: string;
  lessons_count: number;
  link?: string;
}

export default function DoctrineManagementPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<DoctrineClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
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
        fetchDoctrineCourses();
      } catch (error) {
        console.error('관리자 확인 오류:', error);
        router.push('/login');
      }
    };

    checkAdminStatus();
  }, [router, supabase]);

  const fetchDoctrineCourses = async () => {
    try {
      setLoading(true);
      
      // 만약 실제 데이터베이스에 테이블이 없다면, 임시 데이터를 사용합니다
      const mockClasses: DoctrineClass[] = [
        {
          id: '1',
          title: '전례주년: 신앙의 흐름을 따라가는 여정',
          description: '가톨릭 전례력의 시작부터 끝까지, 신앙생활의 주기를 이해하는 교리 수업',
          created_at: new Date().toISOString(),
          image_url: '/images/liturgical-year.jpg',
          lessons_count: 1,
          link: '/liturgical-year'
        }
      ];
      
      setClasses(mockClasses);
      setLoading(false);
    } catch (error) {
      console.error('교리 수업 불러오기 오류:', error);
      setLoading(false);
    }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${link}`)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch(err => {
        console.error('클립보드 복사 실패:', err);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-indigo-700 font-medium">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-900">교리 수업 관리</h1>
        <button
          onClick={() => router.push('/admin/doctrine/add')}
          className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {classes.length > 0 ? (
          classes.map((course) => (
            <div
              key={course.id}
              className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/60"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{course.title}</h2>
              
              <div className="flex flex-col space-y-4">
                <div className="flex items-center bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex-1 font-mono text-sm text-gray-700 truncate">
                    {window.location.origin}{course.link}
                  </div>
                  <button
                    onClick={() => copyToClipboard(course.link || '')}
                    className="ml-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center"
                  >
                    {linkCopied ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        복사됨
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        복사하기
                      </>
                    )}
                  </button>
                </div>
                
                <Link 
                  href={course.link || '#'} 
                  className="bg-indigo-600 text-white py-2 px-4 rounded-md text-center hover:bg-indigo-700 transition-colors"
                >
                  페이지 방문하기
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 text-center shadow-lg border border-white/60">
            <div className="text-gray-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">등록된 교리 수업이 없습니다</h3>
            <p className="text-sm text-gray-600 mb-4">우측 상단의 + 버튼을 눌러 새 교리 수업을 추가하세요.</p>
            <button
              onClick={() => router.push('/admin/doctrine/add')}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              교리 수업 추가하기
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
} 