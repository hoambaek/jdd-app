"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string | null;
  baptismal_name: string | null;
  grade: string | null;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  // 관리자 권한 체크와 사용자 목록 불러오기를 하나의 useEffect로 통합
  useEffect(() => {
    let isSubscribed = true;  // cleanup을 위한 flag

    const initializeAdminPage = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.replace('/admin/login');  // push 대신 replace 사용
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile?.is_admin) {
          router.replace('/');  // push 대신 replace 사용
          return;
        }

        // 관리자 확인 후 사용자 목록 불러오기
        if (isSubscribed) {  // 컴포넌트가 마운트된 상태일 때만 상태 업데이트
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, email, name, baptismal_name, grade')
            .order('name');

          if (error) throw error;
          setUsers(profiles);
          setLoading(false);
        }
      } catch (error) {
        console.error('Admin page initialization error:', error);
        router.replace('/admin/login');
      }
    };

    initializeAdminPage();

    // Cleanup function
    return () => {
      isSubscribed = false;
    };
  }, [router, supabase]);  // 의존성 배열 최소화

  // 이메일 변경 처리
  const handleEmailUpdate = async () => {
    if (!selectedUser || !newEmail || loading) {  // loading 체크 추가
      setMessage('사용자와 새 이메일을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: 'updateEmail',
          value: newEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '이메일 변경에 실패했습니다.');
      }

      setMessage('이메일이 성공적으로 변경되었습니다.');
      setNewEmail('');
      setSelectedUser(null);
    } catch (error) {
      console.error('이메일 변경 오류:', error);
      setMessage(error instanceof Error ? error.message : '이메일 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 변경 처리
  const handlePasswordUpdate = async () => {
    if (!selectedUser || !newPassword || loading) {  // loading 체크 추가
      setMessage('사용자와 새 비밀번호를 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: 'updatePassword',
          value: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '비밀번호 변경에 실패했습니다.');
      }

      setMessage('비밀번호가 성공적으로 변경되었습니다.');
      setNewPassword('');
      setSelectedUser(null);
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      setMessage(error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">사용자 관리</h1>

      {/* 사용자 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">사용자 선택</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedUser?.id || ''}
          onChange={(e) => {
            const user = users.find(u => u.id === e.target.value);
            setSelectedUser(user || null);
          }}
        >
          <option value="">사용자를 선택하세요</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email}) - {user.grade}
            </option>
          ))}
        </select>
      </div>

      {/* 이메일 변경 섹션 */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">이메일 변경</h2>
        <input
          type="email"
          placeholder="새 이메일"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <button
          onClick={handleEmailUpdate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!selectedUser || !newEmail}
        >
          이메일 변경
        </button>
      </div>

      {/* 비밀번호 변경 섹션 */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">비밀번호 변경</h2>
        <input
          type="password"
          placeholder="새 비밀번호"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <button
          onClick={handlePasswordUpdate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!selectedUser || !newPassword}
        >
          비밀번호 변경
        </button>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          {message}
        </div>
      )}
    </div>
  );
} 