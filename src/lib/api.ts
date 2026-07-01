import axios from 'axios';
import type { Agent, ConversationStatus, Message, OrderRecap, Product, ProductSuggestion } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// ── Infos produit + agent ────────────────────────────────────────────────────

export async function fetchProduct(slug: string): Promise<{ product: Product | null; agent: Agent | null }> {
  const { data } = await api.get(`/chat/product/${slug}`);
  return data;
}

// ── Démarrer une conversation ────────────────────────────────────────────────

export interface StartResponse {
  session_token: string;
  welcome_message: { id: number; content: string; created_at: string };
  agent: Agent;
  product: Product | null;
}

export async function startChat(productId?: number | null): Promise<StartResponse> {
  const { data } = await api.post('/chat/start', { product_id: productId ?? null });
  return data;
}

// ── Envoyer un message texte ─────────────────────────────────────────────────

export interface SendResponse {
  id: number;
  status: string;
  agent_message:       Message | null;
  order_recap?:        OrderRecap | null;
  show_info_form?:     boolean;
  product_suggestions?: ProductSuggestion[] | null;
  show_catalog?:       boolean;
}

export async function sendMessage(token: string, message: string): Promise<SendResponse> {
  const { data } = await api.post(`/chat/${token}/message`, { message });
  return data;
}

// ── Uploader un fichier (photo / audio / document) ───────────────────────────

export interface UploadResponse {
  id: number;
  type: 'image' | 'audio' | 'video' | 'file';
  url: string;
  name: string;
  direction: 'inbound';
  status: 'delivered';
  created_at: string;
  agent_message: Message | null;
}

export async function uploadFile(token: string, file: File | Blob, filename?: string): Promise<UploadResponse> {
  const form = new FormData();
  if (file instanceof Blob && !(file instanceof File)) {
    form.append('file', file, filename ?? 'voice.webm');
  } else {
    form.append('file', file);
  }
  const { data } = await api.post(`/chat/${token}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
}

// ── Catalogue produits agent (boutique in-chat) ──────────────────────────────

export interface CatalogProduct {
  id:         number;
  name:       string;
  brand:      string;
  price:      string;
  sale_price: string | null;
  image_url:  string | null;
  slug:       string;
}

export async function fetchCatalog(token: string): Promise<CatalogProduct[]> {
  const { data } = await api.get(`/chat/${token}/catalog`);
  return data.products ?? [];
}

// ── Polling messages ─────────────────────────────────────────────────────────

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