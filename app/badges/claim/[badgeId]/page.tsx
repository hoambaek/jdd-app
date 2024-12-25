"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

export default function ClaimBadgePage({ params }: { params: { badgeId: string } }) {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [badgeInfo, setBadgeInfo] = useState<any>(null);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClientComponentClient<Database>();
    
    // 세션 상태 관리
    const [session, setSession] = useState<any>(null);
    
    // 세션 체크 및 인증 리다이렉트
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);
            
            if (!currentSession) {
                router.push('/login');
                return;
            }
        };
        
        checkSession();
        
        // 실시간 세션 상태 구독
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session) {
                router.push('/login');
            }
        });

        return () => subscription?.unsubscribe();
    }, [router, supabase]);

    // 배지 정보 조회
    useEffect(() => {
        const fetchBadgeInfo = async () => {
            if (!session?.user?.id) return;
            
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
    }, [params.badgeId, session, supabase]);

    const claimBadge = async () => {
        if (!session?.user?.id) {
            setMessage('로그인이 필요합니다.');
            return;
        }

        setIsButtonLoading(true);
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
            } else {
                setMessage(data.error || '배지 획득에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error claiming badge:', error);
            setMessage('예기치 않은 오류가 발생했습니다.');
        } finally {
            setIsButtonLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div>로딩중...</div>
        </div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <div id="tsparticles" className="absolute inset-0"></div>
            <div className="bg-black/30 backdrop-blur-lg rounded-xl p-8 max-w-md w-full shadow-xl relative">
                {badgeInfo && (
                    <>
                        <h1 className="text-2xl font-bold text-white mb-4 text-center">
                            {badgeInfo.name || '배지 획득하기'}
                        </h1>
                        <div className="flex justify-center mb-6 relative">
                            <img 
                                src={badgeInfo.image_url} 
                                alt={badgeInfo.name} 
                                className="w-48 h-48 object-contain select-none pointer-events-none"
                                style={{
                                    WebkitTouchCallout: 'none',
                                    WebkitUserSelect: 'none',
                                    userSelect: 'none',
                                    '-webkit-user-drag': 'none'
                                }}
                            />
                            {message && message.includes('성공') && (
                                <div className="fixed inset-0 flex items-center justify-center z-50">
                                    <div className="bg-green-500 text-white text-2xl font-bold p-6 rounded-lg shadow-lg animate-fade-in text-center max-w-md mx-4">
                                        🎉 배지를 성공적으로 획득했습니다! 🎉
                                    </div>
                                </div>
                            )}
                        </div>
                        {badgeInfo.description && (
                            <p className="text-white/90 text-center mb-6 select-none">
                                {badgeInfo.description}
                            </p>
                        )}
                    </>
                )}
                
                <button 
                    onClick={claimBadge}
                    disabled={isButtonLoading}
                    className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isButtonLoading ? '처리 중...' : '배지 받기'}
                </button>
            </div>
            
            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
}