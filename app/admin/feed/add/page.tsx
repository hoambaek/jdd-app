'use client';

import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs';
import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Database } from '@/types/supabase';
import Link from 'next/link';

const AddFeedPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <AddFeedForm />
      </Suspense>
    </div>
  );
};

const AddFeedForm = () => {
  const supabase = createClientComponentClient<Database>({
    options: {
      persistSession: true,
    },
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [feedId, setFeedId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');

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

  useEffect(() => {
    const fetchFeedData = async () => {
      try {
        const id = searchParams?.get('id');
        
        if (!id) return;

        const { data, error } = await supabase
          .from('feeds')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('데이터 로딩 실패:', error);
          return;
        }

        if (data) {
          setTitle(data.title);
          setContent(data.content);
          if (data.image_url) {
            setExistingImageUrl(data.image_url);
            setImageUrl(data.image_url);
          }
          if (data.tags) {
            const tagsString = Array.isArray(data.tags) 
              ? data.tags
                  .map(tag => tag.replace(/^\[|\]$/g, ''))
                  .join(', ')
              : typeof data.tags === 'string'
                ? data.tags.replace(/^\[|\]$/g, '')
                : '';
            setTags(tagsString);
          }
          setFeedId(data.id);
          setDate(data.date || '');
        }
      } catch (error) {
        console.error('데이터 fetch 중 오류 발생:', error);
      }
    };

    fetchFeedData();
  }, [searchParams, supabase]);

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

    // 필수 필드 검증
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    // 세션 확인
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      // 최종 이미지 URL 결정
      let finalImageUrl = imageUrl || existingImageUrl;

      // 새로운 이미지 파일이 있는 경우 업로드
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('feeds')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          throw new Error('이미지 업로드에 실패했습니다: ' + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('feeds')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      // 태그 처리 수정
      const processedTags = tags
        ? tags.split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
            .map(tag => tag.replace(/^\[|\]$/g, '')) // 앞뒤 대괄호 제거
        : [];

      const newFeed = {
        title: title.trim(),
        content: content.trim(),
        created_at: new Date().toISOString(),
        date: date,
        tags: processedTags, // 처리된 태그 배열 사용
        user_id: session.user.id,
        image_url: finalImageUrl
      };

      const { error: dbError } = feedId 
        ? await supabase
            .from('feeds')
            .update(newFeed)
            .eq('id', feedId)
        : await supabase
            .from('feeds')
            .insert([newFeed]);

      if (dbError) {
        throw new Error('피드 저장에 실패했습니다: ' + dbError.message);
      }

      alert('피드가 성공적으로 저장되었습니다.');
      router.push('/admin/feed');

    } catch (error) {
      console.error('에러 발생:', error);
      alert(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 상태 확인을 위한 useEffect
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          alert('로그인이 필요합니다.');
          router.push('/login');
          return;
        }
        setUser(session.user);

        // 실시간 인증 상태 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (!session) {
              alert('로그인이 필요합니다.');
              router.push('/login');
              return;
            }
            setUser(session.user);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('인증 확인 중 오류:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [supabase, router]);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {feedId ? '피드 수정' : '새 피드 추가'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${(imageFile || existingImageUrl) ? 'h-auto' : 'h-64'}`}
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
          ) : existingImageUrl ? (
            <div className="space-y-4">
              <img
                src={existingImageUrl}
                alt="Current Image"
                className="max-w-full h-auto mx-auto"
              />
              <p className="text-sm text-gray-500">
                현재 이미지
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

        <div>
          <label className="block text-sm font-medium text-gray-700">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {isLoading ? '저장 중...' : (feedId ? '수정하기' : '등록하기')}
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
};

export default AddFeedPage; 