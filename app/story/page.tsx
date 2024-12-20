'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import BottomNav from '../components/bottomNav';

// Supabase storage URL 추가
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const ChatPage = () => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<string[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchStories = async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stories:', error);
        return;
      }

      if (data) {
        console.log('Stories data:', data);
        console.log('Supabase URL:', SUPABASE_URL);
        setStories(data);
      }
    };

    fetchStories();
  }, []);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      setComments([...comments, comment]);
      setComment('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Story</h1>
      
      {stories.map((story) => (
        <div key={story.id} className="mb-12">
          <div className="mb-6 flex justify-between items-center">
            <span className="text-gray-600">
              {new Date(story.created_at).toLocaleDateString()}
            </span>
            <h2 className="text-xl font-semibold">{story.title}</h2>
          </div>

          <div className="mb-8">
            <Swiper
              navigation={true}
              modules={[Navigation]}
              className="rounded-lg overflow-hidden"
            >
              {story.images?.map((image: string, index: number) => {
                const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/stories/${image}`;
                console.log('Image URL:', imageUrl);
                return (
                  <SwiperSlide key={index}>
                    <div className="relative w-full h-[400px]">
                      <Image
                        src={imageUrl}
                        alt={`Story image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                        unoptimized
                      />
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">댓글</h3>
            <form onSubmit={handleCommentSubmit} className="mb-4">
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
      ))}

      <BottomNav />
    </div>
  );
};

export default ChatPage; 