/**
 * Utilidades para formateo de fechas y horas
 */

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  
  // Si es string con formato HH:MM:SS
  if (timeStr.includes(':')) {
    return timeStr.substring(0, 5);
  }
  
  return timeStr;
};

export const formatDateTime = (dateStr: string, timeStr: string): string => {
  return `${formatDate(dateStr)} ${formatTime(timeStr)}`;
};

export const getRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  const months = Math.floor(diffDays / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
};
