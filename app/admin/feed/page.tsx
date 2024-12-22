'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from '../../activity/Activity.module.css';
import BottomNav from '../../components/BottomNav';
import { useRouter } from 'next/navigation';

export default function AdminFeedPage() {
  const [feeds, setFeeds] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    const { data, error } = await supabase
      .from('feeds')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setFeeds(data);
  };

  const handleFeedClick = (feedId: string) => {
    router.push(`/admin/feed/${feedId}`);
  };

  return (
    <div className={styles.container}>
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">피드 관리</h1>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => router.push('/admin/feed/add')}
        >
          피드 추가
        </button>
      </div>
      
      <div className={styles.feedContainer}>
        {feeds.map((feed) => (
          <div 
            key={feed.id} 
            className={`${styles.feedItem} cursor-pointer`}
            onClick={() => handleFeedClick(feed.id)}
          >
            <img 
              src={feed.image_url} 
              alt="Feed Image"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
} 