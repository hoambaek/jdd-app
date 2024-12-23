'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from './SessionProvider';

interface Comment {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  story_id: string;
  user_baptismal: string;
  user_profile_image: string;
}

interface CommentsProps {
  storyId: string;
}

interface UserProfile {
  avatar_url: string | null;
  baptismal_name: string | null;
}

const Comments = ({ storyId }: CommentsProps) => {
  const { session } = useSession();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const supabase = createClientComponentClient();

  // 현재 사용자의 프로필 정보를 가져오는 useEffect 수정
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) {
        setUserProfile(null);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url, baptismal_name')
          .eq('id', session.user.id)
          .limit(1)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            // 프로필이 없는 경우
            setUserProfile({
              avatar_url: '/default-avatar.png',
              baptismal_name: '익명'
            });
            return;
          }
          console.error('프로필 조회 오류:', error);
          return;
        }
        
        setUserProfile({
          avatar_url: data.avatar_url || '/default-avatar.png',
          baptismal_name: data.baptismal_name || '익명'
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // 에러 발생 시 기본값 설정
        setUserProfile({
          avatar_url: '/default-avatar.png',
          baptismal_name: '익명'
        });
      }
    };

    fetchUserProfile();
  }, [session?.user?.id, supabase]);

  // 댓글 목록 가져오기
  useEffect(() => {
    const fetchComments = async () => {
      try {
        // 1. 댓글 데이터 가져오기
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('story_id', storyId)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;

        if (!commentsData || commentsData.length === 0) {
          setComments([]);
          return;
        }

        // 2. 사용자 프로필 데이터 가져오기
        const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
        
        // userIds가 비어있지 않을 때만 프로필 데이터 조회
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, baptismal_name, avatar_url')
            .in('id', userIds);

          if (profilesError) throw profilesError;

          // 3. 댓글과 프로필 데이터 합치기
          const formattedComments = commentsData.map(comment => {
            const userProfile = profilesData?.find(profile => profile.id === comment.user_id);
            return {
              ...comment,
              user_baptismal: userProfile?.baptismal_name || '익명',
              user_profile_image: userProfile?.avatar_url || '/default-avatar.png'
            };
          });

          setComments(formattedComments);
        } else {
          setComments(commentsData.map(comment => ({
            ...comment,
            user_baptismal: '익명',
            user_profile_image: '/default-avatar.png'
          })));
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [storyId, supabase]);

  // 댓글 작성 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      // 1. 댓글 저장
      const { data: newComment, error: commentError } = await supabase
        .from('comments')
        .insert({
          text: comment.trim(),
          user_id: session.user.id,
          story_id: storyId
        })
        .select('*')
        .single();

      if (commentError) {
        if (commentError.code === '401') {
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          window.location.href = '/login';
          return;
        }
        throw commentError;
      }

      if (!newComment) {
        throw new Error('댓글 작성에 실패했습니다.');
      }

      // 2. 현재 사용자의 프로필 정보 사용
      const formattedComment = {
        ...newComment,
        user_baptismal: userProfile?.baptismal_name || '익명',
        user_profile_image: userProfile?.avatar_url || '/default-avatar.png'
      };

      setComments(prev => [...prev, formattedComment]);
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      {/* 댓글 목록 */}
      <div className="px-4 py-2 space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-2">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src={comment.user_profile_image}
                alt={comment.user_baptismal}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-white/90 text-sm">
                  {comment.user_baptismal}
                </span>
                <span className="text-xs text-white/40">
                  {new Date(comment.created_at).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <p className="text-sm text-white/70 mt-0.5">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 댓글 입력 폼 */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src={userProfile?.avatar_url || '/default-avatar.png'}
                  alt="프로필"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글 달기..."
                className="flex-1 bg-transparent text-white/90 placeholder-white/40 text-sm focus:outline-none"
              />
              <button
                type="submit"
                disabled={!comment.trim() || isSubmitting}
                className={`text-sm font-semibold transition-colors ${
                  comment.trim() && !isSubmitting
                    ? 'text-blue-400 hover:text-blue-500'
                    : 'text-blue-400/40 cursor-not-allowed'
                }`}
              >
                게시
              </button>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-between">
              <span className="text-sm text-white/50">댓글을 작성하려면 로그인이 필요합니다</span>
              <a
                href="/login"
                className="text-sm font-semibold text-blue-400 hover:text-blue-500"
              >
                로그인
              </a>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Comments; 