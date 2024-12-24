'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import styles from './Activity.module.css';
import BottomNav from '../components/BottomNav';
import type { Database } from '@/lib/database.types';

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
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      if (!session) {
        router.push('/login');
        return;
      }

      fetchFeeds();
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const sortFeeds = (feeds: Feed[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return feeds.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const isPastA = dateA < today;
      const isPastB = dateB < today;

      if (isPastA === isPastB) {
        return dateA.getTime() - dateB.getTime();
      }
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
            className={`relative cursor-pointer border-[0.4px] border-black ${styles.feedItem} ${
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