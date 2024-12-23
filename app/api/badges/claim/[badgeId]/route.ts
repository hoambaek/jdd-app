import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(
  request: Request,
  { params }: { params: { badgeId: string } }
) {
  try {
    const body = await request.json();
    const { userId } = body;
    const { badgeId } = params;
    const supabase = createRouteHandlerClient({ cookies });

    console.log('Attempting to claim badge with:', { userId, badgeId });

    if (!userId || !badgeId) {
      console.error('Missing required fields:', { userId, badgeId });
      return NextResponse.json(
        { error: '사용자 ID와 배지 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 배지가 존재하는지 먼저 확인
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('id', badgeId)
      .maybeSingle();

    console.log('Badge check result:', { badge, error: badgeError });

    if (badgeError) {
      console.error('Error finding badge:', badgeError);
      return NextResponse.json(
        { error: '배지 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (!badge) {
      return NextResponse.json(
        { error: '해당 배지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 획득한 배지인지 확인
    const { data: existingBadge, error: checkError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .maybeSingle();

    console.log('Existing badge check:', { existingBadge, error: checkError });

    if (checkError) {
      console.error('Error checking existing badge:', checkError);
      return NextResponse.json(
        { error: '배지 확인 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (existingBadge) {
      return NextResponse.json(
        { error: '이미 획득한 배지입니다.' },
        { status: 400 }
      );
    }

    // 새로운 배지 획득 기록 추가
    const insertData = {
      user_id: userId,
      badge_id: badgeId,
      acquired_at: new Date().toISOString(),
    };

    console.log('Attempting to insert badge:', insertData);

    const { data: insertedBadge, error: insertError } = await supabase
      .from('user_badges')
      .insert([insertData])
      .select()
      .single();

    console.log('Insert result:', { insertedBadge, error: insertError });

    if (insertError) {
      console.error('Error inserting badge:', insertError);
      return NextResponse.json(
        { 
          error: '배지 획득 중 오류가 발생했습니다.',
          details: insertError.message 
        },
        { status: 500 }
      );
    }

    console.log('Badge claimed successfully:', insertedBadge);
    return NextResponse.json({
      message: '배지를 성공적으로 획득했습니다!',
      data: insertedBadge
    });

  } catch (error) {
    console.error('Unexpected error in badge claim:', error);
    return NextResponse.json(
      { 
        error: '예기치 않은 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}