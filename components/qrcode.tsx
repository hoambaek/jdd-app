import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

interface QRCodeProps {
  badgeId: string;
  userId?: string;
}

export default function QRCode({ badgeId, userId }: QRCodeProps) {
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? `http://localhost:${process.env.PORT || 3000}`
    : 'https://ourjdd.com';
    
  const claimUrl = userId 
    ? `${baseUrl}/claim/${badgeId}?userId=${userId}`
    : `${baseUrl}/claim/${badgeId}`;

  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    try {
      if (qrRef.current) {
        const canvas = await html2canvas(qrRef.current, {
          backgroundColor: '#ffffff',
          scale: 8
        });

        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = 1000;
        resizedCanvas.height = 1000;
        const ctx = resizedCanvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(canvas, 0, 0, 1000, 1000);
        }

        const pngUrl = resizedCanvas.toDataURL('image/png');
        
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${badgeId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(pngUrl);
        }, 100);
      }
    } catch (error) {
      console.error('QR 코드 다운로드 중 오류 발생:', error);
      alert('QR 코드 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div ref={qrRef} className="bg-white p-4 rounded">
        <QRCodeSVG
          value={claimUrl}
          size={128}
          level="H"
          includeMargin={true}
        />
      </div>
      <button
        onClick={handleDownload}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        QR코드 다운로드
      </button>
    </div>
  );
}
