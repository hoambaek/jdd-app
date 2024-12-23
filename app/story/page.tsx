'use client'

import React, { useState, useEffect, TouchEvent } from 'react';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import BottomNav from '../components/BottomNav';

const ChatPage = () => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<string[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
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
            // 이미지 URL이 이미 전체 URL인 경우 그대로 사용
            if (img.image_url.startsWith('http')) {
              return img.image_url;
            }
            // 상대 경로인 경우 전체 URL 생성
            return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/stories/${img.image_url}`;
          }) || []
        }));

        setStories(formattedStories);
      }
    };

    fetchStories();
  }, [supabase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      setComments([...comments, comment]);
      setComment('');
    }
  };

  const handleNextImage = (storyId: string, maxLength: number) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [storyId]: (prev[storyId] + 1) % maxLength
    }));
  };

  const handlePrevImage = (storyId: string, maxLength: number) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [storyId]: (prev[storyId] - 1 + maxLength) % maxLength
    }));
  };

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = (storyId: string, maxLength: number) => {
    const minSwipeDistance = 50;
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextImage(storyId, maxLength);
    }
    if (isRightSwipe) {
      handlePrevImage(storyId, maxLength);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      {stories.map((story) => {
        // 각 스토리의 현재 이미지 인덱스 초기화
        if (!(story.id in currentImageIndexes)) {
          setCurrentImageIndexes(prev => ({ ...prev, [story.id]: 0 }));
        }

        return (
          <div key={story.id} className="bg-white shadow-lg rounded-lg m-4 p-4">
            <div className="mb-4">
              {story.images && story.images.length > 0 && (
                <div 
                  className="relative w-full h-[400px] touch-pan-y"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() => handleTouchEnd(story.id, story.images.length)}
                >
                  <Image
                    src={story.images[currentImageIndexes[story.id] || 0]}
                    alt={story.title || '스토리 이미지'}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
                  />
                  {story.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {story.images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndexes[story.id]
                              ? 'bg-white'
                              : 'bg-white bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold">{story.title}</h2>
              <p className="text-gray-600">{story.content}</p>

              <form onSubmit={handleSubmit} className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 p-2 border rounded-lg"
                    placeholder="댓글을 입력하세요..."
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    등록
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    {comment}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      <BottomNav />
    </div>
  );
};

export default ChatPage; 