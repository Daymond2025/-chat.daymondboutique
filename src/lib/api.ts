import axios from 'axios';
import type { Agent, ConversationStatus, Message, Product } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// ── Infos produit + agent (avant démarrage) ─────────────────────────────────

export async function fetchProduct(slug: string): Promise<{ product: Product; agent: Agent | null }> {
  const { data } = await api.get(`/chat/product/${slug}`);
  return data;
}

// ── Démarrer une conversation ────────────────────────────────────────────────

export interface StartResponse {
  session_token: string;
  welcome_message: { id: number; content: string; created_at: string };
  agent: Agent;
  product: Product;
}

export async function startChat(productId?: number | null): Promise<StartResponse> {
  const { data } = await api.post('/chat/start', { product_id: productId ?? null });
  return data;
}

// ── Envoyer un message ───────────────────────────────────────────────────────

export async function sendMessage(token: string, message: string): Promise<{ id: number }> {
  const { data } = await api.post(`/chat/${token}/message`, { message });
  return data;
}

// ── Polling — nouveaux messages depuis last_id ───────────────────────────────

export interface PollResponse {
  messages: Message[];
  conversation: ConversationStatus;
}

export async function pollMessages(token: string, lastId: number): Promise<PollResponse> {
  const { data } = await api.get(`/chat/${token}/messages`, {
    params: { last_id: lastId },
  });
  return data;
}