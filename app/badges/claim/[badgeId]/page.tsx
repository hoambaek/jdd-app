import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient'; // Supabase 클라이언트 가져오기

export default function ClaimBadgePage({ params }: { params: { badgeId: string } }) {
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState<string | null>(null);

    // 사용자 ID 가져오기
    useEffect(() => {
        const fetchUserId = async () => {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error) {
                console.error('Error fetching user ID:', error);
                return;
            }
            setUserId(user?.id || null); // 사용자 ID 설정
        };

        fetchUserId();
    }, []);

    const claimBadge = async () => {
        if (!userId) {
            setMessage('User is not logged in.');
            return;
        }

        try {
            const response = await fetch(`/api/badges/claim/${params.badgeId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }), // 가져온 userId 사용
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
            } else {
                setMessage(data.error);
            }
        } catch (error) {
            console.error('Error claiming badge:', error);
            setMessage('An unexpected error occurred.');
        }
    };

    return (
        <div>
            <h1>배지 획득 페이지</h1>
            <p>배지 ID: {params.badgeId}</p>
            <button onClick={claimBadge}>배지 받기</button>
            {message && <p>{message}</p>}
        </div>
    );
}