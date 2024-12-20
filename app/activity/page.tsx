'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './Activity.module.css';
import BottomNav from '../components/BottomNav';

export default function Activity() {
  const [feeds, setFeeds] = useState([]);
  const [selectedFeedId, setSelectedFeedId] = useState(null);

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

  const handleFeedClick = (feedId) => {
    setSelectedFeedId(selectedFeedId === feedId ? null : feedId);
  };

  const formatContent = (content) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.feedContainer}>
        {feeds.map((feed) => (
          <div 
            key={feed.id} 
            className={`${styles.feedItem} ${selectedFeedId === feed.id ? styles.selected : ''}`}
            onClick={() => handleFeedClick(feed.id)}
          >
            <img src={feed.image_url} alt={feed.title} />
            <div className={styles.feedOverlay}>
              <h3>{feed.title}</h3>
              <p>{formatContent(feed.content)}</p>
              {feed.tags && (
                <div className={styles.tags}>
                  {feed.tags.split(',').map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      #{tag.trim()}
                    </span>
                  ))}
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