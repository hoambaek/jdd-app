"use client";

import React, { useState, useEffect, useCallback } from 'react';
import './BadgesPage.css';
import BottomNav from '../components/BottomNav';
import { createClient } from '@supabase/supabase-js';
import { useRequireAuth } from '../hooks/useRequireAuth';
import BadgeLink from '@/components/BadgeLink';

// Supabase 클라이언트를 컴포넌트 외부로 이동
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 배지 데이터 인터페이스 정의
interface Badge {
  id: string;
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
  const { session, loading } = useRequireAuth();
  const [userId, setUserId] = useState<string | null>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // 상태의 타입을 명시적으로 지정
  const [groupedBadges, setGroupedBadges] = useState<GroupedBadges>({});

  // fetchUserBadges를 useCallback으로 메모이제이션
  const fetchUserBadges = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return data;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadBadges = async () => {
      if (!session?.user) return;

      const userBadges = await fetchUserBadges(session.user.id);
      if (!isMounted) return;

      const grouped = {} as GroupedBadges;
      const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      
      // 모든 월에 대해 기본 배지 추가
      for (let month = 0; month < 12; month++) {
        const monthStr = String(month + 1).padStart(2, '0');
        grouped[month] = [];
        
        for (let i = 1; i <= 6; i++) {
          const badgeImageUrl = `https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/badges/badges/${monthStr}_${monthNames[month]}/badge_0${i}.png`;
          
          const userHasBadge = userBadges.some(
            ub => ub.badges.image_url === badgeImageUrl
          );

          grouped[month].push({
            id: `${month + 1}-${i}`,
            created_at: new Date().toISOString(),
            image_url: badgeImageUrl,
            name: `${month + 1}-${i}`,
            acquired: userHasBadge
          });
        }
      }
      
      if (isMounted) {
        setGroupedBadges(grouped);
      }
    };

    loadBadges();

    return () => {
      isMounted = false;
    };
  }, [session, fetchUserBadges]); // fetchUserBadges를 의존성 배열에 추가

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    fetchUser();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div>로딩중...</div>
    </div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="badges-page">
      <h1 className="text-3xl font-bold mb-2">나의 배지 현황</h1>
      <p className="mb-4">
        매월 출석체크와 다양한 활동에 참여하여<br />
        특별한 배지를 수집해보세요! 🥳
      </p>
      
      {months.map((month, index) => (
        <div className="month-section mb-6" key={index}>
          <h2 className="mb-2">
            <span className="month-korean font-bold">{index + 1}월</span> 
            <span className="month-english"> {month}</span>
          </h2>
          <div className="badges-container">
            {groupedBadges[index]?.map((badge: Badge, badgeIndex: number) => (
              <div key={badgeIndex} className="badge-wrapper">
                <img
                  src={badge.image_url}
                  alt={badge.name}
                  className={`badge-item ${!badge.acquired ? 'not-acquired' : ''}`}
                />
                {!badge.acquired && userId && (
                  <BadgeLink 
                    badgeId={badge.id} 
                    userId={userId}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <BottomNav />
    </div>
  );
};

export default BadgesPage;
