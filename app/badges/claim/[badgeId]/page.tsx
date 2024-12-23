"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRequireAuth } from '@/app/hooks/useRequireAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ClaimBadgePage({ params }: { params: { badgeId: string } }) {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [badgeInfo, setBadgeInfo] = useState<any>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { session, loading } = useRequireAuth();
    
    useEffect(() => {
        const fetchBadgeInfo = async () => {
            if (!session?.user?.id) return;
            
            try {
                const supabase = createClientComponentClient();
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
    }, [params.badgeId, session]);

    const claimBadge = async () => {
        if (!session?.user?.id) {
            setMessage('로그인이 필요합니다.');
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
                // 3초 후 배지 페이지로 리다이렉트
                setTimeout(() => {
                    router.push('/badges');
                    router.refresh();
                }, 3000);
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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-500 to-purple-500">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md w-full shadow-xl">
                {badgeInfo && (
                    <>
                        <h1 className="text-2xl font-bold text-white mb-4 text-center">
                            {badgeInfo.name || '배지 획득하기'}
                        </h1>
                        <div className="flex justify-center mb-6">
                            <img 
                                src={badgeInfo.image_url} 
                                alt={badgeInfo.name} 
                                className="w-48 h-48 object-contain"
                            />
                        </div>
                        {badgeInfo.description && (
                            <p className="text-white/90 text-center mb-6">
                                {badgeInfo.description}
                            </p>
                        )}
                    </>
                )}
                
                <button 
                    onClick={claimBadge}
                    disabled={isLoading}
                    className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? '처리 중...' : '배지 받기'}
                </button>
                
                {message && (
                    <div className={`mt-4 p-3 rounded text-center ${
                        message.includes('성공') ? 'bg-green-500/20' : 'bg-red-500/20'
                    } text-white`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}