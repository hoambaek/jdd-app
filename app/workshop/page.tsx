'use client'

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BottomNav from '../components/BottomNav';
import { useRequireAuth } from '../hooks/useRequireAuth';
import type { Database } from '@/types/supabase';

interface Workshop {
  id: string;
  created_at: string;
  date: string;
  title: string;
  content: string;
  image_url: string;
  url: string;
}

const WorkshopPage = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [participations, setParticipations] = useState<{[key: string]: boolean}>({});
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const { session } = useRequireAuth();

  useEffect(() => {
    fetchWorkshops();
    if (session?.user?.id) {
      fetchParticipations();
    }
  }, [session]);

  const fetchWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .order('date', { ascending: true }); // 날짜순 정렬

      if (error) throw error;
      setWorkshops(data || []);
    } catch (error) {
      console.error('Error fetching workshops:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipations = async () => {
    try {
      const { data, error } = await supabase
        .from('workshop_participants')
        .select('workshop_id')
        .eq('user_id', session?.user?.id);

      if (error) throw error;

      const participationStatus = (data || []).reduce((acc, curr) => ({
        ...acc,
        [curr.workshop_id]: true
      }), {});

      setParticipations(participationStatus);
    } catch (error) {
      console.error('Error fetching participations:', error);
    }
  };

  const handleParticipate = async (workshopId: string) => {
    if (!session?.user?.id) {
      alert('참가하기 위해서는 로그인이 필요합니다.');
      return;
    }

    if (participations[workshopId]) {
      alert('이미 참가 신청하셨습니다.');
      return;
    }

    try {
      const { error: participateError } = await supabase
        .from('workshop_participants')
        .insert([
          {
            workshop_id: workshopId,
            user_id: session.user.id,
          }
        ]);

      if (participateError) throw participateError;

      setParticipations(prev => ({
        ...prev,
        [workshopId]: true
      }));

      alert('워크샵 참가 신청이 완료되었습니다!');
    } catch (error) {
      console.error('Error participating in workshop:', error);
      alert('참가 신청 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = async (workshopId: string) => {
    if (!session?.user?.id) return;

    if (confirm('참가 신청을 취소하시겠습니까?')) {
      try {
        const { error } = await supabase
          .from('workshop_participants')
          .delete()
          .eq('workshop_id', workshopId)
          .eq('user_id', session.user.id);

        if (error) throw error;

        setParticipations(prev => ({
          ...prev,
          [workshopId]: false
        }));

        alert('참가 신청이 취소되었습니다.');
      } catch (error) {
        console.error('Error canceling participation:', error);
        alert('참가 신청 취소 중 오류가 발생했습니다.');
      }
    }
  };

  const handleAttendance = async (workshopId: string, url: string) => {
    if (!session?.user?.id) return;

    try {
      // 먼저 이미 출석했는지 확인
      const { data: existingAttendance, error: checkError } = await supabase
        .from('workshop_attendance')
        .select('*')
        .eq('workshop_id', workshopId)
        .eq('user_id', session.user.id)
        .single();

      // 이미 출석한 경우 바로 URL로 이동
      if (existingAttendance) {
        if (url) {
          window.location.href = url;
        }
        return;
      }

      // 출석하지 않은 경우 출석 기록 추가
      const { error: attendanceError } = await supabase
        .from('workshop_attendance')
        .insert([
          {
            workshop_id: workshopId,
            user_id: session.user.id,
            attended_at: new Date().toISOString()
          }
        ]);

      if (attendanceError) throw attendanceError;

      if (url) {
        window.location.href = url;
      } else {
        alert('출석이 완료되었습니다!');
      }
    } catch (error) {
      console.error('Error recording attendance:', error);
      alert('출석 처리 중 오류가 발생했습니다.');
    }
  };

  const isWorkshopToday = (workshopDate: string) => {
    const today = new Date();
    const workshop = new Date(workshopDate);
    return today.toDateString() === workshop.toDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">로딩중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 mb-8">
          Workshops
        </h1>
        
        <div className="space-y-6">
          {workshops.map((workshop) => (
            <div 
              key={workshop.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02] duration-300"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={workshop.image_url}
                  alt={workshop.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="p-6">
                <div className="flex flex-col mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {workshop.title}
                  </h2>
                  <div className="flex items-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-blue-500 mr-2" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {new Date(workshop.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} {new Date(workshop.date).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true // 오전/오후 표시
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 whitespace-pre-wrap">
                  {workshop.content}
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => handleParticipate(workshop.id)}
                    disabled={participations[workshop.id]}
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                      ${participations[workshop.id] 
                        ? 'bg-green-100 text-green-600 cursor-not-allowed hover:bg-green-100' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90'
                      }`}
                  >
                    {participations[workshop.id] ? (
                      <>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        참가신청 완료
                      </>
                    ) : (
                      <>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        참가하기
                      </>
                    )}
                  </button>

                  {participations[workshop.id] && (
                    <button
                      onClick={() => handleCancel(workshop.id)}
                      className={`w-full py-2 rounded-xl font-medium transition-all duration-300 
                        ${isWorkshopToday(workshop.date)
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'border border-red-200 text-red-500 hover:bg-red-50'
                        }`}
                    >
                      {isWorkshopToday(workshop.date) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAttendance(workshop.id, workshop.url);
                          }}
                          className="w-full py-2 rounded-xl font-medium transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-5 w-5" 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59l-2.22-2.22a.75.75 0 10-1.06 1.06l3.5 3.5a.75.75 0 001.06 0l3.5-3.5a.75.75 0 10-1.06-1.06l-2.22 2.22v-4.59z" clipRule="evenodd" />
                            </svg>
                            워크샵 참석하기
                          </div>
                        </button>
                      ) : (
                        '참가신청 취소'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {workshops.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              현재 예정된 워크샵이 없습니다.
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default WorkshopPage; 