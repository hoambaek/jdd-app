export const generateBadgeUrl = (badgeId: string, userId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/badge/${badgeId}/${userId}`;
};

export const createBadgeLink = async (badgeId: number): Promise<string> => {
  try {
    // 여기에 QR 코드 URL 생성 로직이 있어야 합니다
    // 예: 배지 ID를 포함한 URL 생성
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const badgeUrl = `${baseUrl}/badge/${badgeId}`;
    return badgeUrl;
  } catch (error) {
    console.error('Error creating badge link:', error);
    throw new Error('Failed to create badge link');
  }
}; 