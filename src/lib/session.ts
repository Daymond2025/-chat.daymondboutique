import type { ChatSession } from './types';

const PREFIX = 'daymond_chat_';

export function getSession(productId: number): ChatSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${PREFIX}${productId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(productId: number, token: string, lastMessageId: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    `${PREFIX}${productId}`,
    JSON.stringify({ token, lastMessageId, productId })
  );
}

export function updateLastId(productId: number, lastMessageId: number): void {
  const session = getSession(productId);
  if (!session) return;
  saveSession(productId, session.token, lastMessageId);
}

export function clearSession(productId: number): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${PREFIX}${productId}`);
}