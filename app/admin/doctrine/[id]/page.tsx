'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BottomNav from '../../../components/BottomNav';

interface DoctrineLesson {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface DoctrineClass {
  id: string;
  title: string;
  description: string;
  created_at: string;
  image_url?: string;
  lessons: DoctrineLesson[];
}

export default function DoctrineDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [doctrineClass, setDoctrineClass] = useState<DoctrineClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
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
        fetchDoctrineClass();
      } catch (error) {
        console.error('관리자 확인 오류:', error);
        router.push('/login');
      }
    };

    checkAdminStatus();
  }, [router, supabase]);

  const fetchDoctrineClass = async () => {
    try {
      setLoading(true);
      
      // 실제 데이터베이스 연동 시 아래 코드를 사용합니다
      // const { data, error } = await supabase
      //   .from('doctrine_classes')
      //   .select('*, lessons(*)')
      //   .eq('id', params.id)
      //   .single();
      
      // 현재는 모의 데이터를 생성합니다
      if (params.id === '1') {
        const mockData: DoctrineClass = {
          id: '1',
          title: '전례주년: 신앙의 흐름을 따라가는 여정',
          description: '가톨릭 전례력의 시작부터 끝까지, 신앙생활의 주기를 이해하는 교리 수업',
          created_at: new Date().toISOString(),
          image_url: '/images/liturgical-year.jpg',
          lessons: [
            {
              id: '101',
              title: '1. 전례주년의 시작: 대림시기',
              content: '대림시기의 의미와 전례',
              order: 1
            },
            {
              id: '102',
              title: '2. 주님 성탄 대축일과 성탄시기',
              content: '예수 그리스도의 탄생을 기념하는 전례',
              order: 2
            },
            {
              id: '103',
              title: '3. 사순시기: 회개와 준비의 시간',
              content: '사순시기의 의미와 실천',
              order: 3
            }
          ]
        };
        
        setDoctrineClass(mockData);
      } else {
        setError('찾을 수 없는 교리 수업입니다.');
      }
      
    } catch (error) {
      console.error('교리 수업 불러오기 오류:', error);
      setError('교리 수업을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-indigo-700 font-medium">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 flex flex-col items-center justify-center">
        <div className="text-red-600 font-medium mb-4">{error}</div>
        <button
          onClick={() => router.push('/admin/doctrine')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          교리수업 목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (!doctrineClass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-indigo-700 font-medium">수업을 찾을 수 없습니다</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 pb-24">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.push('/admin/doctrine')}
          className="mr-4 text-indigo-700 hover:text-indigo-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-indigo-900 line-clamp-1">{doctrineClass.title}</h1>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/60 mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="w-full md:w-1/3 rounded-lg overflow-hidden h-48 bg-gray-100 mb-4 md:mb-0">
            {doctrineClass.image_url ? (
              <Image
                src={doctrineClass.image_url}
                alt={doctrineClass.title}
                width={400}
                height={300}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{doctrineClass.title}</h2>
            <p className="text-gray-600 mb-4">{doctrineClass.description}</p>
            
            <div className="flex items-center text-gray-500 mb-4">
              <span className="text-sm">
                {new Date(doctrineClass.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} 등록
              </span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => router.push(`/admin/doctrine/${doctrineClass.id}/edit`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                수업 정보 수정
              </button>
              <button 
                onClick={() => router.push(`/admin/doctrine/${doctrineClass.id}/lesson/add`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                차시 추가
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-indigo-900">수업 차시 목록</h2>
        <span className="text-sm text-indigo-600 font-medium">총 {doctrineClass.lessons.length}개 차시</span>
      </div>

      <div className="space-y-3">
        {doctrineClass.lessons.length > 0 ? (
          doctrineClass.lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow border border-white/60 hover:shadow-md transition-shadow"
              onClick={() => router.push(`/admin/doctrine/${doctrineClass.id}/lesson/${lesson.id}`)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">{lesson.content}</p>
            </div>
          ))
        ) : (
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 text-center shadow border border-white/60">
            <div className="text-gray-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">등록된 차시가 없습니다</h3>
            <p className="text-sm text-gray-600 mb-4">새로운 차시를 추가하여 수업을 구성해보세요.</p>
            <button
              onClick={() => router.push(`/admin/doctrine/${doctrineClass.id}/lesson/add`)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              차시 추가하기
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
} 