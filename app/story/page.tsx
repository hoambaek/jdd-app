'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import BottomNav from '../components/BottomNav';

// Supabase storage URL 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

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
        console.log('Supabase URL:', supabaseUrl);
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

  const imageUrl = "https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/stories/story-images/5fff8dff-50d9-465b-a09e-121963955180.jpg"
  
  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {stories.map((story) => (
        <div key={story.id} className="bg-white shadow-lg rounded-lg m-4 p-4">
          <div className="relative w-full h-96 mb-4">
            <Swiper
              navigation={true}
              modules={[Navigation]}
              className="h-full w-full"
            >
              {story.images?.map((image: string, index: number) => {
                const imageUrl = `${supabaseUrl}/storage/v1/object/public/stories/${image}`;
                console.log('Image URL:', imageUrl);
                return (
                  <SwiperSlide key={index}>
                    <div className="relative w-full h-full">
                      <Image
                        src={imageUrl}
                        alt={`Story image ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e: any) => {
                          console.error('Image load error:', e);
                          e.target.src = '/fallback-image.jpg';
                        }}
                      />
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">{story.title}</h2>
            <span className="text-gray-600">
              {new Date(story.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="mt-8">
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