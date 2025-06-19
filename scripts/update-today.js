const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  console.log('필요한 환경 변수:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTodayDate() {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  
  console.log(`오늘 날짜: ${formattedDate}`);
  
  try {
    // dates 테이블에 오늘 날짜 추가
    const { data, error } = await supabase
      .from('dates')
      .insert([
        {
          date: formattedDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      if (error.code === '23505') {
        console.log('이미 오늘 날짜가 데이터베이스에 존재합니다.');
        return;
      }
      throw error;
    }

    console.log('성공적으로 오늘 날짜가 추가되었습니다:', data);
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

updateTodayDate(); 