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

export interface OrderRecap {
  product_name: string;
  product_image?: string | null;
  price: string;
  customer_name: string;
  delivery_address: string;
  phone: string;
  delivery_date?: string;
  delivery_fee: number;
  tva: number;
  remise: number;
  total: string;
  bonuses: string[];
  currency: string;
}

export interface ProductSuggestion {
  id:         number;
  name:       string;
  brand:      string;
  price:      string;
  sale_price: string | null;
  image_url:  string | null;
  slug:       string;
}

export interface Message {
  id: number;
  direction: 'inbound' | 'outbound';
  content: string; // texte ou JSON sérialisé pour les médias
  status: 'sent' | 'delivered' | 'read';
  type: MessageType;
  created_at: string;
  quick_replies?:      string[];
  order_recap?:        OrderRecap;
  product_suggestions?: ProductSuggestion[];
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