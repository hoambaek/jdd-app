'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BottomNav from '../components/BottomNav';
import Comments from '../components/Comments';
import { useRequireAuth } from '../hooks/useRequireAuth';

// 단일 supabase 인스턴스 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Story {
  id: string;
  created_at: string;
  date: string;
  title: string;
  content: string;
  images: string[];
  user_id: string;
  place: string;
}

const StoryPage = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});
  const [touchStart, setTouchStart] = useState<{ [key: string]: number }>({});
  const [touchEnd, setTouchEnd] = useState<{ [key: string]: number }>({});
  const [isDragging, setIsDragging] = useState<{ [key: string]: boolean }>({});
  const [dragPosition, setDragPosition] = useState<{ [key: string]: number }>({});
  
  const router = useRouter();
  const { session, loading } = useRequireAuth();

  useEffect(() => {
    if (!loading && !session) {
      return;
    }

    if (session) {
      fetchStories();
    }
  }, [session, loading]);

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        story_images (
          id,
          image_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stories:', error);
      return;
    }

    if (data) {
      const formattedStories = data.map(story => ({
        ...story,
        images: story.story_images?.map((img: any) => {
          if (img.image_url.startsWith('http')) {
            return img.image_url;
          }
          return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/stories/${img.image_url}`;
        }) || []
      }));

      setStories(formattedStories);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, storyId: string) => {
    setTouchStart(prev => ({ ...prev, [storyId]: e.touches[0].clientX }));
    setIsDragging(prev => ({ ...prev, [storyId]: true }));
    setDragPosition(prev => ({ ...prev, [storyId]: 0 }));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>, storyId: string) => {
    if (!isDragging[storyId]) return;
    
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart[storyId] - currentTouch;
    setDragPosition(prev => ({ ...prev, [storyId]: -diff }));
    setTouchEnd(prev => ({ ...prev, [storyId]: currentTouch }));
  };

  const handleTouchEnd = (storyId: string, maxLength: number) => {
    if (!isDragging[storyId]) return;
    
    const minSwipeDistance = 50;
    const diff = touchStart[storyId] - touchEnd[storyId];

    if (Math.abs(diff) > minSwipeDistance) {
      const currentIndex = currentImageIndexes[storyId] || 0;
      if (diff > 0 && currentIndex < maxLength - 1) {
        setCurrentImageIndexes(prev => ({
          ...prev,
          [storyId]: currentIndex + 1
        }));
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentImageIndexes(prev => ({
          ...prev,
          [storyId]: currentIndex - 1
        }));
      }
    }

    setIsDragging(prev => ({ ...prev, [storyId]: false }));
    setDragPosition(prev => ({ ...prev, [storyId]: 0 }));
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-black flex items-center justify-center">
      <div className="text-white">로딩중...</div>
    </div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-100 to-gray-100 px-2 py-4 pb-24">
      <h1 className="text-4xl font-bold text-black/90 mb-6 px-2">Story</h1>
      {stories.map((story) => (
        <div key={story.id} className="mx-2 mb-8">
          {/* 날짜 섹션 */}
          <div className="p-2">
            <span className="text-base text-black/60 font-light">
              {new Date(story.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          <div className="backdrop-blur-lg bg-white/70 rounded-xl overflow-hidden shadow-lg border border-black/[0.2] mt-0">
            {/* 이미지 섹션 */}
            <div>
              {story.images && story.images.length > 0 && (
                <div className="relative w-full h-[400px] overflow-hidden">
                  <div 
                    className="absolute w-full h-full flex transition-transform"
                    style={{
                      transform: `translateX(calc(${-(currentImageIndexes[story.id] || 0) * 100}% + ${dragPosition[story.id] || 0}px))`,
                      touchAction: 'pan-y pinch-zoom'
                    }}
                    onTouchStart={(e) => handleTouchStart(e, story.id)}
                    onTouchMove={(e) => handleTouchMove(e, story.id)}
                    onTouchEnd={() => handleTouchEnd(story.id, story.images.length)}
                  >
                    {story.images.map((image: string, index: number) => (
                      <div
                        key={index}
                        className="relative w-full h-full flex-shrink-0"
                      >
                        <Image
                          src={image}
                          alt={story.title || '스토리 이미지'}
                          fill
                          sizes="100vw"
                          priority
                          style={{ objectFit: 'cover' }}
                          className="rounded-t-xl"
                        />
                      </div>
                    ))}
                  </div>
                  {story.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                      {story.images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            index === currentImageIndexes[story.id]
                              ? 'bg-black w-3'
                              : 'bg-black/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 콘텐츠 섹션 */}
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-black/90">
                  {story.title}
                </h2>
                {story.place && (
                  <span className="text-sm text-black/60 flex items-center">
                    <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                    {story.place}
                  </span>
                )}
              </div>
              <p className="text-black/70">{story.content}</p>
              
              {/* 댓글 컴포넌트 */}
              <Comments storyId={story.id} />
            </div>
          </div>
        </div>
      ))}
      <BottomNav />
    </div>
  );
};

export default StoryPage; 