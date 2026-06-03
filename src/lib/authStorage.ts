import { APP_CONFIG } from '@/config/app';

export function getAuthToken(): string | null {
  return localStorage.getItem(APP_CONFIG.auth.tokenKey);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(APP_CONFIG.auth.tokenKey, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(APP_CONFIG.auth.tokenKey);
}

export function getStoredAuthUser(): string | null {
  return localStorage.getItem(APP_CONFIG.auth.userKey);
}

export function setStoredAuthUser(user: unknown): void {
  localStorage.setItem(APP_CONFIG.auth.userKey, JSON.stringify(user));
}

export function removeStoredAuthUser(): void {
  localStorage.removeItem(APP_CONFIG.auth.userKey);
}

export function clearAuthStorage(): void {
  removeAuthToken();
  removeStoredAuthUser();
}
