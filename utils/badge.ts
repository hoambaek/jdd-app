export const generateBadgeUrl = (badgeId: string, userId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jdd55.netlify.app';
  return `${baseUrl}/badge/${badgeId}/${userId}`;
};

export const createBadgeLink = async (badgeId: number): Promise<string> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jdd55.netlify.app';
    const badgeUrl = `${baseUrl}/badge/${badgeId}`;
    return badgeUrl;
  } catch (error) {
    console.error('Error creating badge link:', error);
    throw new Error('Failed to create badge link');
  }
}; 