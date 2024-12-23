import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { badgeId } = req.query;
    const { userId } = req.body;

    if (!badgeId || !userId) {
        return res.status(400).json({ message: 'Badge ID and User ID are required' });
    }

    // 이미 획득한 배지인지 확인
    const { data: existingEntry, error: existingError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .single();

    if (existingError && existingError.code !== 'PGRST116') {
        return res.status(500).json({ message: 'Error checking existing badge', error: existingError });
    }

    if (existingEntry) {
        return res.status(409).json({ message: 'Badge already claimed' });
    }

    // 새로운 배지 추가
    const { data, error } = await supabase
        .from('user_badges')
        .insert([{ user_id: userId, badge_id: badgeId }]);

    if (error) {
        return res.status(500).json({ message: 'Error claiming badge', error });
    }

    res.status(200).json({ message: 'Badge claimed successfully', data });
}