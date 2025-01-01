"use client";

import React, { useState, useRef } from 'react';

const VideoPage = () => {
    const [showReplayButton, setShowReplayButton] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleVideoEnd = () => {
        setShowReplayButton(true);
    };

    const handleReplay = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setShowReplayButton(false);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
            <video
                id="videoPlayer"
                style={{ width: '100%', height: 'auto' }}
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnd}
                ref={videoRef}
            >
                <source src="https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/video/fail.mp4" type="video/mp4" />
                브라우저가 비디오 태그를 지원하지 않습니다.
            </video>
            {showReplayButton && (
                <div style={{ position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                    <button
                        onClick={handleReplay}
                        style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginBottom: '10px'
                        }}
                    >
                        다시 재생
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoPage;