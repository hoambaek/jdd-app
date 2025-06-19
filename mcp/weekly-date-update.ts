import { createClient } from '@supabase/supabase-js';

export const weeklyDateUpdate = async (ctx: any) => {
  const supabase = createClient(ctx.env.SUPABASE_URL, ctx.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];

  try {
    // dates 테이블에 현재 날짜 추가
    const { data, error } = await supabase
      .from('dates')
      .insert([
        { 
          date: formattedDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

    if (error) {
      throw error;
    }

    console.log('Successfully updated date:', formattedDate);
    return { success: true, date: formattedDate };
  } catch (error) {
    console.error('Error updating date:', error);
    return { success: false, error };
  }
};

// MCP 설정
export default {
  cron: '0 0 * * 0', // 매주 일요일 자정에 실행
  name: 'weekly-date-update',
  run: weeklyDateUpdate
}; 