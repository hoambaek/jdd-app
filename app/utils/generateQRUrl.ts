export const generateQRUrl = (badgeId: string, userId?: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ourjdd.com';
  const url = `${baseUrl}/claim/${badgeId}`;
  
  if (userId) {
    return `${url}?userId=${userId}`;
  }
  
  return url;
}; 