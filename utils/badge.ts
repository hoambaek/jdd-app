export const generateBadgeUrl = (badgeId: string, userId: string): string => {
  const FALLBACK_URL = 'https://your-production-domain.com';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || FALLBACK_URL;
  return `${baseUrl}/badge/${badgeId}/${userId}`;
};

export const createBadgeLink = (badgeId: number): string => {
  const FALLBACK_URL = 'http://localhost:3000';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_URL;
  return `${baseUrl}/badge/collect/${badgeId}`;
}; 