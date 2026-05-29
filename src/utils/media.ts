import { env } from '@/config/env';

// Derive the backend origin from the API URL (e.g. 'http://localhost:8000/api/v1' → 'http://localhost:8000')
const BACKEND_ORIGIN = env.API_URL.replace(/\/api\/v1\/?$/, '');

/**
 * Converts a stored media path to a full URL usable in <img src>.
 *
 * The backend now stores relative paths (e.g. '/uploads/avatar_1_abc.jpg')
 * so that the URL is not tied to a specific host and survives deployments.
 * This helper prepends the backend origin to those relative paths.
 *
 * Also handles legacy records that stored the absolute URL
 * (http://localhost:8000/uploads/...) — those are returned unchanged.
 */
export const getMediaUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path; // legacy absolute URL — keep as-is
  return `${BACKEND_ORIGIN}${path}`;
};
