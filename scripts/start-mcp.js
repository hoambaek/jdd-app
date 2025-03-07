#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// Supabase 서비스 역할 키 가져오기
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!serviceRoleKey || !supabaseUrl) {
  console.error('환경 변수에서 Supabase 키를 찾을 수 없습니다.');
  process.exit(1);
}

// Supabase 프로젝트 ID 추출
const projectId = supabaseUrl.match(/https:\/\/([^.]+)/)[1];

// PostgreSQL 연결 문자열 생성
const connectionString = `postgresql://postgres.${projectId}:${serviceRoleKey}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`;

console.log('Supabase MCP 서버 시작 중...');
console.log(`프로젝트 ID: ${projectId}`);

// MCP 서버 시작
const mcp = spawn('npx', [
  '@modelcontextprotocol/server-postgres',
  connectionString
]);

mcp.stdout.on('data', (data) => {
  console.log(`MCP 서버 출력: ${data}`);
});

mcp.stderr.on('data', (data) => {
  console.error(`MCP 서버 오류: ${data}`);
});

mcp.on('close', (code) => {
  console.log(`MCP 서버가 종료되었습니다. 종료 코드: ${code}`);
});

// Ctrl+C로 종료 시 정리
process.on('SIGINT', () => {
  console.log('MCP 서버 종료 중...');
  mcp.kill();
  process.exit();
}); 