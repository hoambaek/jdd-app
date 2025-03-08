'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import styled from 'styled-components';
import BottomNav from '../../components/BottomNav';

// Supabase에서 반환하는 데이터 구조에 맞는 타입 정의
interface UserBadgeRecord {
  user_id: string;
  badge_id: string;
  badges: {
    name: string;
  };
}

interface UserBadge {
  user: {
    id: string;
    name: string;
    baptismal_name: string;
    grade: string;
  };
  badges: {
    [key: string]: boolean; // 'YYYY-MM-W1', 'YYYY-MM-S1' 형식의 키와 획득 여부
  };
}

const gradeOrder = ['중1', '중2', '중3', '고1', '고2', '고3'];

// 월별 색상 정의
const monthColors: { [key: string]: { main: string; light: string; dark: string; text: string } } = {
  '1': { main: '#3B82F6', light: 'rgba(59, 130, 246, 0.15)', dark: '#2563EB', text: '#1E40AF' }, // 파랑
  '2': { main: '#EC4899', light: 'rgba(236, 72, 153, 0.15)', dark: '#DB2777', text: '#9D174D' }, // 핑크
  '3': { main: '#10B981', light: 'rgba(16, 185, 129, 0.15)', dark: '#059669', text: '#047857' }, // 녹색
  '4': { main: '#8B5CF6', light: 'rgba(139, 92, 246, 0.15)', dark: '#7C3AED', text: '#5B21B6' }, // 보라
  '5': { main: '#F59E0B', light: 'rgba(245, 158, 11, 0.15)', dark: '#D97706', text: '#B45309' }, // 주황
  '6': { main: '#EF4444', light: 'rgba(239, 68, 68, 0.15)', dark: '#DC2626', text: '#B91C1C' }, // 빨강
  '7': { main: '#06B6D4', light: 'rgba(6, 182, 212, 0.15)', dark: '#0891B2', text: '#0E7490' }, // 하늘
  '8': { main: '#8D4FDB', light: 'rgba(141, 79, 219, 0.15)', dark: '#7231C8', text: '#5B21B6' }, // 자주
  '9': { main: '#14B8A6', light: 'rgba(20, 184, 166, 0.15)', dark: '#0D9488', text: '#0F766E' }, // 청록
  '10': { main: '#F97316', light: 'rgba(249, 115, 22, 0.15)', dark: '#EA580C', text: '#C2410C' }, // 오렌지
  '11': { main: '#6366F1', light: 'rgba(99, 102, 241, 0.15)', dark: '#4F46E5', text: '#4338CA' }, // 인디고
  '12': { main: '#0EA5E9', light: 'rgba(14, 165, 233, 0.15)', dark: '#0284C7', text: '#0369A1' }, // 스카이블루
};

