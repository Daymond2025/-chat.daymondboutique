import type { ChatSession } from './types';

const PREFIX = 'daymond_chat_';

export function getSession(slug: string): ChatSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${PREFIX}${slug}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export interface SaveSessionOptions {
  productName?:  string;
  productImage?: string | null;
  agentName?:    string;
}

export function saveSession(
  slug: string,
  token: string,
  lastMessageId: number,
  opts: SaveSessionOptions = {}
): void {
  if (typeof window === 'undefined') return;
  const existing = getSession(slug);
  const session: ChatSession = {
    token,
    lastMessageId,
    slug,
    productName:  opts.productName  ?? existing?.productName,
    productImage: opts.productImage ?? existing?.productImage,
    agentName:    opts.agentName    ?? existing?.agentName,
    startedAt:    existing?.startedAt ?? new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
  };
  localStorage.setItem(`${PREFIX}${slug}`, JSON.stringify(session));
}

export function updateLastId(slug: string, lastMessageId: number): void {
  const session = getSession(slug);
  if (!session) return;
  session.lastMessageId = lastMessageId;
  session.lastMessageAt = new Date().toISOString();
  localStorage.setItem(`${PREFIX}${slug}`, JSON.stringify(session));
}

export function clearSession(slug: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${PREFIX}${slug}`);
}

export function getAllSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  const sessions: ChatSession[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PREFIX)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (raw) sessions.push(JSON.parse(raw));
    } catch { /* skip invalid */ }
  }
  return sessions.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}
