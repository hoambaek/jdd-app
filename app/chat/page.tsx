import React from 'react';
import styles from '../chat/Gradient.module.css';

const ChatPage: React.FC = () => {
  return (
    <div className={`flex items-center justify-center min-h-screen ${styles.gradientBackground}`}>
      <h1 className={styles.text}>작업중</h1>
    </div>
  );
};

export default ChatPage; 