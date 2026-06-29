import type { ChatSession } from './types';

const PREFIX = 'daymond_chat_';

export function getSession(key: string): ChatSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(key: string, token: string, lastMessageId: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    `${PREFIX}${key}`,
    JSON.stringify({ token, lastMessageId, productId: 0 })
  );
}

export function updateLastId(key: string, lastMessageId: number): void {
  const session = getSession(key);
  if (!session) return;
  saveSession(key, session.token, lastMessageId);
}

export function clearSession(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${PREFIX}${key}`);
}