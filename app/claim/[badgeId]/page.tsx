"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function ClaimPage({ params }: { params: { badgeId: string } }) {
    const { badgeId } = params;
    const [badge, setBadge] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchBadge = async () => {
            const { data, error } = await supabase
                .from('badges')
                .select('*')
                .eq('id', badgeId)
                .single();

            if (error) {
                setError('배지를 찾을 수 없습니다');
            } else {
                setBadge(data);
            }
        };

        const fetchUserId = async () => {
            const { data: user, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error fetching user:', error);
                setError('사용자 정보를 가져올 수 없습니다.');
            } else {
                setUserId(user?.id || null);
            }
        };

        fetchBadge();
        fetchUserId();
    }, [badgeId]);

    const claimBadge = async () => {
        if (!userId) {
            alert('사용자 ID를 가져올 수 없습니다.');
            return;
        }

        try {
            const response = await fetch(`/api/badges/claim/${badgeId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Unknown error'}`);
                return;
            }

            const result = await response.json();
            alert(result.message || '배지를 성공적으로 획득했습니다!');
        } catch (error) {
            console.error('Error during badge claim:', error);
            alert('배지 획득 중 오류가 발생했습니다.');
        }
    };

    if (error) {
        return (
            <div className="p-4">
                <h1>{error}</h1>
            </div>
        );
    }

    if (!badge) {
        return (
            <div className="p-4">
                <h1>로딩 중...</h1>
            </div>
        );
    }

    return (
        <div className="p-4" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
                padding: '20px',
                textAlign: 'center'
            }}>
                <h1 style={{ color: '#fff', marginBottom: '20px' }}></h1>
                <h2 style={{ 
                    color: '#fff', 
                    fontSize: '18px', 
                    fontWeight: 'normal', 
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)', 
                    marginBottom: '20px' 
                }}>
                    {badge.description}
                </h2>
                <img src={badge.image_url} alt={badge.name} style={{
                    width: '300px',
                    height: '300px',
                    borderRadius: '16px',
                    marginBottom: '20px'
                }} />
                <button 
                    onClick={claimBadge} 
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                    }}
                >
                    배지 받기
                </button>
            </div>
        </div>
    );
} 