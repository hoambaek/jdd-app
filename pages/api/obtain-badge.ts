import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { badgeId, userId } = req.query;

    if (req.method === 'POST') {
        const { error } = await supabase
            .from('user_badges')
            .insert([{ user_id: userId, badge_id: badgeId }]);

        if (error) {
            return res.status(500).json({ error: 'Error activating badge' });
        }

        return res.status(200).json({ message: 'Badge activated successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
} 