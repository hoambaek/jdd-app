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
}

export default function Activity() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { session, loading } = useRequireAuth();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (session) {
      fetchFeeds();
    }
  }, [session]);

  const fetchFeeds = async () => {
    const { data, error } = await supabase
      .from('feeds')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching feeds:', error);
      return;
    }
    
    if (data) setFeeds(data);
  };

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
        <h1 className="text-3xl font-bold">Today</h1>
        <span className="text-sm text-gray-400 font-light mt-2">{today}</span>
      </div>

      <div className={styles.feedContainer}>
        {feeds.map((feed) => (
          <div 
            key={feed.id} 
            className={`relative cursor-pointer ${styles.feedItem}`}
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
                  <h3 className="text-lg font-semibold mb-4">
                    {feed.title}
                  </h3>
                  <div className="flex-1 overflow-y-auto">
                    <p className="text-sm text-white/90 whitespace-pre-wrap mb-4">
                      {feed.content}
                    </p>
                    {feed.tags && (
                      <div className="flex flex-wrap gap-1.5">
                        {typeof feed.tags === 'string' 
                          ? feed.tags.split(',').map((tag, index) => (
                              <span 
                                key={index}
                                className="bg-white/20 px-2.5 py-1 rounded-full text-xs"
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