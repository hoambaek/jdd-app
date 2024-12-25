import { useState } from 'react';
import BadgeClaimOverlay from './BadgeClaimOverlay';

const BadgeClaim = () => {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');

  const claimBadge = async () => {
    try {
      const response = await fetch(`/api/badges/claim/${badgeId}`, {
        method: 'POST',
        // ... other options
      });
      const data = await response.json();
      
      if (data.showOverlay) {
        setOverlayMessage(data.message);
        setOverlayVisible(true);
      }
    } catch (error) {
      console.error('배지 획득 중 오류 발생:', error);
    }
  };

  return (
    <>
      {/* 기존 컴포넌트 내용 */}
      <BadgeClaimOverlay
        message={overlayMessage}
        isVisible={overlayVisible}
        onClose={() => setOverlayVisible(false)}
      />
    </>
  );
};

export default BadgeClaim; 