'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import BottomNav from '../../components/BottomNav';

// Supabase 클라이언트 설정
const supabase = createClientComponentClient<Database>();

interface Workshop {
  id: string;
  title: string;
  content: string;
  date: string;
  image_url: string;
  url: string;
  embed_code: string;
}

const WorkshopManager = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 워크샵 목록 불러오기
  const fetchWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setWorkshops(data || []);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      alert('워크샵 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  // 이미지 업로드 함수
  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `workshop-images/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('workshops')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('workshops')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  // 워크샵 추가 모달
  const WorkshopModal = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [url, setUrl] = useState('');
    const [embed_code, setEmbedCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
      if (!title || !content || !date || !time || !image) {
        alert('모든 필드를 입력해주세요.');
        return;
      }

      const dateTimeString = `${date}T${time}:00`;

      setIsSubmitting(true);
      try {
        // 1. 이미지 업로드
        const fileExt = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `workshop-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('workshops')
          .upload(filePath, image, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // 2. 이미지 URL 가져오기
        const { data: { publicUrl } } = supabase.storage
          .from('workshops')
          .getPublicUrl(filePath);

        // 3. 워크샵 데이터 저장
        const { error: insertError } = await supabase
          .from('workshops')
          .insert([
            {
              title,
              content,
              date: dateTimeString,
              image_url: publicUrl,
              url: url,
              embed_code: embed_code
            }
          ]);

        if (insertError) throw insertError;

        await fetchWorkshops();
        setIsModalOpen(false);
        alert('워크샵이 성공적으로 추가되었습니다.');
      } catch (error) {
        console.error('Error adding workshop:', error);
        alert('워크샵 추가에 실패했습니다. 에러: ' + (error as Error).message);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Modal>
        <ModalContent>
          <h2>새 워크샵 추가</h2>
          <TextArea
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextArea
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex gap-4">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <ImageUpload>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </ImageUpload>
          <Input
            type="url"
            placeholder="워크샵 URL (선택사항)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              제링크 (선택사항)
            </label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={4}
              value={embed_code}
              onChange={(e) => setEmbedCode(e.target.value)}
              placeholder="URL을 입력하세요"
            />
          </div>
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

  // 워크샵 수정 모달
  const EditWorkshopModal = () => {
    const [title, setTitle] = useState(editingWorkshop?.title || '');
    const [content, setContent] = useState(editingWorkshop?.content || '');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [url, setUrl] = useState(editingWorkshop?.url || '');
    const [embed_code, setEmbedCode] = useState(editingWorkshop?.embed_code || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 초기값 설정을 위한 useEffect
    useEffect(() => {
      if (editingWorkshop?.date) {
        const dateObj = new Date(editingWorkshop.date);
        setDate(dateObj.toISOString().split('T')[0]);
        setTime(dateObj.toTimeString().slice(0, 5));
      }
    }, [editingWorkshop]);

    const handleSubmit = async () => {
      if (!title || !content || !date || !time) {
        alert('필수 필드를 모두 입력해주세요.');
        return;
      }

      const dateTimeString = `${date}T${time}:00`;

      setIsSubmitting(true);
      try {
        let imageUrl = editingWorkshop?.image_url;
        if (image) {
          imageUrl = await uploadImage(image);
        }

        const { error } = await supabase
          .from('workshops')
          .update({
            title,
            content,
            date: dateTimeString,
            image_url: imageUrl,
            url: url,
            embed_code: embed_code
          })
          .eq('id', editingWorkshop?.id);

        if (error) throw error;

        await fetchWorkshops();
        setIsEditModalOpen(false);
        alert('워크샵이 성공적으로 수정되었습니다.');
      } catch (error) {
        console.error('Error updating workshop:', error);
        alert('워크샵 수정에 실패했습니다.');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Modal>
        <ModalContent>
          <h2>워크샵 수정</h2>
          <TextArea
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextArea
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex gap-4">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <ImageUpload>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
            {editingWorkshop?.image_url && (
              <img 
                src={editingWorkshop.image_url} 
                alt="Current" 
                style={{ width: '100px', marginTop: '10px' }} 
              />
            )}
          </ImageUpload>
          <Input
            type="url"
            placeholder="워크샵 URL (선택사항)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              예제링크 (선택사항)
            </label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={4}
              value={embed_code}
              onChange={(e) => setEmbedCode(e.target.value)}
              placeholder="URL을 입력하세요"
            />
          </div>
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

  // 워크샵 삭제 함수
  const handleDeleteWorkshop = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('workshops')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchWorkshops();
      alert('워크샵이 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting workshop:', error);
      alert('워크샵 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Container>
      <Header>
        <h1>워크샵 관리</h1>
        <AddButton onClick={() => setIsModalOpen(true)}>
          + 워크샵 추가
        </AddButton>
      </Header>

      <WorkshopList>
        {workshops.map((workshop) => (
          <WorkshopItem key={workshop.id}>
            <WorkshopImage>
              <img src={workshop.image_url} alt={workshop.title} />
            </WorkshopImage>
            <WorkshopInfo>
              <h3 className="text-xl font-semibold mb-2">{workshop.title}</h3>
              <div className="flex items-center text-gray-600 mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>
                  {new Date(workshop.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} {new Date(workshop.date).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <ButtonGroup>
                <Button onClick={() => {
                  setEditingWorkshop(workshop);
                  setIsEditModalOpen(true);
                }}>
                  수정
                </Button>
                <Button onClick={() => handleDeleteWorkshop(workshop.id)}>
                  삭제
                </Button>
              </ButtonGroup>
            </WorkshopInfo>
          </WorkshopItem>
        ))}
      </WorkshopList>

      {isModalOpen && <WorkshopModal />}
      {isEditModalOpen && <EditWorkshopModal />}
      <BottomNav />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 80px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const AddButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  
  &:hover {
    background-color: #45a049;
  }
`;

const WorkshopList = styled.div`
  display: grid;
  gap: 20px;
`;

const WorkshopItem = styled.div`
  display: flex;
  gap: 20px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const WorkshopImage = styled.div`
  width: 150px;
  height: 150px;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 5px;
  }
`;

const WorkshopInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  h3 {
    margin: 0;
    line-height: 1.4;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: vertical;
`;

const ImageUpload = styled.div`
  margin: 10px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: #45a049;
  }
`;

export default WorkshopManager;