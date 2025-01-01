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
                controls
                autoPlay
                muted
                onEnded={handleVideoEnd}
                ref={videoRef}
            >
                <source src="https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/video/good.mp4" type="video/mp4" />
                브라우저가 비디오 태그를 지원하지 않습니다.
            </video>
            {showReplayButton && (
                <>
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <span role="img" aria-label="thumbs up" style={{ fontSize: '72px' }}>👍</span>
                    </div>
                    <button
                        onClick={handleReplay}
                        style={{
                            position: 'absolute',
                            top: '60%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            padding: '10px 20px',
                            fontSize: '16px',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        다시 재생
                    </button>
                </>
            )}
        </div>
    );
};

export default VideoPage;