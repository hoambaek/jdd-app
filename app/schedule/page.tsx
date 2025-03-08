'use client';

import { useState } from 'react';
import { styled } from 'styled-components';
import BottomNav from '../components/BottomNav';

interface ScheduleItem {
  date: string;
  liturgy: string;
  event: string;
  notes: string;
  reference: string;
}

interface MonthlySchedule {
  month: string;
  items: ScheduleItem[];
}

const Schedule2025Page = () => {
  // 현재 날짜를 기반으로 초기 선택 월 설정
  const getCurrentMonth = () => {
    const now = new Date();
    const month = (now.getMonth() + 1).toString(); // 월은 0부터 시작하므로 +1
    
    // 2025년 일정이므로, 현재 연도가 2025년이 아니면 1월을 기본값으로 설정
    if (now.getFullYear() !== 2025) {
      return '1';
    }
    
    // 1~12월 범위 내에서만 선택
    return month;
  };
  
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

  // 이번주 범위 계산 (일요일~토요일)
  const getThisWeekRange = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    
    // 이번주 일요일 날짜 계산
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - currentDay);
    
    // 이번주 토요일 날짜 계산
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + (6 - currentDay));
    
    return {
      start: sunday,
      end: saturday,
      year: now.getFullYear()
    };
  };
  
  // 날짜 문자열이 이번주에 속하는지 확인
  const isDateInThisWeek = (dateStr: string) => {
    // 2025년이 아니면 강조 표시 안함
    const thisWeek = getThisWeekRange();
    if (thisWeek.year !== 2025) {
      return false;
    }
    
    // 현재 선택된 월이 이번주가 속한 월과 다르면 강조 표시 안함
    const thisMonth = (thisWeek.start.getMonth() + 1).toString();
    if (selectedMonth !== thisMonth) {
      return false;
    }
    
    // 날짜 문자열에서 숫자만 추출
    const dayMatch = dateStr.match(/(\d+)/);
    if (!dayMatch) return false;
    
    const day = parseInt(dayMatch[1]);
    
    // 이번주 시작일과 종료일의 일(day)만 추출
    const startDay = thisWeek.start.getDate();
    const endDay = thisWeek.end.getDate();
    
    // 이번주에 속하는지 확인
    return day >= startDay && day <= endDay;
  };

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

  // CSV 데이터를 기반으로 한 월별 일정 데이터
  const scheduleData: { [key: string]: MonthlySchedule } = {
    '1': {
      month: '1월',
      items: [
        { date: '4', liturgy: '주님 공현 대축일', event: '교리(보좌 신부님)', notes: '', reference: '' },
        { date: '11', liturgy: '주님 세례 축일', event: '중고등부 겨울 캠프(곡성)', notes: '', reference: '' },
        { date: '18', liturgy: '연중 제2주일', event: '방학', notes: '', reference: '' },
        { date: '25', liturgy: '연중 제3주일', event: '가정주일', notes: '', reference: '' },
      ]
    },
    '2': {
      month: '2월',
      items: [
        { date: '1', liturgy: '주님 봉헌 축일', event: '방학', notes: '', reference: '* 신임교사 연수회 (2/15~16)' },
        { date: '8', liturgy: '연중 제5주일', event: '방학', notes: '', reference: '' },
        { date: '15', liturgy: '연중 제6주일', event: '방학', notes: '', reference: '' },
        { date: '22', liturgy: '연중 제7주일', event: '가정주일', notes: '', reference: '' },
      ]
    },
    '3': {
      month: '3월',
      items: [
        { date: '1', liturgy: '연중 제8주일', event: '기초교리(영상교리 04, 39) "미사"', notes: '', reference: '* 교리교사 단합대회(3/2~3)\n* 재의 수요일(3/5)\n* 사순시기 판공성사\n* 학생회장단 연수(3/15~16)' },
        { date: '8', liturgy: '사순 제1주일', event: '학생자치회의', notes: '', reference: '' },
        { date: '15', liturgy: '사순 제2주일', event: '기초교리(영상교리 15) "전례주년"', notes: '', reference: '' },
        { date: '22', liturgy: '사순 제3주일', event: '생태교육', notes: '', reference: '' },
        { date: '29', liturgy: '사순 제4주일', event: '가정주일', notes: '', reference: '' },
      ]
    },
    '4': {
      month: '4월',
      items: [
        { date: '5', liturgy: '사순 제5주일', event: '기초교리(영상교리 22) "고해성사"', notes: '판공성사', reference: '*부활절 행사(초판매 등)' },
        { date: '12', liturgy: '주님 수난 성지주일', event: '기초교리(영상교리20,21) "성체성사"', notes: '', reference: '' },
        { date: '19', liturgy: '주님 부활 대축일', event: '부활대축일', notes: '성삼일 전례주간(17~19)', reference: '' },
        { date: '26', liturgy: '부활 제2주일(하느님의 자비 주일)', event: '가정주일', notes: '', reference: '' },
      ]
    },
    '5': {
      month: '5월',
      items: [
        { date: '3', liturgy: '부활 제3주일', event: '기초교리(영상교리 07) "예수 그리스도"', notes: '', reference: '*성소주일 (5/11, 대상 : 미정)\n*최기원 에밀리오 신부임 축일 (5/28)\n*상반기 문화활동(미정)\n*청소년 축제(5/25, 교구 행사)' },
        { date: '10', liturgy: '부활 제4주일', event: '상반기 문화활동', notes: '', reference: '' },
        { date: '17', liturgy: '부활 제5주일', event: '기초교리(영상교리 09) "성모 마리아"', notes: '', reference: '' },
        { date: '24', liturgy: '부활 제6주일', event: '가정주일', notes: '', reference: '' },
        { date: '31', liturgy: '주님 승천 대축일', event: '학생자치회의', notes: '', reference: '' },
      ]
    },
    '6': {
      month: '6월',
      items: [
        { date: '7', liturgy: '성령 강림 대축일', event: '기초교리(영상교리 08 ) "성령"', notes: '', reference: '' },
        { date: '14', liturgy: '지극히 거룩하신 삼위일체 대축일', event: '기초교리(영상교리 06) "삼위일체"', notes: '', reference: '' },
        { date: '21', liturgy: '지극히 거룩하신 그리스도의 성체 성혈', event: '생태교육', notes: '', reference: '' },
        { date: '28', liturgy: '성 베드로와 성 바오로 사도', event: '가정주일', notes: '', reference: '' },
      ]
    },
    '7': {
      month: '7월',
      items: [
        { date: '5', liturgy: '연중 제14주일', event: '기초교리(영상교리 12 ) "전례"', notes: '', reference: '' },
        { date: '12', liturgy: '연중 제15주일', event: '기초교리(영상교리 13 ) "미사"', notes: '', reference: '' },
        { date: '19', liturgy: '연중 제16주일', event: '기초교리(영상교리 14 ) "미사"', notes: '', reference: '' },
        { date: '26', liturgy: '연중 제17주일', event: '가정주일 / 중고등부 여름 캠프', notes: '', reference: '' },
      ]
    },
    '8': {
      month: '8월',
      items: [
        { date: '2', liturgy: '연중 제18주일', event: '방학', notes: '', reference: '*김민성 요한 마리아 비안네 신부님 축일(8/4)\n*윤명자 마리아 수녀님 축일(8/15)\n*고3 수능 100일(8/5)' },
        { date: '9', liturgy: '연중 제19주일', event: '방학', notes: '', reference: '' },
        { date: '16', liturgy: '연중 제20주일', event: '방학', notes: '8/15 성모승천 대축일 미사', reference: '' },
        { date: '23', liturgy: '연중 제21주일', event: '방학', notes: '', reference: '' },
        { date: '30', liturgy: '연중 제22주일', event: '가정주일', notes: '', reference: '' },
      ]
    },
    '9': {
      month: '9월',
      items: [
        { date: '6', liturgy: '연중 제23주일', event: '하반기 문화활동', notes: '', reference: '*최영애 디냐 수녀님 축일(9/22)\n*하반기 문화활동(미정)\n*전체 교리교사 연수(9/20,21)' },
        { date: '13', liturgy: '성 십자가 현양 축일', event: '사회 융합 교리(연애와 이성관계)', notes: '', reference: '' },
        { date: '20', liturgy: '연중 제25주일', event: '사회 융합 교리(온라인 정체성)', notes: '', reference: '' },
        { date: '27', liturgy: '연중 제26주일', event: '가정주일', notes: '', reference: '' },
      ]
    },
    '10': {
      month: '10월',
      items: [
        { date: '4', liturgy: '연중 제27주일', event: '사회 융합 교리(학업성취와 입시스트레스)', notes: '', reference: '*본당의날' },
        { date: '11', liturgy: '연중 제28주일', event: '학생자치회의', notes: '', reference: '' },
        { date: '18', liturgy: '연중 제29주일', event: '사회 융합 교리(디지털 기기 사용과 중독)', notes: '본당의날 관련', reference: '' },
        { date: '25', liturgy: '연중 제30주일', event: '가정주일', notes: '', reference: '' },
      ]
    },
    '11': {
      month: '11월',
      items: [
        { date: '1', liturgy: '죽은 모든 이를 기억하는 위령의 날', event: '생태교육', notes: '', reference: '*광산1지부 청소년청년 찬양미사\n (일정 미정)\n*대표교사 연수(11/9)\n*학생회 임원 선출' },
        { date: '8', liturgy: '라테라노 대성전 봉헌 축일', event: '사회 융합 교리(자아정체성)', notes: '', reference: '' },
        { date: '15', liturgy: '연중 제33주일', event: '학생회 임원 선출', notes: '', reference: '' },
        { date: '22', liturgy: '온 누리의 임금이신 우리 주 예수 그리스도 왕 대축일', event: '사회 융합 교리(가족관계)', notes: '', reference: '' },
        { date: '29', liturgy: '대림 제1주일', event: '가정주일', notes: '', reference: '' },
      ]
    },
    '12': {
      month: '12월',
      items: [
        { date: '6', liturgy: '대림 제2주일', event: '성탄제 준비', notes: '', reference: '*초등6학년 졸업미사\n*12/31,1/1 천주의성모 대축일미사' },
        { date: '13', liturgy: '대림 제3주일', event: '성탄제 준비, 판공성사', notes: '', reference: '' },
        { date: '20', liturgy: '대림 제4주일', event: '성탄제 준비', notes: '', reference: '' },
        { date: '24', liturgy: '주님성탄대축일', event: '성탄제', notes: '', reference: '' },
        { date: '27', liturgy: '예수, 마리아, 요셉의 성가정 축일', event: '가정주일', notes: '', reference: '' },
      ]
    },
  };

  // 선택된 월의 모든 참조 정보를 합치는 함수
  const getCombinedReferences = (monthKey: string) => {
    if (!scheduleData[monthKey]) return '';
    
    // 모든 참조 정보를 배열로 수집
    const allReferences = scheduleData[monthKey].items
      .map(item => item.reference)
      .filter(ref => ref.trim() !== ''); // 빈 참조는 제외
    
    // 중복 제거 (동일한 참조는 한 번만 표시)
    // Set을 사용하지 않고 중복 제거
    const uniqueReferences: string[] = [];
    allReferences.forEach(ref => {
      if (!uniqueReferences.includes(ref)) {
        uniqueReferences.push(ref);
      }
    });
    
    return uniqueReferences.join('\n');
  };

  // 현재 선택된 월의 데이터를 가져오는 함수
  const getCurrentMonthData = () => {
    return scheduleData[selectedMonth] || { month: '', items: [] };
  };
  
  // 모바일 환경에서 날짜 포맷팅 (예: "12/25" -> "12/25")
  const formatDateForMobile = (dateStr: string) => {
    // 날짜 형식이 "12월 25일"과 같은 형태라면 "12/25"로 변환
    const match = dateStr.match(/(\d+)월\s*(\d+)일/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
    return dateStr;
  };
  
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

  return (
    <Container>
      <style jsx global>{`
        @media (max-width: 640px) {
          .mobile-event-tag {
            display: inline-flex;
            flex-wrap: nowrap;
            align-items: center;
            padding: 4px 8px;
            border-radius: 6px;
            margin-bottom: 4px;
            box-shadow: none;
          }
          
          .mobile-event-normal {
            display: flex;
            align-items: center;
            flex-wrap: nowrap;
          }
          
          .event-icon {
            width: 14px;
            height: 14px;
            margin-right: 4px;
            flex-shrink: 0;
          }
          
          .event-text {
            font-size: 12px;
            line-height: 1.3;
            word-break: keep-all;
          }
          
          /* 모바일에서 테이블 스타일 개선 */
          .mobile-date {
            font-size: 12px !important;
            color: #007AFF !important;
            font-weight: 600 !important;
          }
          
          .mobile-liturgy {
            font-size: 12px !important;
            line-height: 1.4 !important;
          }
          
          .mobile-notes {
            font-size: 11px !important;
            color: #8A6D3B !important;
            margin-top: 3px !important;
            line-height: 1.3 !important;
          }
          
          /* 이번주 강조 스타일 */
          .this-week-row {
            background-color: rgba(255, 236, 153, 0.5) !important;
          }
          
          .this-week-row::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background-color: #F59E0B;
          }
          
          .this-week-row:hover {
            background-color: rgba(255, 236, 153, 0.7) !important;
          }
        }
        
        /* 데스크톱 이번주 강조 스타일 */
        .this-week-row {
          background-color: rgba(255, 236, 153, 0.3) !important;
        }
        
        .this-week-row::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: #F59E0B;
        }
        
        .this-week-row:hover {
          background-color: rgba(255, 236, 153, 0.5) !important;
        }
      `}</style>
      
      <Header>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          2025년 일정
        </h1>
        <p className="text-gray-600">
          중고등부 2025년 연간 일정표
        </p>
        <div className="w-16 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
      </Header>
      
      <MonthSelector className="month-selector">
        {Object.keys(scheduleData).map((month) => (
          <MonthButton 
            key={month} 
            isSelected={selectedMonth === month}
            onClick={() => handleMonthSelect(month)}
            color={monthColors[month]}
            data-month={month}
          >
            {scheduleData[month].month}
          </MonthButton>
        ))}
      </MonthSelector>

      <ScheduleTable>
        <thead>
          <tr>
            <TableHeader width="8%" className="date-column">날짜</TableHeader>
            <TableHeader width="32%" className="liturgy-column">전례</TableHeader>
            <TableHeader width="60%" className="event-column">교리 및 행사</TableHeader>
          </tr>
        </thead>
        <tbody>
          {scheduleData[selectedMonth].items.map((item, index) => {
            const isThisWeek = isDateInThisWeek(item.date);
            return (
              <TableRow 
                key={index} 
                $isEven={index % 2 === 0}
                className={isThisWeek ? 'this-week-row' : ''}
              >
                <TableCell>
                  <span className="mobile-date">{formatDateForMobile(item.date)}</span>
                </TableCell>
                <TableCell>
                  <div className="mobile-liturgy">{item.liturgy}</div>
                  {item.notes && (
                    <div className="mt-1 text-xs text-amber-600 font-medium mobile-notes">
                      {item.notes}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {item.event.includes('가정주일') ? (
                    <span className="text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-md inline-flex items-center text-sm mb-1 mr-1 shadow-sm mobile-event-tag">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10m-1-8H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2z" />
                      </svg>
                      <span className="event-text">{item.event}</span>
                    </span>
                  ) : item.event.includes('기초교리') ? (
                    <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-md inline-flex items-center text-sm mb-1 mr-1 shadow-sm mobile-event-tag">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="event-text">{item.event}</span>
                    </span>
                  ) : item.event.includes('사회 융합 교리') ? (
                    <span className="text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded-md inline-flex items-center text-sm mb-1 mr-1 shadow-sm mobile-event-tag">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="event-text">{item.event}</span>
                    </span>
                  ) : item.event.includes('부활대축일') ? (
                    <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-md inline-flex items-center text-sm mb-1 mr-1 shadow-sm mobile-event-tag">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <span className="event-text">{item.event}</span>
                    </span>
                  ) : item.event.includes('성탄') || item.event.includes('성탄제') ? (
                    <span className="text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-md inline-flex items-center text-sm mb-1 mr-1 shadow-sm mobile-event-tag">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18V6M7 10l5-4 5 4M5 14l7-4 7 4" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 18h4M12 22V18" />
                      </svg>
                      <span className="event-text">{item.event}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-sm mobile-event-normal">
                      {/* 방학 */}
                      {item.event.includes('방학') && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-600 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M10 16v1M14 16v1M12 8L12 4" />
                        </svg>
                      )}
                      {/* 캠프 */}
                      {item.event.includes('캠프') && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-600 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 20h14a2 2 0 01-2-2V8a2 2 0 01-2-2H9a2 2 0 01-2 2v10a2 2 0 01-2 2zM9 7v10M15 7v10M9 13h6" />
                        </svg>
                      )}
                      {/* 교리 */}
                      {(item.event.includes('교리') && !item.event.includes('기초교리') && !item.event.includes('사회 융합 교리')) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-600 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                      {/* 학생자치회의 */}
                      {item.event.includes('학생자치회의') && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-600 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                      {/* 생태교육 */}
                      {item.event.includes('생태교육') && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-600 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      )}
                      {/* 문화활동 */}
                      {item.event.includes('문화활동') && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-600 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                      )}
                      {/* 학생회 임원 선출 */}
                      {item.event.includes('학생회 임원 선출') && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-600 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      )}
                      {/* 판공성사 */}
                      {item.event.includes('판공성사') && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-600 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      {/* 성탄제 준비 */}
                      {item.event.includes('성탄제 준비') && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-600 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                      {/* 졸업미사 */}
                      {item.event.includes('졸업미사') || (item.notes && item.notes.includes('졸업미사')) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-600 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                      )}
                      {/* 신부님/수녀님 축일에 대한 캘린더 아이콘 */}
                      {(item.notes && item.notes.includes('축일')) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-600 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      {/* 수능 */}
                      {(item.notes && item.notes.includes('수능')) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-600 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      )}
                      {/* 연수/워크샵 */}
                      {(item.notes && (item.notes.includes('연수') || item.notes.includes('워크샵'))) || (item.reference && (item.reference.includes('연수') || item.reference.includes('워크샵'))) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-600 event-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                      {/* 일반 이벤트 (기본 아이콘) - 위의 어떤 조건도 만족하지 않는 경우 */}
                      {!(
                        item.event.includes('방학') || 
                        item.event.includes('캠프') || 
                        item.event.includes('교리') || 
                        item.event.includes('학생자치회의') || 
                        item.event.includes('생태교육') || 
                        item.event.includes('문화활동') || 
                        item.event.includes('학생회 임원 선출') || 
                        item.event.includes('판공성사') || 
                        item.event.includes('성탄제 준비') ||
                        item.event.includes('가정주일') ||
                        item.event.includes('부활대축일') ||
                        item.event.includes('성탄') ||
                        (item.notes && (item.notes.includes('축일') || item.notes.includes('졸업미사') || item.notes.includes('수능'))) ||
                        (item.reference && (item.reference.includes('연수') || item.reference.includes('워크샵')))
                      ) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      <span>{item.event}</span>
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          
          {/* 월별 참조 정보를 하단에 표시 */}
          {getCombinedReferences(selectedMonth) && (
            <TableRow $isEven={false} className="border-t border-gray-200">
              <TableCell colSpan={3} className="py-1.5">
                <div className="font-semibold mb-0.5 text-indigo-700 text-sm">이번 달 참조사항:</div>
                <div className="pl-2 border-l-2 border-indigo-300 text-sm">
                  {getCombinedReferences(selectedMonth).split('\n').map((line, i) => (
                    <div key={i} className="mb-0.5 text-gray-700">
                      {line}
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          )}
        </tbody>
      </ScheduleTable>

      <BottomNav />
    </Container>
  );
};

const Container = styled.div`
  padding: 12px;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 70px;
  color: #000;
  background-color: #f5f5f7;
  min-height: 100vh;
  background-image: linear-gradient(
    180deg,
    rgba(218, 221, 245, 0.3) 0%,
    rgba(243, 246, 255, 0.3) 100%
  );
  
  @media (max-width: 640px) {
    padding: 8px;
    padding-bottom: 70px;
    background-image: linear-gradient(
      180deg,
      rgba(218, 221, 245, 0.2) 0%,
      rgba(243, 246, 255, 0.2) 100%
    );
  }
`;

const Header = styled.div`
  margin-bottom: 16px;
  text-align: center;
  padding: 8px 0;

  h1 {
    font-size: 1.75rem;
    margin-bottom: 0.25rem;
    
    @media (max-width: 640px) {
      font-size: 1.5rem;
      margin-bottom: 0.15rem;
    }
  }

  p {
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
    
    @media (max-width: 640px) {
      font-size: 0.85rem;
      margin-bottom: 0.15rem;
      color: #444;
    }
  }

  .w-16 {
    width: 2.5rem;
    height: 0.25rem;
    
    @media (max-width: 640px) {
      width: 2rem;
      height: 0.2rem;
    }
  }
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
    
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 20px;
      background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.8));
      pointer-events: none;
    }
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 20px;
      background: linear-gradient(to left, transparent, rgba(255, 255, 255, 0.8));
      pointer-events: none;
      z-index: 1;
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

const ScheduleTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 16px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05), 
              0 0 0 1px rgba(0, 0, 0, 0.02);
  margin-bottom: 16px;
  -webkit-backdrop-filter: blur(20px);
  table-layout: fixed; /* 고정 테이블 레이아웃 사용 */
  
  @media (max-width: 640px) {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04), 
                0 0 0 1px rgba(0, 0, 0, 0.02);
    font-size: 13px;
  }
`;

const TableHeader = styled.th<{ width?: string }>`
  padding: 12px;
  background-color: rgba(242, 242, 247, 0.98);
  color: #1c1c1e;
  font-weight: 700;
  text-align: left;
  font-size: 14px;
  border-bottom: 1px solid rgba(60, 60, 67, 0.12);
  ${props => props.width && `width: ${props.width};`}
  letter-spacing: -0.3px;
  position: sticky;
  top: 0;
  z-index: 10;
  
  @media (max-width: 640px) {
    padding: 10px 8px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.2px;
    
    &.date-column {
      width: 12% !important;
      padding-left: 6px;
      padding-right: 4px;
    }
    
    &.liturgy-column {
      width: 28% !important;
    }
    
    &.event-column {
      width: 60% !important;
    }
  }
`;

const TableRow = styled.tr<{ $isEven: boolean; className?: string }>`
  background-color: ${props => props.$isEven ? '#ffffff' : 'rgba(242, 242, 247, 0.7)'};
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background-color: rgba(0, 122, 255, 0.08);
  }
  
  &:last-child td {
    border-bottom: none;
  }
  
  @media (max-width: 640px) {
    background-color: ${props => props.$isEven ? '#ffffff' : 'rgba(242, 242, 247, 0.5)'};
    
    &:hover {
      background-color: rgba(0, 122, 255, 0.05);
    }
  }
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid rgba(60, 60, 67, 0.1);
  vertical-align: top;
  white-space: pre-wrap;
  color: #1c1c1e;
  font-size: 14px;
  line-height: 1.5;
  
  @media (max-width: 640px) {
    padding: 10px 8px;
    font-size: 13px;
    line-height: 1.4;
    border-bottom: 1px solid rgba(60, 60, 67, 0.08);
    
    &:first-child {
      font-size: 12px;
      padding-right: 2px;
      padding-left: 6px;
      text-align: center;
    }
  }
  
  &:first-child {
    font-weight: 600;
    color: #007AFF;
    white-space: nowrap;
  }
  
  &:nth-child(2) {
    color: #222;
    
    /* 기타 항목이 추가될 때의 스타일 */
    div + div {
      margin-top: 6px;
      padding-top: 5px;
      border-top: 1px dashed rgba(60, 60, 67, 0.15);
      font-size: 13px;
      
      @media (max-width: 640px) {
        font-size: 12px;
        margin-top: 4px;
        padding-top: 4px;
        border-top: 1px dashed rgba(60, 60, 67, 0.1);
      }
    }
  }
  
  &:nth-child(3) {
    color: #1c1c1e;
    font-weight: 500;
    
    @media (max-width: 640px) {
      font-weight: normal;
      padding-left: 6px;
    }
  }
`;

export default Schedule2025Page; 