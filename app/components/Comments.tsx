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
  likes: string[] | null;
}

interface CommentsProps {
  storyId: string;
}

interface UserProfile {
  avatar_url: string | null;
  baptismal_name: string | null;
}

// CSS를 추가해야 합니다. styles/globals.css 또는 별도의 CSS 모듈에 추가하세요
/*
.heart-button {
  background-image: url("https://abs.twimg.com/a/1446542199/img/t1/web_heart_animation.png");
  background-position: left;
  background-repeat: no-repeat;
  background-size: 2900%;
  height: 100px;
  width: 100px;
  cursor: pointer;
}

.heart-button.animate {
  animation: heart-burst .8s steps(28) forwards;
}

@keyframes heart-burst {
  0% {
    background-position: left;
  }
  100% {
    background-position: right;
  }
}
*/

const Comments = ({ storyId }: CommentsProps) => {
  const { session } = useSession();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const supabase = createClientComponentClient();
  const [showAllComments, setShowAllComments] = useState(false);
  const COMMENTS_TO_SHOW = 3;  // 기본적으로 보여줄 댓글 수

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
          .single();
          
        if (error) {
          console.error('프로필 조회 오류:', error);
          setUserProfile({
            avatar_url: 'https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/profile-images/profile-placeholder.png',
            baptismal_name: '익명'
          });
          return;
        }

        console.log('프로필 데이터:', data);
        
        let fullAvatarUrl;
        if (!data?.avatar_url) {
          fullAvatarUrl = 'https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/profile-images/profile-placeholder.png';
        } else if (data.avatar_url.startsWith('http')) {
          fullAvatarUrl = data.avatar_url;
        } else {
          fullAvatarUrl = `https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/profile-images/${data.avatar_url}`;
        }

        console.log('최종 이미지 URL:', fullAvatarUrl);

        setUserProfile({
          avatar_url: fullAvatarUrl,
          baptismal_name: data?.baptismal_name || '익명'
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile({
          avatar_url: 'https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/profile-images/profile-placeholder.png',
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
        console.log('Fetching comments for story:', storyId);
        
        // 먼저 댓글 데이터만 가져오기
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            id,
            text,
            created_at,
            user_id,
            story_id
          `)
          .eq('story_id', storyId)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;

        // 각 댓글의 사용자 프로필 정보 가져오기
        const commentsWithProfiles = await Promise.all(
          (commentsData || []).map(async (comment) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('baptismal_name, avatar_url')
              .eq('id', comment.user_id)
              .single();

            const avatarUrl = profileData?.avatar_url
              ? profileData.avatar_url.startsWith('http')
                ? profileData.avatar_url
                : `https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/profile-images/${profileData.avatar_url}`
              : 'https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/profile-images/profile-placeholder.png';

            return {
              ...comment,
              user_baptismal: profileData?.baptismal_name || '익명',
              user_profile_image: avatarUrl
            };
          })
        );

        console.log('Comments with profiles:', commentsWithProfiles);
        setComments(commentsWithProfiles);
      } catch (error) {
        console.error('Error in fetchComments:', error);
      }
    };

    fetchComments();

    // 실시간 구독 설정
    const channel = supabase
      .channel(`comments-${storyId}`)
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `story_id=eq.${storyId}`
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storyId, supabase]);

  // 댓글 작성 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      // 댓저 댓글 추가
      const { data: newComment, error: commentError } = await supabase
        .from('comments')
        .insert({
          text: comment.trim(),
          user_id: session.user.id,
          story_id: storyId
        })
        .select()
        .single();

      if (commentError) throw commentError;

      // 사용자 프로필 정보 가져오기
      const { data: profileData } = await supabase
        .from('profiles')
        .select('baptismal_name, avatar_url')
        .eq('id', session.user.id)
        .single();

      // 새 댓글 포맷팅
      const avatarUrl = profileData?.avatar_url
        ? profileData.avatar_url.startsWith('http')
          ? profileData.avatar_url
          : `https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/profile-images/${profileData.avatar_url}`
        : 'https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/profile-images/profile-placeholder.png';

      const formattedComment = {
        ...newComment,
        user_baptismal: profileData?.baptismal_name || '익명',
        user_profile_image: avatarUrl
      };

      // 댓글 목록에 추가
      setComments(prev => [...prev, formattedComment]);
      
      // 입력창 초기화
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 시간 차이 계산 함수
  const getTimeDifference = (created_at: string) => {
    const now = new Date();
    const created = new Date(created_at);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    return `${diffDays}일 전`;
  };

  // 삭제 함수 추가
  const handleDeleteComment = async (commentId: string, userId: string) => {
    if (!session?.user || session.user.id !== userId) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // 댓글 목록에서 삭제
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  // 표시할 댓글 필터링
  const visibleComments = showAllComments 
    ? comments 
    : comments.slice(0, COMMENTS_TO_SHOW);

  return (
    <div className="">
      {/* 댓글 목록 */}
      <div className="px-4 py-1 space-y-4">
        {visibleComments.map((comment) => (
          <div key={comment.id} className="flex items-start justify-between gap-3">
            {/* 프로필 이미지 */}
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src={comment.user_profile_image}
                alt={comment.user_baptismal}
                fill
                className="rounded-full object-cover"
              />
            </div>

            {/* 텍스트 영역 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <span className="font-medium text-white/90 mr-2">
                    {comment.user_baptismal}
                  </span>
                  <span className="text-sm text-white/40">
                    {getTimeDifference(comment.created_at)}
                  </span>
                </div>
                {/* 삭제 버튼 추가 */}
                {session?.user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id, comment.user_id)}
                    className="text-white/40 hover:text-white/60 transition-colors ml-2"
                    aria-label="댓글 삭제"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="text-sm text-white/70 mt-1 break-words">
                {comment.text}
              </p>
            </div>
          </div>
        ))}
        
        {/* 더보기 버튼 */}
        {comments.length > COMMENTS_TO_SHOW && (
          <button
            onClick={() => setShowAllComments(!showAllComments)}
            className="text-sm text-white/50 hover:text-white/70 transition-colors mt-2 flex items-center gap-1"
          >
            {showAllComments ? (
              <>
                접기 <span className="text-xs">▲</span>
              </>
            ) : (
              <>
                더보기 <span className="text-xs">({comments.length - COMMENTS_TO_SHOW}개의 댓글) ▼</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 댓글 입력 폼 */}
      <form onSubmit={handleSubmit} className="px-4 py-2 border-t border-white/5">
        <div className="flex items-center gap-2 mb-1">
          {session?.user ? (
            <>
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src={userProfile?.avatar_url || 'https://qloytvrhkjviqyzuimio.supabase.co/storage/v1/object/public/profile-images/profile-placeholder.png'}
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