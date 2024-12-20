export const generateBadgeUrl = (badgeId: string, userId: string): string => {
  const FALLBACK_URL = 'https://ourjdd.com';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || FALLBACK_URL;
  return `${baseUrl}/badge/${badgeId}/${userId}`;
};

export const createBadgeLink = async (badgeId: number): Promise<string> => {
  const url = `https://ourjdd.com/badge/${badgeId}`;
  return url;
}; 