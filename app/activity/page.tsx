'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from './Activity.module.css';
import BottomNav from '../components/BottomNav';
import { useRequireAuth } from '../hooks/useRequireAuth';

interface Feed {
  id: string;
  title: string;
  content: string;
  image_url: string;
  tags: string;
  created_at: string;
  date: string;
}

export default function Activity() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { session, loading } = useRequireAuth();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    if (session) {
      fetchFeeds();
    }
  }, [session]);

  const sortFeeds = (feeds: Feed[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // 시간을 00:00:00으로 설정

    return feeds.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const isPastA = dateA < today;
      const isPastB = dateB < today;

      if (isPastA === isPastB) {
        // 둘 다 과거이거나 둘 다 미래/현재인 경우 날짜순 정렬
        return dateA.getTime() - dateB.getTime();
      }
      // 과거 피드를 뒤로 보냄
      return isPastA ? 1 : -1;
    });
  };

  const fetchFeeds = async () => {
    const { data, error } = await supabase
      .from('feeds')
      .select('*');
    
    if (error) {
      console.error('Error fetching feeds:', error);
      return;
    }
    
    if (data) {
      const sortedFeeds = sortFeeds(data);
      setFeeds(sortedFeeds);
    }
  };

  const isPastDate = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const feedDate = new Date(dateString);
    return feedDate < today;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div>로딩중...</div>
    </div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className="px-4 pt-3 pb-2 flex items-center gap-3 mb-4">
        <h1 className="text-4xl font-bold">Today</h1>
        <span className="text-lg text-gray-400 font-normal mt-2">{today}</span>
      </div>

      <div className={styles.feedContainer}>
        {feeds.map((feed) => (
          <div 
            key={feed.id} 
            className={`relative cursor-pointer ${styles.feedItem} ${
              isPastDate(feed.date) ? 'opacity-50' : ''
            }`}
            onClick={() => setSelectedFeedId(selectedFeedId === feed.id ? null : feed.id)}
          >
            <div className="relative w-full h-full">
              <img 
                src={feed.image_url} 
                alt="Feed Image"
                className={`w-full h-full object-cover transition-all duration-300 ${
                  selectedFeedId === feed.id ? 'blur-xl' : ''
                }`}
              />
              <div 
                className={`absolute inset-0 bg-black backdrop-blur-xl transition-all duration-300 ${
                  selectedFeedId === feed.id ? 'opacity-70' : 'opacity-0'
                }`}
              />
              {selectedFeedId === feed.id && (
                <div className="absolute inset-0 flex flex-col px-6 py-5 text-white z-10">
                  <h3 className="text-2xl font-semibold mb-4">
                    {feed.title}
                  </h3>
                  <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <p className="text-base text-white/90 whitespace-pre-wrap mb-4">
                      {feed.content}
                    </p>
                    {feed.tags && (
                      <div className="flex flex-wrap gap-1.5">
                        {typeof feed.tags === 'string' 
                          ? feed.tags.split(',').map((tag, index) => (
                              <span 
                                key={index}
                                className="bg-white/20 px-2.5 py-1 rounded-full text-xl"
                              >
                                #{tag.trim()}
                              </span>
                            ))
                          : null
                        }
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
} 