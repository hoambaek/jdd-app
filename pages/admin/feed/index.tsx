import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import styles from './FeedManagement.module.css';

export default function FeedManagement() {
  const router = useRouter();
  const [feeds, setFeeds] = useState([]);
  
  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/');
      return;
    }

    fetchFeeds();
  };

  const fetchFeeds = async () => {
    const { data, error } = await supabase
      .from('feeds')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setFeeds(data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>피드 관리</h1>
        <button 
          className={styles.addButton}
          onClick={() => router.push('/admin/feed/new')}
        >
          새 피드 추가
        </button>
      </div>
      <div className={styles.feedGrid}>
        {feeds.map((feed) => (
          <div 
            key={feed.id} 
            className={styles.feedItem}
            onClick={() => router.push(`/admin/feed/${feed.id}`)}
          >
            <img src={feed.image_url} alt={feed.title} />
          </div>
        ))}
      </div>
    </div>
  );
} 