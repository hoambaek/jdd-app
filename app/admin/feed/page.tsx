'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from '../../activity/Activity.module.css';
import BottomNav from '../../components/BottomNav';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Database } from '@/types/supabase';

export default function AdminFeedPage() {
  const [feeds, setFeeds] = useState<Database['public']['Tables']['feeds']['Row'][]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    const { data, error } = await supabase
      .from('feeds')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      const processedFeeds = data.map(feed => ({
        ...feed,
        tags: Array.isArray(feed.tags) 
          ? feed.tags 
          : typeof feed.tags === 'string'
            ? feed.tags.replace(/[\[\]"]/g, '').split(',').map(tag => tag.trim())
            : []
      }));
      setFeeds(processedFeeds);
    }
  };

  const handleEditClick = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    router.push(`/admin/feed/add?id=${id}`);
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
            className={`${styles.feedItem} relative group`}
          >
            <img 
              src={feed.image_url || ''} 
              alt="Feed Image"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
              <button
                onClick={(e) => handleEditClick(e, feed.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-2"
              >
                수정하기
              </button>
              {feed.url && (
                <a
                  href={feed.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors mb-2"
                >
                  링크 열기
                </a>
              )}
              {feed.tags && feed.tags.length > 0 && (
                <div className="text-white text-sm">
                  태그: {Array.isArray(feed.tags) ? feed.tags.join(', ') : feed.tags}
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