export interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: string;
  sale_price: string | null;
  image_url: string | null;
  slug: string;
  specs: Record<string, string> | null;
}

export interface Agent {
  name: string;
  avatar_url: string | null;
  support_phone: string | null;
}

export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'file';

export interface MediaContent {
  url: string;
  name: string;
  size?: number;
}

export interface Message {
  id: number;
  direction: 'inbound' | 'outbound';
  content: string; // texte ou JSON sérialisé pour les médias
  status: 'sent' | 'delivered' | 'read';
  type: MessageType;
  created_at: string;
  quick_replies?: string[];
}

export interface ConversationStatus {
  stage: string;
  status: 'active' | 'confirmed' | 'completed' | 'abandoned';
  ai_active: boolean;
}

export interface ChatSession {
  token:          string;
  lastMessageId:  number;
  slug:           string;
  productName?:   string;
  productImage?:  string | null;
  agentName?:     string;
  startedAt:      string;
  lastMessageAt:  string;
}