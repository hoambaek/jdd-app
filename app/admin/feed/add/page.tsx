'use client';

import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs';
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Database } from '@/types/supabase';

export default function AddFeedPage() {
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
  const [feedId, setFeedId] = useState(null);
  const [user, setUser] = useState<User | null>(null);

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
        const id = searchParams.get('id');
        
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
          setTitle(data.title || '');
          setContent(data.content || '');
          // tags가 배열인지 확인하고 안전하게 처리
          setTags(Array.isArray(data.tags) ? data.tags.join(', ') : '');
          setExistingImageUrl(data.image_url || '');
          setFeedId(data.id);
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
      let imageUrl = '';

      // 이미지 파일이 있는 경우에만 업로드 처리
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('feeds')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: true,
            contentType: imageFile.type
          });

        if (uploadError) {
          throw new Error('이미지 업로드에 실패했습니다: ' + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('feeds')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // 새 피드 데이터 생성
      const newFeed = {
        title: title.trim(),
        content: content.trim(),
        created_at: new Date().toISOString(),
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        id: session.user.id,
        image_url: imageUrl
      };

      // feedId가 있으면 수정, 없으면 새로 생성
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