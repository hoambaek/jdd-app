'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import styled from 'styled-components';
import BottomNav from '../../components/BottomNav';

interface Workshop {
  id: string;
  title: string;
  date: string;
}

interface Participant {
  id: string;
  name: string;
  baptismal_name: string;
  workshop_id: string;
  has_participated: boolean;
  has_attended: boolean;
}

interface ParticipantData {
  user_id: string;
  profiles: {
    id: string;
    name: string;
    baptismal_name: string;
  }
}

const WorkshopParticipantsPage = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [participants, setParticipants] = useState<{[key: string]: Participant[]}>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  const fetchWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('id, title, date')
        .order('date', { ascending: false });

      if (error) throw error;
      setWorkshops(data || []);
      
      if (data && data.length > 0) {
        await Promise.all(data.map(workshop => fetchParticipants(workshop.id)));
      }
    } catch (error) {
      console.error('Error fetching workshops:', error);
      alert('워크샵 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (workshopId: string) => {
    try {
      console.log('Fetching participants for workshop:', workshopId);

      const { data: participantsData, error: participantsError } = await supabase
        .from('workshop_participants')
        .select(`
          user_id,
          profiles:user_id (
            id,
            name,
            baptismal_name
          )
        `)
        .eq('workshop_id', workshopId) as { data: ParticipantData[] | null, error: any };

      if (participantsError) throw participantsError;

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('workshop_attendance')
        .select('user_id')
        .eq('workshop_id', workshopId);

      if (attendanceError) throw attendanceError;

      const attendedUserIds = new Set(attendanceData?.map(a => a.user_id) || []);

      const processedParticipants = participantsData?.map(p => ({
        id: p.profiles.id,
        name: p.profiles.name || '이름 없음',
        baptismal_name: p.profiles.baptismal_name || '세례명 없음',
        workshop_id: workshopId,
        has_participated: true,
        has_attended: attendedUserIds.has(p.user_id)
      })) || [];

      console.log('Processed participants:', processedParticipants);

      setParticipants(prev => ({
        ...prev,
        [workshopId]: processedParticipants
      }));
    } catch (error) {
      console.error('Error fetching participants for workshop', workshopId, ':', error);
      alert('참가자 목록을 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  if (loading) {
    return <div className="p-4">로딩 중...</div>;
  }

  return (
    <Container>
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 mb-8">
        워크샵 참가자 관리
      </h1>

      <div className="space-y-6">
        {workshops.map((workshop) => (
          <div 
            key={workshop.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* 워크샵 헤더 */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col mb-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {workshop.title}
                </h2>
                <div className="flex items-center text-gray-600">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-2" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-600 font-medium">
                    {new Date(workshop.date).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                      timeZone: 'Asia/Seoul'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* 참가자 목록 */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">참가자 목록</h3>
              {participants[workshop.id]?.length > 0 ? (
                <div className="space-y-3">
                  {participants[workshop.id].map((participant) => (
                    <div 
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium text-gray-800">{participant.name}</p>
                          <p className="text-sm text-gray-500">{participant.baptismal_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                          참가신청 완료
                        </span>
                        {participant.has_attended ? (
                          <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                            출석 완료
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                            미출석
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  참가자가 없습니다.
                </div>
              )}
            </div>
          </div>
        ))}

        {workshops.length === 0 && (
          <div className="text-center py-10 text-gray-500 bg-white rounded-lg">
            등록된 워크샵이 없습니다.
          </div>
        )}
      </div>

      <BottomNav />
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 80px;
`;

export default WorkshopParticipantsPage; 