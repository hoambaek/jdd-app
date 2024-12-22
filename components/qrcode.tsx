import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

interface QRCodeProps {
  url: string;
  title?: string;
}

export default function QRCode({ url, title = 'badge-qr' }: QRCodeProps) {
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
        downloadLink.download = `${title}.png`;
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
          value={url}
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
