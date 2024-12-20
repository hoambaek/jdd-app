'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Supabase 클라이언트 설정
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface StoryPost {
  id: string;
  title: string;
  date: string;
  images: string[];
}

const AdminPage = () => {
  const [stories, setStories] = useState<StoryPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 스토리 목록 불러오기
  const fetchStories = async () => {
    try {
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          date,
          story_images (
            image_url
          )
        `)
        .order('date', { ascending: false });

      if (storiesError) throw storiesError;

      const formattedStories = storiesData.map(story => ({
        id: story.id,
        title: story.title,
        date: story.date,
        images: story.story_images.map((img: any) => img.image_url)
      }));

      setStories(formattedStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      alert('스토리를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // 이미지 업로드 함수
  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `story-images/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('stories')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('이미지 업로드 중 오류가 발생했습니다.');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  // 스토리 추가 모달
  const StoryModal = () => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length + images.length > 5) {
        alert('이미지는 최대 5개까지만 업로드 가능합니다.');
        return;
      }
      setImages(prev => [...prev, ...files]);
    };

    const handleSubmit = async () => {
      if (!title || !date || images.length === 0) {
        alert('모든 필드를 입력해주세요.');
        return;
      }

      setIsSubmitting(true);
      try {
        // 1. 스토리 생성
        const { data: storyData, error: storyError } = await supabase
          .from('stories')
          .insert([
            { title, date }
          ])
          .select()
          .single();

        if (storyError) {
          console.error('Story creation error:', storyError);
          throw new Error('스토리 데이터 생성 실패');
        }

        // 2. 이미지 업로드
        const imageUrls = [];
        for (const image of images) {
          try {
            const url = await uploadImage(image);
            imageUrls.push(url);
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
            throw new Error('이미지 업로드 실패');
          }
        }

        // 3. 이미지 URL DB 저장
        const { error: imageError } = await supabase
          .from('story_images')
          .insert(
            imageUrls.map(url => ({
              story_id: storyData.id,
              image_url: url
            }))
          );

        if (imageError) {
          console.error('Image URL save error:', imageError);
          throw new Error('이미지 URL 저장 실패');
        }

        // 4. 성공 후 리스트 새로고침
        await fetchStories();
        setIsModalOpen(false);
        alert('스토리가 성공적으로 생성되었습니다.');
      } catch (error) {
        console.error('Error details:', error);
        alert(error instanceof Error ? error.message : '스토리 생성에 실패했습니다.');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Modal>
        <ModalContent>
          <h2>새 스토리 추가</h2>
          <Input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <ImageUpload>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              max={5}
            />
            <small>이미지 {images.length}/5</small>
          </ImageUpload>
          <ButtonGroup>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>취소</Button>
          </ButtonGroup>
        </ModalContent>
      </Modal>
    );
  };

  // 스토리 삭제 함수
  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;

      await fetchStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('스토리 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Container>
      <Header>
        <h1>스토리 관리</h1>
        <AddButton onClick={() => setIsModalOpen(true)}>
          + 스토리 추가
        </AddButton>
      </Header>

      <StoryList>
        {stories.map((story) => (
          <StoryItem key={story.id}>
            <StoryHeader>
              <h3>{story.title}</h3>
              <span>{story.date}</span>
            </StoryHeader>
            <ImagePreview>
              {story.images.map((img, index) => (
                <img key={index} src={img} alt={`story-${index}`} />
              ))}
            </ImagePreview>
            <ButtonGroup>
              <Button onClick={() => handleDeleteStory(story.id)}>삭제</Button>
            </ButtonGroup>
          </StoryItem>
        ))}
      </StoryList>

      {isModalOpen && <StoryModal />}
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const AddButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const StoryList = styled.div`
  display: grid;
  gap: 2rem;
`;

const StoryItem = styled.div`
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 8px;
`;

const StoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ImagePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  
  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 4px;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ImageUpload = styled.div`
  margin-bottom: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  
  &:hover {
    background-color: #0056b3;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export default AdminPage;
