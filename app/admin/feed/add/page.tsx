'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddFeedPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 세션 체크
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        alert('로그인이 필요합니다.');
        router.push('/login'); // 로그인 페이지로 리다이렉트
        return;
      }
      setSession(session);
    };

    checkSession();
  }, [supabase, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImageFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!imageFile || !title || !content) {
      alert('이미지, 제목, 내용을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Storage에 이미지 업로드
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('feeds')
        .upload(`public/${fileName}`, imageFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('업로드 에러:', uploadError);
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      // 2. 업로드된 이미지의 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('feeds')
        .getPublicUrl(`public/${fileName}`);

      // 태그 처리
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const currentDate = new Date().toISOString();

      // 3. 데이터베이스에 피드 정보 저장 - 수정된 부분
      const { error: insertError } = await supabase
        .from('feeds')
        .insert({
          title: title,
          content: content,
          created_at: currentDate,
          date: currentDate,        // date 필드 추가
          tags: tagArray,
          image_url: publicUrl
        });

      if (insertError) {
        console.error('DB 저장 에러:', insertError);
        throw new Error(`피드 데이터 저장에 실패했습니다: ${insertError.message}`);
      }

      alert('피드가 성공적으로 등록되었습니다.');
      router.push('/admin/feed');
      
    } catch (error) {
      console.error('에러 발생:', error);
      alert(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">새 피드 추가</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${imageFile ? 'h-auto' : 'h-64'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            required
          />
          
          {imageFile ? (
            <div className="space-y-4">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="max-w-full h-auto mx-auto"
              />
              <p className="text-sm text-gray-500">
                {imageFile.name}
              </p>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-gray-500">
                클릭하거나 이미지를 드래그하여 업로드하세요
              </p>
              <p className="text-sm text-gray-400 mt-2">
                JPG, PNG, GIF 파일 지원
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="제목을 입력하세요"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded h-32"
            placeholder="내용을 입력하세요"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            태그 (쉼표로 구분)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="예: 태그1, 태그2, 태그3"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {isLoading ? '등록 중...' : '등록하기'}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
} 