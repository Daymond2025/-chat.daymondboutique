'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isToday, isYesterday, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ShoppingBag } from 'lucide-react';

import AgentHeader     from './AgentHeader';
import ProductCard     from './ProductCard';
import MessageBubble   from './MessageBubble';
import DateSeparator   from './DateSeparator';
import MessageInput    from './MessageInput';
import TypingIndicator from './TypingIndicator';

import { pollMessages, sendMessage, startChat, uploadFile } from '@/lib/api';
import { clearSession, getSession, saveSession, updateLastId } from '@/lib/session';
import type { Agent, ConversationStatus, Message, Product } from '@/lib/types';

interface Props {
  slug:           string;
  initialProduct: Product | null;
  initialAgent:   Agent | null;
}

function dateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d))     return "Aujourd'hui";
  if (isYesterday(d)) return 'Hier';
  return format(d, 'd MMMM yyyy', { locale: fr });
}

export default function ChatWindow({ slug, initialProduct, initialAgent }: Props) {
  const [product]    = useState<Product | null>(initialProduct);
  const [agent, setAgent] = useState<Agent | null>(initialAgent);

  const [messages, setMessages]       = useState<Message[]>([]);
  const [convStatus, setConvStatus]   = useState<ConversationStatus>({
    stage: 'greeting', status: 'active', ai_active: true,
  });
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [lastId, setLastId]             = useState(0);
  const [isTyping, setIsTyping]         = useState(false);
  const [isStarting, setIsStarting]     = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Scroll bas ───────────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  // ── Init session ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const existing = getSession(slug);

      if (existing) {
        setSessionToken(existing.token);
        try {
          const data = await pollMessages(existing.token, 0);
          setMessages(data.messages);
          setConvStatus(data.conversation);
          const maxId = data.messages.length ? data.messages[data.messages.length - 1].id : 0;
          setLastId(maxId);
          updateLastId(slug, maxId);
        } catch {
          clearSession(slug);
          await createNewSession();
        }
      } else {
        await createNewSession();
      }
      setIsStarting(false);
    }

    async function createNewSession() {
      const res = await startChat(product?.id ?? null);
      setSessionToken(res.session_token);
      setAgent(res.agent);
      const welcome: Message = {
        id:         res.welcome_message.id,
        direction:  'outbound',
        content:    res.welcome_message.content,
        status:     'sent',
        type:       'text',
        created_at: res.welcome_message.created_at,
      };
      setMessages([welcome]);
      setLastId(welcome.id);
      saveSession(slug, res.session_token, welcome.id);
    }

    init().catch(() => {
      setError('Impossible de démarrer la conversation. Veuillez réessayer.');
      setIsStarting(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // ── Polling 2s (pour multi-onglets et relances coordinateur) ─────────────────
  useEffect(() => {
    if (!sessionToken || convStatus.status === 'confirmed') return;

    const poll = async () => {
      try {
        const data = await pollMessages(sessionToken, lastId);
        if (data.messages.length > 0) {
          setMessages((prev: Message[]) => [...prev, ...data.messages]);
          const maxId = data.messages[data.messages.length - 1].id;
          setLastId(maxId);
          updateLastId(slug, maxId);
          const hasAgent = data.messages.some((m) => m.direction === 'outbound');
          if (hasAgent) setIsTyping(false);
        }
        setConvStatus(data.conversation);
      } catch { /* silencieux */ }
    };

    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [sessionToken, lastId, convStatus.status, slug]);

  // ── Envoi message texte — réponse IA retournée directement ───────────────────
  const handleSend = useCallback(async (text: string) => {
    if (!sessionToken) return;

    const tempId  = -(Date.now());
    const tempMsg: Message = {
      id: tempId, direction: 'inbound', content: text,
      status: 'sent', type: 'text', created_at: new Date().toISOString(),
    };
    setMessages((prev: Message[]) => [...prev, tempMsg]);

    if (convStatus.ai_active) setIsTyping(true);

    try {
      const result = await sendMessage(sessionToken, text);

      // Remplacer le message optimiste par le vrai ID
      setMessages((prev: Message[]) =>
        prev.map((m: Message) => m.id === tempId ? { ...m, id: result.id, status: 'delivered' } : m)
      );
      setLastId(result.id);

      // Ajouter la réponse IA immédiatement (pas d'attente polling)
      if (result.agent_message) {
        setMessages((prev: Message[]) => [...prev, result.agent_message as Message]);
        setLastId(result.agent_message.id);
        updateLastId(slug, result.agent_message.id);
        setIsTyping(false);
      }

    } catch {
      setMessages((prev: Message[]) =>
        prev.map((m: Message) =>
          m.id === tempId ? { ...m, content: m.content + ' ⚠️' } : m
        )
      );
      setIsTyping(false);
    }
  }, [sessionToken, convStatus.ai_active, slug]);

  // ── Envoi fichier / photo / vocal ────────────────────────────────────────────
  const handleUpload = useCallback(async (file: File | Blob, filename?: string) => {
    if (!sessionToken) return;

    try {
      const res = await uploadFile(sessionToken, file, filename);

      const mediaMsg: Message = {
        id:         res.id,
        direction:  'inbound',
        content:    JSON.stringify({ url: res.url, name: res.name }),
        status:     'delivered',
        type:       res.type,
        created_at: res.created_at,
      };
      setMessages((prev: Message[]) => [...prev, mediaMsg]);
      setLastId(res.id);
      updateLastId(slug, res.id);
    } catch {
      // Afficher un message d'erreur inline discret
      const errMsg: Message = {
        id:         -(Date.now()),
        direction:  'inbound',
        content:    '⚠️ Envoi du fichier échoué. Réessayez.',
        status:     'sent',
        type:       'text',
        created_at: new Date().toISOString(),
      };
      setMessages((prev: Message[]) => [...prev, errMsg]);
    }
  }, [sessionToken, slug]);

  // ── Rendu ─────────────────────────────────────────────────────────────────────
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

  const isConfirmed    = convStatus.status === 'confirmed' || convStatus.status === 'completed';
  const displayAgent   = agent ?? { name: 'Agent Daymond', avatar_url: null, support_phone: null };

  return (
    <div className="h-dvh flex flex-col bg-[#e5ddd5] overflow-hidden">
      <AgentHeader
        agent={displayAgent}
        isOnline={convStatus.ai_active && !isConfirmed}
        aiActive={convStatus.ai_active}
      />

      {product && <ProductCard product={product} />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 chat-bg">
        {messages.map((msg: Message, idx: number) => {
          const prev       = messages[idx - 1];
          const showDate   = !prev || !isSameDay(new Date(msg.created_at), new Date(prev.created_at));
          const showAvatar = msg.direction === 'outbound' && (!prev || prev.direction !== 'outbound');

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

        {isConfirmed && (
          <div className="flex justify-center my-4">
            <div className="bg-neo text-white text-sm px-5 py-3 rounded-2xl shadow-md flex items-center gap-2 max-w-xs text-center animate-slide-up">
              <ShoppingBag size={16} className="flex-shrink-0" />
              <span>Commande confirmée ! Notre équipe vous contactera très bientôt 🎉</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <MessageInput
        onSendText={handleSend}
        onSendFile={handleUpload}
        disabled={isConfirmed}
        placeholder={!convStatus.ai_active ? 'Un conseiller va vous répondre…' : 'Écrire un message…'}
      />
    </div>
  );
}