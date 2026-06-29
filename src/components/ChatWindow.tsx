'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isToday, isYesterday, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ShoppingBag } from 'lucide-react';

import AgentHeader from './AgentHeader';
import ProductCard from './ProductCard';
import MessageBubble from './MessageBubble';
import DateSeparator from './DateSeparator';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

import { pollMessages, sendMessage, startChat } from '@/lib/api';
import { clearSession, getSession, saveSession, updateLastId } from '@/lib/session';
import type { Agent, ConversationStatus, Message, Product } from '@/lib/types';

interface Props {
  slug: string;
  initialProduct: Product;
  initialAgent: Agent | null;
}

function dateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d))     return "Aujourd'hui";
  if (isYesterday(d)) return 'Hier';
  return format(d, 'd MMMM yyyy', { locale: fr });
}

export default function ChatWindow({ slug, initialProduct, initialAgent }: Props) {
  const [product]       = useState<Product>(initialProduct);
  const [agent, setAgent] = useState<Agent | null>(initialAgent);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [convStatus, setConvStatus] = useState<ConversationStatus>({
    stage: 'greeting', status: 'active', ai_active: true,
  });
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [lastId, setLastId]             = useState(0);
  const [isTyping, setIsTyping]         = useState(false);
  const [isStarting, setIsStarting]     = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const lastSentRef = useRef<number>(0); // timestamp du dernier msg client envoyé

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // ── Démarrage session ────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const existing = getSession(product.id);

      if (existing) {
        // Session existante : charger les messages depuis le début
        setSessionToken(existing.token);
        try {
          const data = await pollMessages(existing.token, 0);
          setMessages(data.messages);
          setConvStatus(data.conversation);
          const maxId = data.messages.length
            ? data.messages[data.messages.length - 1].id
            : 0;
          setLastId(maxId);
          updateLastId(product.id, maxId);
        } catch {
          // Session expirée ou invalide — repartir de zéro
          clearSession(product.id);
          await createNewSession();
        }
      } else {
        await createNewSession();
      }
      setIsStarting(false);
    }

    async function createNewSession() {
      const res = await startChat(product.id);
      setSessionToken(res.session_token);
      setAgent(res.agent);
      const welcomeMsg: Message = {
        id:         res.welcome_message.id,
        direction:  'outbound',
        content:    res.welcome_message.content,
        status:     'sent',
        type:       'text',
        created_at: res.welcome_message.created_at,
      };
      setMessages([welcomeMsg]);
      setLastId(welcomeMsg.id);
      saveSession(product.id, res.session_token, welcomeMsg.id);
    }

    init().catch(() => {
      setError('Impossible de démarrer la conversation. Veuillez réessayer.');
      setIsStarting(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // ── Polling toutes les 2 secondes ────────────────────────────────────────────
  useEffect(() => {
    if (!sessionToken || convStatus.status === 'confirmed') return;

    const poll = async () => {
      try {
        const data = await pollMessages(sessionToken, lastId);
        if (data.messages.length > 0) {
          setMessages((prev) => [...prev, ...data.messages]);
          const maxId = data.messages[data.messages.length - 1].id;
          setLastId(maxId);
          updateLastId(product.id, maxId);

          // Si l'agent a répondu, couper le typing indicator
          const hasAgentMsg = data.messages.some((m) => m.direction === 'outbound');
          if (hasAgentMsg) setIsTyping(false);
        }
        setConvStatus(data.conversation);
      } catch {
        // Erreur réseau silencieuse — réessaie au prochain tick
      }
    };

    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [sessionToken, lastId, convStatus.status, product.id]);

  // ── Afficher typing si l'agent ne répond pas depuis > 8s ────────────────────
  useEffect(() => {
    if (!isTyping) return;
    const timeout = setTimeout(() => setIsTyping(false), 30_000);
    return () => clearTimeout(timeout);
  }, [isTyping]);

  // ── Envoyer un message ───────────────────────────────────────────────────────
  const handleSend = useCallback(async (text: string) => {
    if (!sessionToken) return;

    // Message optimiste (affiché immédiatement)
    const tempId  = -(Date.now());
    const tempMsg: Message = {
      id:         tempId,
      direction:  'inbound',
      content:    text,
      status:     'sent',
      type:       'text',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    lastSentRef.current = Date.now();

    try {
      await sendMessage(sessionToken, text);
      if (convStatus.ai_active) setIsTyping(true);
    } catch {
      // Remplacer le message optimiste par une erreur
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, status: 'sent', content: m.content + ' ⚠️' } : m
        )
      );
    }
  }, [sessionToken, convStatus.ai_active]);

  // ── Rendu conditionnel ───────────────────────────────────────────────────────
  if (isStarting) {
    return (
      <div className="h-dvh flex items-center justify-center bg-[#e5ddd5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-neo border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Connexion en cours…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-dvh flex items-center justify-center bg-[#e5ddd5] p-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center max-w-sm">
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-neo text-white px-6 py-2 rounded-full font-medium hover:bg-neo-dark transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const isConfirmed = convStatus.status === 'confirmed' || convStatus.status === 'completed';
  const displayAgent = agent ?? { name: 'Agent Daymond', avatar_url: null, support_phone: null };

  return (
    <div className="h-dvh flex flex-col bg-[#e5ddd5] overflow-hidden">
      {/* Header sticky */}
      <AgentHeader
        agent={displayAgent}
        isOnline={convStatus.ai_active && !isConfirmed}
        aiActive={convStatus.ai_active}
      />

      {/* Carte produit */}
      <ProductCard product={product} />

      {/* Zone messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 chat-bg">
        {messages.map((msg, idx) => {
          const prev = messages[idx - 1];
          const showDate =
            !prev || !isSameDay(new Date(msg.created_at), new Date(prev.created_at));
          const showAvatar =
            msg.direction === 'outbound' &&
            (!prev || prev.direction !== 'outbound');

          return (
            <div key={msg.id}>
              {showDate && <DateSeparator label={dateLabel(msg.created_at)} />}
              <MessageBubble
                message={msg}
                agentName={displayAgent.name}
                agentAvatar={displayAgent.avatar_url}
                showAvatar={showAvatar}
              />
            </div>
          );
        })}

        {isTyping && <TypingIndicator />}

        {/* Bannière commande confirmée */}
        {isConfirmed && (
          <div className="flex justify-center my-4">
            <div className="bg-neo text-white text-sm px-5 py-3 rounded-2xl shadow-md flex items-center gap-2 max-w-xs text-center animate-slide-up">
              <ShoppingBag size={16} className="flex-shrink-0" />
              <span>Commande confirmée ! Notre équipe vous contactera très bientôt.</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Barre de saisie */}
      <MessageInput
        onSend={handleSend}
        disabled={isConfirmed}
        placeholder={
          !convStatus.ai_active
            ? 'Un conseiller va vous répondre…'
            : 'Écrire un message…'
        }
      />
    </div>
  );
}