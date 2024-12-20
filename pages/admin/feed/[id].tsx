import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import styles from './FeedEdit.module.css';
import { useDropzone } from 'react-dropzone';

export default function FeedEdit() {
  const router = useRouter();
  const { id } = router.query;
  
  const [feed, setFeed] = useState({
    title: '',
    content: '',
    date: '',
    tags: '',
    image_url: ''
  });
  
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // 파일 크기 체크 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    // 미리보기 URL 생성
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    try {
      // 세션 체크
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('인증이 필요합니다.');
      }

      // 파일 이름 생성
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // 파일 업로드
      const { error: uploadError, data } = await supabase.storage
        .from('feeds')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type // MIME 타입 명시
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(uploadError.message || '파일 업로드 중 오류가 발생했습니다.');
      }

      // 업로드 성공 후 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('feeds')
        .getPublicUrl(filePath);

      setFeed(prev => ({ ...prev, image_url: publicUrl }));

    } catch (error) {
      console.error('Error details:', error);
      alert(error.message || '이미지 업로드에 실패했습니다.');
      // 실패시 미리보기 초기화
      setPreviewUrl('');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  useEffect(() => {
    if (id && id !== 'new') fetchFeed();
  }, [id]);

  const fetchFeed = async () => {
    const { data, error } = await supabase
      .from('feeds')
      .select('*')
      .eq('id', id)
      .single();
      
    if (data) {
      setFeed(data);
      setPreviewUrl(data.image_url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!feed.title || !feed.date || !feed.image_url) {
      alert('제목, 날짜, 이미지는 필수 항목입니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('feeds')
        .upsert({
          id: id !== 'new' ? id : undefined,
          title: feed.title,
          content: feed.content,
          date: feed.date,
          tags: feed.tags,
          image_url: feed.image_url,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Submit error:', error);
        throw error;
      }

      alert('피드가 성공적으로 등록되었습니다.');
      router.push('/admin/feed');
      
    } catch (error) {
      console.error('Error submitting feed:', error);
      alert('피드 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (id === 'new') return;
    
    const { error } = await supabase
      .from('feeds')
      .delete()
      .eq('id', id);
      
    if (!error) router.push('/admin/feed');
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div 
          {...getRootProps()} 
          className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''}`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className={styles.uploading}>업로드 중...</div>
          ) : previewUrl ? (
            <img src={previewUrl} alt="Preview" className={styles.preview} />
          ) : (
            <div className={styles.placeholder}>
              <p>이미지를 드래그하거나 클릭하여 업로드하세요</p>
              <p className={styles.subText}>지원 형식: JPG, PNG, GIF</p>
            </div>
          )}
        </div>
        
        <input
          type="text"
          placeholder="제목"
          value={feed.title}
          onChange={(e) => setFeed({...feed, title: e.target.value})}
          className={styles.inputField}
        />
        
        <input
          type="date"
          value={feed.date}
          onChange={(e) => setFeed({...feed, date: e.target.value})}
          className={styles.inputField}
        />
        
        <textarea
          placeholder="내용"
          value={feed.content}
          onChange={(e) => setFeed({...feed, content: e.target.value})}
          className={styles.textareaField}
        />
        
        <input
          type="text"
          placeholder="태그 (쉼표로 구분)"
          value={feed.tags}
          onChange={(e) => setFeed({...feed, tags: e.target.value})}
          className={styles.inputField}
        />
        
        <div className={styles.buttons}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '등록'}
          </button>
          <button 
            type="button" 
            onClick={handleDelete} 
            className={styles.deleteButton}
            disabled={isSubmitting}
          >
            삭제
          </button>
        </div>
      </form>
    </div>
  );
} 