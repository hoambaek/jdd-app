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
      setFeeds(data);
      if (data.tags) {
        const tagsString = Array.isArray(data.tags) 
          ? data.tags
              .map(tag => tag.replace(/^\[|\]$/g, ''))
              .join(', ')
          : typeof data.tags === 'string'
            ? data.tags.replace(/^\[|\]$/g, '')
            : '';
        setTags(tagsString);
      }
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
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={(e) => handleEditClick(e, feed.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                수정하기
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
} 