import React from 'react';
import './BadgesPage.css';

const BadgesPage = ({ badges = [] }) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const groupedBadges = badges.reduce((acc, badge) => {
    const month = new Date(badge.created_at).getMonth();
    if (!acc[month]) acc[month] = [];
    acc[month].push(badge);
    return acc;
  }, {});

  return (
    <div className="badges-page">
      <h1>나의 리워드 현황</h1>
      <p>매월 출석체크와 활동에 참여해서 배지를 모아보세요</p>
      
      {months.map((month, index) => (
        <div className="month-section" key={index}>
          <h2>{index + 1}월 {month}</h2>
          <div className="badges">
            {groupedBadges[index] ? groupedBadges[index].map((badge, badgeIndex) => (
              <img
                key={badgeIndex}
                src={badge.image_url}
                alt={badge.name}
                className="badge"
              />
            )) : <p>배지가 없습니다.</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BadgesPage;
