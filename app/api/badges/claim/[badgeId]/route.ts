import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { validate as isUuid } from 'uuid';

export async function POST(
    request: Request,
    { params }: { params: { badgeId: string } }
) {
    try {
        const { badgeId } = params;
        const { userId } = await request.json();

        // userId 로그 출력
        console.log('Received userId:', userId);

        // userId가 UUID 형식인지 확인
        if (!isUuid(userId)) {
            console.error('Invalid userId format:', userId);
            return NextResponse.json({ error: 'Invalid userId format' }, { status: 400 });
        }

        // Supabase 클라이언트 설정 확인
        if (!supabase) {
            console.error('Supabase client is not initialized');
            return NextResponse.json({ error: 'Supabase client error' }, { status: 500 });
        }

        // 배지 획득 로직 구현
        const { error } = await supabase
            .from('user_badges')
            .insert({ user_id: userId, badge_id: badgeId });

        if (error) {
            console.error('Supabase error:', error.message, error.details);
            return NextResponse.json({ error: 'Failed to claim badge' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Badge claimed successfully' });
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}