const BadgeStatusPage = () => {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 현재 날짜를 기반으로 초기 선택 월 설정
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString(); // 월은 0부터 시작하므로 +1
    return month;
  };
  
  // 현재 연도 가져오기
  const currentYear = new Date().getFullYear();
  
  // 선택된 월 (1~12)
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  // 선택된 연도-월 형식 (YYYY-MM)
  const formattedMonth = `${currentYear}-${selectedMonth.padStart(2, '0')}`;
  
  const supabase = createClientComponentClient<Database>();
  
  // 숨길 배지 목록 정의 (월-번호 형식)
  const hiddenBadges = [
    "2-4", "2-5", "2-6", 
    "3-5", "3-6", 
    "4-4", "4-5", "4-6", 
    "5-5", "5-6", 
    "6-4", "6-5", "6-6", 
    "7-4", "7-5", "7-6", 
    "8-5", "8-6", 
    "9-5", "9-6", 
    "10-4", "10-5", "10-6", 
    "11-5", "11-6", 
    "12-4", "12-5", "12-6"
  ];
  
  // 현재 선택된 월에 표시할 컬럼 결정
  const getVisibleColumns = (month: string) => {
    const monthNumber = parseInt(month.split('-')[1]);
    const defaultColumns = ['W1', 'W2', 'W3', 'W4', 'S1', 'S2'];
    
    return defaultColumns.filter(column => {
      const weekNumber = column.startsWith('W') ? parseInt(column.substring(1)) : (column === 'S1' ? 5 : 6);
      const badgeId = `${monthNumber}-${weekNumber}`;
      return !hiddenBadges.includes(badgeId);
    });
  };

  useEffect(() => {
    fetchUserBadges();
  }, [selectedMonth]);

  const fetchUserBadges = async () => {
    try {
      // 1. 학생 사용자 목록 조회 (선생님 제외)
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, baptismal_name, grade')
        .neq('grade', '선생님')
        .order('grade', { ascending: true });

      if (usersError) {
        console.error('Users fetch error:', usersError);
        throw usersError;
      }

      // 2. 해당 월의 배지들을 가져오기
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('*');

      if (badgesError) throw badgesError;

      // 3. 모든 사용자의 배지 획득 현황을 한 번에 조회
      const { data: userBadgesData, error: userBadgesError } = await supabase
        .from('user_badges')
        .select(`
          user_id,
          badge_id,
          badges (
            name
          )
        `);

      if (userBadgesError) throw userBadgesError;
      
      // 타입 단언을 사용하여 타입 지정
      const userBadges = userBadgesData as unknown as UserBadgeRecord[];

      // 선택된 월의 숫자 부분 추출
      const selectedMonthNumber = parseInt(selectedMonth);

      // 4. 데이터 가공
      const processedUsers = users
        ?.filter(user => user.grade && gradeOrder.includes(user.grade))
        .sort((a, b) => {
          const gradeA = gradeOrder.indexOf(a.grade || '');
          const gradeB = gradeOrder.indexOf(b.grade || '');
          if (gradeA !== gradeB) return gradeA - gradeB;
          return (a.name || '').localeCompare(b.name || '');
        })
        .map(user => {
          const userBadgeStatus = {
            [`${formattedMonth}-W1`]: false,
            [`${formattedMonth}-W2`]: false,
            [`${formattedMonth}-W3`]: false,
            [`${formattedMonth}-W4`]: false,
            [`${formattedMonth}-S1`]: false,
            [`${formattedMonth}-S2`]: false,
          };

          // 해당 사용자의 배지 데이터 필터링
          const userAcquiredBadges = userBadges?.filter(ub => {
            // 사용자 ID가 일치하고
            if (ub.user_id !== user.id) return false;
            
            // 배지 이름이 현재 선택된 월과 일치하는지 확인
            // 예: 3월이면 "3-1", "3-2" 등으로 시작하는 배지만 필터링
            const badgeMonth = ub.badges && ub.badges.name ? ub.badges.name.split('-')[0] : '';
            return badgeMonth === selectedMonthNumber.toString();
          });

          // 배지 상태 업데이트
          userAcquiredBadges?.forEach(ub => {
            if (ub.badges && ub.badges.name) {
              const badgeName = ub.badges.name;  // 예: "3-1", "3-2" 등
              const weekNumber = badgeName.split('-')[1];  // "1", "2" 등
              
              // 주간 배지 (1~4)
              if (weekNumber && parseInt(weekNumber) <= 4) {
                userBadgeStatus[`${formattedMonth}-W${weekNumber}`] = true;
              }
              // 특별 배지 (5, 6)
              else if (weekNumber === '5') {
                userBadgeStatus[`${formattedMonth}-S1`] = true;
              }
              else if (weekNumber === '6') {
                userBadgeStatus[`${formattedMonth}-S2`] = true;
              }
            }
          });

          return {
            user: {
              id: user.id,
              name: user.name || '이름 없음',
              baptismal_name: user.baptismal_name || '세례명 없음',
              grade: user.grade || '학년 없음'
            },
            badges: userBadgeStatus
          };
        }) || [];

      setUserBadges(processedUsers);
    } catch (error) {
      console.error('Error details:', error);
      if (error instanceof Error) {
        alert(`배지 현황을 불러오는데 실패했습니다: ${error.message}`);
      } else {
        alert('배지 현황을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 월 데이터
  const months = [
    { value: '1', label: '1월' },
    { value: '2', label: '2월' },
    { value: '3', label: '3월' },
    { value: '4', label: '4월' },
    { value: '5', label: '5월' },
    { value: '6', label: '6월' },
    { value: '7', label: '7월' },
    { value: '8', label: '8월' },
    { value: '9', label: '9월' },
    { value: '10', label: '10월' },
    { value: '11', label: '11월' },
    { value: '12', label: '12월' }
  ];
  
  // 현재 선택된 월에 표시할 컬럼 목록 계산
  const visibleColumns = getVisibleColumns(formattedMonth);

  // 선택된 월이 변경될 때 해당 월 버튼으로 스크롤
  const scrollToSelectedMonth = (month: string) => {
    const monthButtonElement = document.querySelector(`[data-month="${month}"]`) as HTMLElement | null;
    if (monthButtonElement) {
      const containerElement = document.querySelector('.month-selector') as HTMLElement | null;
      if (containerElement) {
        containerElement.scrollLeft = monthButtonElement.offsetLeft - containerElement.offsetWidth / 2 + monthButtonElement.offsetWidth / 2;
      }
    }
  };
  
  // 월 선택 시 처리
  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    setTimeout(() => scrollToSelectedMonth(month), 100);
  };

  if (loading) {
    return <div className="p-4">로딩 중...</div>;
  }

  return (
    <Container>
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 mb-8">
        학생 출석 현황
      </h1>

      <MonthSelector className="month-selector">
        {months.map((month) => (
          <MonthButton 
            key={month.value}
            isSelected={selectedMonth === month.value}
            onClick={() => handleMonthSelect(month.value)}
            color={monthColors[month.value]}
            data-month={month.value}
          >
            {month.label}
          </MonthButton>
        ))}
      </MonthSelector>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-6">
                No
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                학년
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                이름
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                세례명
              </th>
              {visibleColumns.map(column => (
                <th 
                  key={column} 
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-14"
                >
                  {column.replace('W', '')}주
                  {column.startsWith('S') && '특별' + column.replace('S', '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {userBadges.map((userBadge, index) => (
              <tr key={userBadge.user.id}>
                <td className="px-1 py-4 text-center text-sm text-gray-500 truncate">
                  {index + 1}
                </td>
                <td className="px-2 py-4 text-center text-sm font-medium text-gray-900 truncate">
                  {userBadge.user.grade}
                </td>
                <td className="px-2 py-4 text-sm font-medium text-gray-900 truncate">
                  {userBadge.user.name}
                </td>
                <td className="px-2 py-4 text-sm text-gray-500 truncate">
                  {userBadge.user.baptismal_name}
                </td>
                {visibleColumns.map((column) => (
                  <td key={column} className="px-2 py-4 text-center">
                    {userBadge.badges[`${formattedMonth}-${column}`] ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-green-600 text-white rounded-full">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 text-gray-400 rounded-full">
                        -
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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

const MonthSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  justify-content: center;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  position: relative;
  
  @media (max-width: 640px) {
    gap: 4px;
    padding: 8px 4px;
    margin-bottom: 12px;
    border-radius: 12px;
    background-color: rgba(255, 255, 255, 0.8);
    overflow-x: auto;
    flex-wrap: nowrap;
    justify-content: flex-start;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
  }
`;

const MonthButton = styled.button<{ isSelected: boolean; color: { main: string; light: string; dark: string; text: string } }>`
  padding: 8px 14px;
  border-radius: 16px;
  font-weight: ${props => props.isSelected ? 'bold' : 'normal'};
  background-color: ${props => props.isSelected ? props.color.light : 'rgba(255, 255, 255, 0.8)'};
  color: ${props => props.isSelected ? props.color.text : '#3a3a3c'};
  border: 1px solid ${props => props.isSelected ? props.color.main : 'rgba(0, 0, 0, 0.05)'};
  transition: all 0.2s ease-in-out;
  box-shadow: ${props => props.isSelected ? `0 2px 5px ${props.color.light}` : '0 1px 2px rgba(0, 0, 0, 0.02)'};
  font-size: 0.95rem;
  
  @media (max-width: 640px) {
    padding: 6px 10px;
    font-size: 0.85rem;
    border-radius: 12px;
    flex-shrink: 0;
    min-width: 60px;
    text-align: center;
  }
  
  &:hover {
    background-color: ${props => props.isSelected ? props.color.light : 'rgba(255, 255, 255, 0.95)'};
    color: ${props => props.isSelected ? props.color.text : props.color.main};
    border-color: ${props => props.color.main};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export default BadgeStatusPage; 