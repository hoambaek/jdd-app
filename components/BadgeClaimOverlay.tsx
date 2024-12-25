import { useState, useEffect } from 'react';

interface BadgeClaimOverlayProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function BadgeClaimOverlay({ message, isVisible, onClose }: BadgeClaimOverlayProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // 3초 후 자동으로 닫힘
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-black bg-opacity-50 absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-lg p-8 shadow-xl relative z-10 transform scale-110 transition-transform">
        <p className="text-2xl font-bold text-center text-gray-800">{message}</p>
      </div>
    </div>
  );
} 