"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BadgeUpload() {
  const [month, setMonth] = useState(1);
  const [position, setPosition] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const getMonthName = (month: number): string => {
    const months = [
      'january', 'february', 'march', 'april',
      'may', 'june', 'july', 'august',
      'september', 'october', 'november', 'december'
    ];
    return months[month - 1];
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('파일을 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 1. 이미지 파일 업로드
      const monthStr = month.toString().padStart(2, '0');
      const positionStr = position.toString().padStart(2, '0');
      const folderName = `${monthStr}_${getMonthName(month)}`;
      const fileName = `badge_${positionStr}.png`;
      const filePath = `badges/${folderName}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('badges')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. 업로드된 이미지의 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('badges')
        .getPublicUrl(filePath);

      // 3. badges 테이블에 데이터 저장
      const { error: dbError } = await supabase
        .from('badges')
        .insert([
          {
            month,
            position,
            name,
            image_url: publicUrl,
            description
          }
        ]);

      if (dbError) throw dbError;

      alert('배지가 성공적으로 등록되었습니다!');
      // 폼 초기화
      setName('');
      setDescription('');
      setFile(null);
      
    } catch (error) {
      console.error('Error:', error);
      alert('배지 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">배지 등록</h1>
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">월</label>
            <select 
              className="w-full p-2 border rounded"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">위치 (1-6)</label>
            <select 
              className="w-full p-2 border rounded"
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
            >
              {Array.from({length: 6}, (_, i) => i + 1).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">배지 이름</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">설명</label>
          <textarea
            className="w-full p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">배지 이미지</label>
          <input
            type="file"
            className="w-full p-2 border rounded"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? '등록 중...' : '배지 등록'}
        </button>
      </form>
    </div>
  );
} 