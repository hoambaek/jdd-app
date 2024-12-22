'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import BottomNav from '../../components/BottomNav';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<StoryPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 스토리 목록 불러오기
  const fetchStories = async () => {
    try {
      console.log('Fetching stories...');
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          date,
          story_images (
            id,
            image_url
          )
        `)
        .order('date', { ascending: false });

      if (storiesError) {
        console.error('Stories fetch error:', storiesError);
        throw storiesError;
      }

      console.log('Raw stories data:', storiesData);

      const formattedStories = await Promise.all(storiesData.map(async story => {
        const images = story.story_images?.map((img: any) => {
          // 이미지 URL이 이미 전체 URL인 경우 그대로 사용
          if (img.image_url.startsWith('http')) {
            return img.image_url;
          }
          // 상대 경로인 경우 전체 URL 생성
          return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/stories/${img.image_url}`;
        }) || [];

        return {
          id: story.id,
          title: story.title,
          date: story.date,
          images
        };
      }));

      console.log('Formatted stories:', formattedStories);
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

      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        throw new Error('이미지 파일만 업로드 가능합니다.');
      }

      // 파일 크기 체크 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('파일 크기는 10MB 이하여야 합니다.');
      }

      // 파일 업로드
      const { data, error: uploadError } = await supabase.storage
        .from('stories')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('이미지 업로드 중 오류가 발생했습니다.');
      }

      // 공개 URL 가져오기
      const { data: urlData } = await supabase.storage
        .from('stories')
        .createSignedUrl(filePath, 31536000); // 1년 유효기간

      if (!urlData?.signedUrl) {
        throw new Error('이미지 URL을 가져오는데 실패했습니다.');
      }

      // 서명된 URL에서 쿼리 파라미터 제거
      const baseUrl = urlData.signedUrl.split('?')[0];
      return baseUrl;

    } catch (error) {
      console.error('Image upload error details:', error);
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

  // 스토리 수정 함수 추가
  const handleEditStory = async (story: StoryPost) => {
    setEditingStory(story);
    setIsEditModalOpen(true);
  };

  // 수정 모달 컴포넌트 추가
  const EditStoryModal = () => {
    const [title, setTitle] = useState(editingStory?.title || '');
    const [date, setDate] = useState(editingStory?.date || '');
    const [currentImages, setCurrentImages] = useState<string[]>(editingStory?.images || []);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 컴포넌트 마운트 시 현재 이미지 설정
    useEffect(() => {
      if (editingStory) {
        setCurrentImages(editingStory.images || []);
      }
    }, [editingStory]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length + currentImages.length + newImages.length > 5) {
        alert('이미지는 최대 5개까지만 업로드 가능합니다.');
        return;
      }
      setNewImages(prev => [...prev, ...files]);
    };

    const handleRemoveCurrentImage = (indexToRemove: number) => {
      setCurrentImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleRemoveNewImage = (indexToRemove: number) => {
      setNewImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async () => {
      if (!title || !date) {
        alert('제목과 날짜를 입력해주세요.');
        return;
      }

      if (currentImages.length + newImages.length === 0) {
        alert('최소 1개의 이미지가 필요합니다.');
        return;
      }

      setIsSubmitting(true);
      try {
        // 1. 스토리 정보 업데이트
        const { error: storyError } = await supabase
          .from('stories')
          .update({ title, date })
          .eq('id', editingStory?.id);

        if (storyError) {
          console.error('Story update error:', storyError);
          throw new Error('스토리 정보 업데이트 실패');
        }

        // 2. 기존 이미지 모두 삭제
        const { error: deleteImagesError } = await supabase
          .from('story_images')
          .delete()
          .eq('story_id', editingStory?.id);

        if (deleteImagesError) {
          console.error('Delete images error:', deleteImagesError);
          throw new Error('기존 이미지 삭제 실패');
        }

        // 3. 이미지 URL 배열 준비
        let allImageUrls = [...currentImages];

        // 4. 새 이미지 업로드
        if (newImages.length > 0) {
          for (const image of newImages) {
            try {
              console.log('Uploading image:', image.name);
              const url = await uploadImage(image);
              console.log('Upload successful, URL:', url);
              allImageUrls.push(url);
            } catch (uploadError) {
              console.error('Individual image upload error:', uploadError);
              throw new Error(`이미지 "${image.name}" 업로드 실패: ${uploadError.message}`);
            }
          }
        }

        // 5. 모든 이미지 URL DB 저장
        if (allImageUrls.length > 0) {
          console.log('Saving image URLs to DB:', allImageUrls);
          const { error: insertImagesError } = await supabase
            .from('story_images')
            .insert(
              allImageUrls.map(url => ({
                story_id: editingStory?.id,
                image_url: url
              }))
            );

          if (insertImagesError) {
            console.error('Insert images error:', insertImagesError);
            throw new Error('이미지 URL 저장 실패');
          }
        }

        await fetchStories();
        setIsEditModalOpen(false);
        alert('스토리가 성공적으로 수정되었습니다.');
      } catch (error) {
        console.error('Final error details:', error);
        alert(error instanceof Error ? error.message : '스토리 수정에 실패했습니다.');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Modal>
        <ModalContent>
          <h2>스토리 수정</h2>
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
          
          <ImageSection>
            <h3>현재 이미지</h3>
            <CurrentImages>
              {currentImages.map((img, index) => (
                <ImageWrapper key={index}>
                  <img src={img} alt={`current-${index}`} />
                  <RemoveButton onClick={() => handleRemoveCurrentImage(index)}>
                    ✕
                  </RemoveButton>
                </ImageWrapper>
              ))}
            </CurrentImages>

            
            <ImageUpload>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
              <small>
                전체 이미지 {currentImages.length + newImages.length}/5
              </small>
            </ImageUpload>
            
            {newImages.length > 0 && (
              <NewImages>
                {newImages.map((file, index) => (
                  <ImageWrapper key={index}>
                    <img src={URL.createObjectURL(file)} alt={`new-${index}`} />
                    <RemoveButton onClick={() => handleRemoveNewImage(index)}>
                      ✕
                    </RemoveButton>
                  </ImageWrapper>
                ))}
              </NewImages>
            )}
          </ImageSection>

          <ButtonGroup>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? '수정 중...' : '수정'}
            </Button>
            <Button onClick={() => setIsEditModalOpen(false)}>취소</Button>
          </ButtonGroup>
        </ModalContent>
      </Modal>
    );
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
              {story.images && story.images.map((img, index) => (
                <img key={index} src={img} alt={`story-${index}`} />
              ))}
            </ImagePreview>
            <ButtonGroup>
              <Button onClick={() => handleEditStory(story)}>수정</Button>
              <Button onClick={() => handleDeleteStory(story.id)}>삭제</Button>
            </ButtonGroup>
          </StoryItem>
        ))}
      </StoryList>

      {isModalOpen && <StoryModal />}
      {isEditModalOpen && <EditStoryModal />}
      <BottomNav />
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

  h1 {
    font-size: 1.7rem;
  }
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
  margin-bottom: 4rem;
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

const ImageSection = styled.div`
  margin: 1rem 0;
  
  h3 {
    margin: 1rem 0;
    font-size: 1rem;
  }
`;

const CurrentImages = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const NewImages = styled(CurrentImages)``;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

export default AdminPage;
