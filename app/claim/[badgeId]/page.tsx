"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styles from './ClaimPage.module.css';

interface BadgeInfo {
  id: string;
  name: string;
  description?: string;
  image_url: string;
}

export default function ClaimBadgePage({ params }: { params: { badgeId: string } }) {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [badgeInfo, setBadgeInfo] = useState<BadgeInfo | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { session, loading } = useRequireAuth();
    const supabase = createClientComponentClient();
    const [showOverlay, setShowOverlay] = useState(false);
    
    useEffect(() => {
        const fetchBadgeInfo = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('badges')
                    .select('*')
                    .eq('id', params.badgeId)
                    .single();

                if (error) throw error;
                setBadgeInfo(data);
            } catch (error) {
                console.error('배지 정보 조회 중 오류:', error);
                setMessage('배지 정보를 불러올 수 없습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBadgeInfo();
    }, [params.badgeId, supabase]);

    const claimBadge = async () => {
        if (!session?.user?.id) {
            setMessage('로그인이 필요합니다.');
            return;
        }

        const urlUserId = searchParams.get('userId');
        if (urlUserId && urlUserId !== session.user.id) {
            setMessage('잘못된 접근입니다. QR코드의 소유자만 배지를 받을 수 있습니다.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/badges/claim/${params.badgeId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    userId: session.user.id,
                    badgeId: params.badgeId 
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage('배지를 성공적으로 획득했습니다!');
                setShowOverlay(true);
                setTimeout(() => {
                    router.push('/badges');
                    router.refresh();
                }, 2000);
            } else {
                setMessage(data.error || '배지 획득에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error claiming badge:', error);
            setMessage('예기치 않은 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (loading || isLoading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div>로딩중...</div>
        </div>;
    }

    if (!session) {
        return <div className="flex items-center justify-center min-h-screen">
            <div>로그인이 필요합니다.</div>
        </div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.badgeWrapper}>
                {badgeInfo && (
                    <>
                        <h1 className="text-xl font-bold text-white text-center mb-6">
                            {badgeInfo.name || '배지 획득하기'}
                        </h1>
                        <div className="flex justify-center">
                            <img 
                                src={badgeInfo.image_url} 
                                alt={badgeInfo.name} 
                                className={styles.badgeImage}
                            />
                        </div>
                        {badgeInfo.description && (
                            <div className={styles.textContainer}>
                                <p className="text-white/90 text-center text-base mt-4">
                                    {badgeInfo.description}
                                </p>
                            </div>
                        )}
                    </>
                )}
                {showOverlay && (
                    <img 
                        src="https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/badges/badges/good.png"
                        alt="Success Overlay"
                        className={styles.overlayImage}
                    />
                )}
            </div>
            
            <button 
                onClick={claimBadge}
                disabled={isLoading}
                className="w-64 bg-white hover:bg-green-300/40 text-black font-bold py-4 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
                {isLoading ? '처리 중...' : '배지 받기'}
            </button>
            
            {message && (
                <div className={`p-3 rounded text-center w-64 ${
                    message.includes('성공') ? 'bg-green-500/20' : 'bg-red-500/20'
                } text-white text-sm`}>
                    {message}
                </div>
            )}
        </div>
    );
} 