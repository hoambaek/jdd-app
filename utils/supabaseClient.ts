import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qloytvrhkjviqyzuimio.supabase.co'; // Supabase 프로젝트 URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsb3l0dnJoa2p2aXF5enVpbWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MzkxNzYsImV4cCI6MjA1MDAxNTE3Nn0.JJlf2uXjbk48w0rSGF2b8PDHz8U_TLYoxdTRdKnbqkc'; // Supabase 공개 키

// Supabase 클라이언트 생성
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        'Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.'
    );
}

// 연결 테스트
const testConnection = async () => {
    try {
        const { data, error } = await supabase.from('badges').select('*').limit(1);
        if (error) throw error;
        console.log('Supabase 연결 성공');
    } catch (error) {
        console.error('Supabase 연결 테스트 실패:', error);
    }
};

// 초기 연결 테스트 실행
testConnection();