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

export interface Message {
  id: number;
  direction: 'inbound' | 'outbound';
  content: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text';
  created_at: string;
}

export interface ConversationStatus {
  stage: string;
  status: 'active' | 'confirmed' | 'completed' | 'abandoned';
  ai_active: boolean;
}

export interface ChatSession {
  token: string;
  lastMessageId: number;
  productId: number;
}