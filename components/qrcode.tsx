import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface BadgeQRCodeProps {
  url: string;
}

export const BadgeQRCode: React.FC<BadgeQRCodeProps> = ({ url }) => {
  const qrRef = useRef<SVGSVGElement>(null);

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    // SVG를 Canvas로 변환
    const canvas = document.createElement('canvas');
    const downloadSize = 1280; // 다운로드 크기를 1280x1280으로 설정
    canvas.width = downloadSize;
    canvas.height = downloadSize;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 배경을 흰색으로 설정
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // SVG 데이터를 이미지로 변환
    const data = new XMLSerializer().serializeToString(qrRef.current);
    const DOMURL = window.URL || window.webkitURL || window;
    const img = new Image();
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url2 = DOMURL.createObjectURL(svgBlob);

    img.onload = () => {
      // 이미지를 캔버스 크기에 맞게 확대하여 그리기
      ctx.drawImage(img, 0, 0, downloadSize, downloadSize);
      DOMURL.revokeObjectURL(url2);

      // Canvas를 PNG로 변환하여 다운로드
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${title}.png`; // 파일명을 배지의 제목으로 설정
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = url2;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <QRCodeSVG 
        ref={qrRef}
        value={url}
        size={128} // 화면에 표시되는 크기는 128로 유지
        level="H"
        includeMargin={true}
      />
      <button
        onClick={downloadQRCode}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        QR코드 다운로드
      </button>
    </div>
  );
};
