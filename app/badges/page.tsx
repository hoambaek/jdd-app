"use client";

import React, { useState, useEffect } from 'react';
import './BadgesPage.css';
import BottomNav from '../components/BottomNav';
import { createClient } from '@supabase/supabase-js';

// 배지 데이터 인터페이스 정의
interface Badge {
  created_at: string;
  image_url: string;
  name: string;
  acquired: boolean;
  badge_id?: string;
}

// 그룹화된 배지 타입 정의
interface GroupedBadges {
  [key: number]: Badge[];
}

const BadgesPage = ({ badges = [] }) => {
  console.log('Badges:', badges);

  // Supabase 클라이언트 초기화
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // 상태의 타입을 명시적으로 지정
  const [groupedBadges, setGroupedBadges] = useState<GroupedBadges>({});

  const [userId, setUserId] = useState<string | null>(null);

  // 사용자 ID 가져오기
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);

  // 사용자의 배지 데이터 가져오기
  const fetchUserBadges = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return data;
  };

  useEffect(() => {
    const loadBadges = async () => {
      if (!userId) return;

      const userBadges = await fetchUserBadges(userId);
      const grouped = {} as GroupedBadges;
      
      // 모든 월에 대해 기본 배지 추가
      for (let month = 0; month < 12; month++) {
        const monthStr = String(month + 1).padStart(2, '0');
        const monthNames = [
          'january', 'february', 'march', 'april', 'may', 'june',
          'july', 'august', 'september', 'october', 'november', 'december'
        ];
        
        grouped[month] = [];
        for (let i = 1; i <= 6; i++) {
          const badgeImageUrl = `https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/badges/badges/${monthStr}_${monthNames[month]}/badge_0${i}.png`;
          
          // 사용자가 획득한 배지인지 확인
          const userHasBadge = userBadges.some(
            ub => ub.badges.image_url === badgeImageUrl
          );

          grouped[month].push({
            created_at: new Date().toISOString(),
            image_url: badgeImageUrl,
            name: `${month + 1}-${i}`,
            acquired: userHasBadge
          });
        }
      }
      
      setGroupedBadges(grouped);
    };

    loadBadges();
  }, [userId]);

  return (
    <div className="badges-page">
      <h1 style={{ fontSize: '1.5em', fontWeight: 'bold' }}>나의 리워드 현황</h1>
      <p>매월 출석체크와 다양한 활동에 참여하여<br />
      특별한 배지를 수집해보세요! 😘</p>
      
      {months.map((month, index) => (
        <div className="month-section" key={index}>
          <h2 style={{ fontWeight: 'bold' }}>{index + 1}월 {month}</h2>
          <div className="badges-container">
            {groupedBadges[index]?.map((badge: Badge, badgeIndex: number) => (
              <img
                key={badgeIndex}
                src={badge.image_url}
                alt={badge.name}
                className={`badge-item ${!badge.acquired ? 'not-acquired' : ''}`}
              />
            )) || <p>배지가 없습니다.</p>}
          </div>
        </div>
      ))}
      <BottomNav />
    </div>
  );
};

export default BadgesPage;
