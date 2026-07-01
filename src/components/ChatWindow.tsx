'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isToday, isYesterday, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ShoppingBag } from 'lucide-react';

import AgentHeader       from './AgentHeader';
import ProductCard       from './ProductCard';
import MessageBubble     from './MessageBubble';
import DateSeparator     from './DateSeparator';
import MessageInput      from './MessageInput';
import TypingIndicator   from './TypingIndicator';
import QuickReplies      from './QuickReplies';
import ProductCatalog    from './ProductCatalog';
import OrderRecapCard      from './OrderRecapCard';
import CustomerInfoModal   from './CustomerInfoModal';
import ProductSuggestions  from './ProductSuggestions';

import { fetchCatalog, pollMessages, sendMessage, startChat, uploadFile } from '@/lib/api';
import type { CatalogProduct } from '@/lib/api';
import { clearSession, getSession, saveSession, updateLastId } from '@/lib/session';
import type { Agent, ConversationStatus, Message, OrderRecap, Product } from '@/lib/types';

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

// ── Recap persistance : encode base64 dans le contenu du message en DB ────────
function parseRecapB64(content: string): { text: string; recap: OrderRecap | null } {
  const match = content.match(/\[R64:([A-Za-z0-9+/=]+)\]/);
  if (!match) return { text: content, recap: null };
  try {
    const recap = JSON.parse(atob(match[1])) as OrderRecap;
    const text  = content.replace(/\n?\[R64:[A-Za-z0-9+/=]*\]/, '').trim();
    return { text, recap };
  } catch {
    return { text: content.replace(/\n?\[R64:[A-Za-z0-9+/=]*\]/, '').trim(), recap: null };
  }
}

export default function ChatWindow({ slug, initialProduct, initialAgent }: Props) {
  const [product]          = useState<Product | null>(initialProduct);
  const [agent, setAgent]  = useState<Agent | null>(initialAgent);

  const [messages, setMessages]             = useState<Message[]>([]);
  const [convStatus, setConvStatus]         = useState<ConversationStatus>({
    stage: 'greeting', status: 'active', ai_active: true,
  });
  const [sessionToken, setSessionToken]     = useState<string | null>(null);
  const [lastId, setLastId]                 = useState(0);
  const [isTyping, setIsTyping]             = useState(false);
  const [isStarting, setIsStarting]         = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [quickReplies, setQuickReplies]     = useState<string[]>([]);
  const [catalogOpen, setCatalogOpen]       = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [showInfoForm, setShowInfoForm]     = useState(false);

  const bottomRef       = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<string | null>(null);

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
        sessionTokenRef.current = existing.token;
        try {
          const data = await pollMessages(existing.token, 0);
          setMessages(data.messages);
          setConvStatus(data.conversation);
          const maxId = data.messages.length ? data.messages[data.messages.length - 1].id : 0;
          setLastId(maxId);
          // Met à jour lastMessageId + métadonnées produit/agent si disponibles (fix avatar liste)
          saveSession(slug, existing.token, maxId, {
            productName:  product?.name     ?? undefined,
            productImage: product?.image_url ?? undefined,
            agentName:    existing.agentName ?? initialAgent?.name ?? undefined,
          });
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
      sessionTokenRef.current = res.session_token;
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
      saveSession(slug, res.session_token, welcome.id, {
        productName:  product?.name ?? undefined,
        productImage: product?.image_url ?? undefined,
        agentName:    res.agent.name,
      });
    }

    init().catch(() => {
      setError('Impossible de démarrer la conversation. Veuillez réessayer.');
      setIsStarting(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // ── Polling 2s ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionToken) return;

    const poll = async () => {
      try {
        const data = await pollMessages(sessionToken, lastId);
        if (data.messages.length > 0) {
          setMessages((prev: Message[]) => {
            const existingIds = new Set(prev.filter(m => m.id > 0).map(m => m.id));
            const newMsgs = data.messages.filter(m => !existingIds.has(m.id));
            return newMsgs.length ? [...prev, ...newMsgs] : prev;
          });
          const maxId = data.messages[data.messages.length - 1].id;
          setLastId(maxId);
          updateLastId(slug, maxId);
          if (data.messages.some((m) => m.direction === 'outbound')) setIsTyping(false);
        }
        setConvStatus(data.conversation);
      } catch { /* silencieux */ }
    };

    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [sessionToken, lastId, slug]);

  // ── Envoi message texte ───────────────────────────────────────────────────────
  const handleSend = useCallback(async (text: string) => {
    if (!sessionToken) return;
    setQuickReplies([]);

    const tempId  = -(Date.now());
    const tempMsg: Message = {
      id: tempId, direction: 'inbound', content: text,
      status: 'sent', type: 'text', created_at: new Date().toISOString(),
    };
    setMessages((prev: Message[]) => [...prev, tempMsg]);

    if (convStatus.ai_active) setIsTyping(true);

    try {
      const result = await sendMessage(sessionToken, text);

      // Remplace tempMsg par le vrai id — ou le supprime si le polling l'a déjà ajouté
      setMessages((prev: Message[]) => {
        if (prev.some(m => m.id === result.id && m.id !== tempId)) {
          return prev.filter(m => m.id !== tempId);
        }
        return prev.map(m => m.id === tempId ? { ...m, id: result.id, status: 'delivered' } : m);
      });
      setLastId(result.id);

      if (result.agent_message) {
        const agentMsg: Message = {
          ...result.agent_message as Message,
          ...(result.order_recap         ? { order_recap:         result.order_recap }         : {}),
          ...(result.product_suggestions ? { product_suggestions: result.product_suggestions } : {}),
        };
        // Ajoute l'agent message seulement s'il n'a pas déjà été ajouté par le polling
        setMessages((prev: Message[]) => {
          if (prev.some(m => m.id === agentMsg.id)) return prev;
          return [...prev, agentMsg];
        });
        setLastId(agentMsg.id);
        updateLastId(slug, agentMsg.id);
        // Sauvegarde l'image produit dans la session dès que le recap est détecté
        if (result.order_recap?.product_image) {
          saveSession(slug, sessionToken, agentMsg.id, {
            productName:  result.order_recap.product_name ?? undefined,
            productImage: result.order_recap.product_image,
          });
        }
        setIsTyping(false);
        if (!result.order_recap && agentMsg.quick_replies?.length) {
          setQuickReplies(agentMsg.quick_replies);
        }
      }

      if (result.show_info_form) setShowInfoForm(true);
      if (result.show_catalog)  handleOpenCatalog();

    } catch {
      setMessages((prev: Message[]) =>
        prev.map((m: Message) =>
          m.id === tempId ? { ...m, content: m.content + ' (non envoyé)' } : m
        )
      );
      setIsTyping(false);
    }
  }, [sessionToken, convStatus.ai_active, slug]);

  // ── Sélection produit depuis le catalogue ─────────────────────────────────────
  const handleSelectProduct = useCallback((name: string) => {
    handleSend(`Je suis intéressé par le ${name}`);
  }, [handleSend]);

  // ── Ouvrir le catalogue ───────────────────────────────────────────────────────
  const handleOpenCatalog = useCallback(async () => {
    setCatalogOpen(true);
    if (catalogProducts.length > 0) return;
    const token = sessionTokenRef.current;
    if (!token) return;
    setCatalogLoading(true);
    try {
      const products = await fetchCatalog(token);
      setCatalogProducts(products);
    } catch { /* silencieux */ }
    finally { setCatalogLoading(false); }
  }, [catalogProducts.length]);

  // ── Envoi fichier / photo / vocal ────────────────────────────────────────────
  const handleUpload = useCallback(async (file: File | Blob, filename?: string) => {
    if (!sessionToken) return;
    setQuickReplies([]);

    if (convStatus.ai_active) setIsTyping(true);

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

      const newMsgs: Message[] = [mediaMsg];
      if (res.agent_message) {
        newMsgs.push(res.agent_message as Message);
      }

      setMessages((prev: Message[]) => {
        const existingIds = new Set(prev.filter(m => m.id > 0).map(m => m.id));
        return [...prev, ...newMsgs.filter(m => !existingIds.has(m.id))];
      });

      const maxId = newMsgs[newMsgs.length - 1].id;
      setLastId(maxId);
      updateLastId(slug, maxId);

      if ((res.agent_message as Message & { quick_replies?: string[] })?.quick_replies?.length) {
        setQuickReplies((res.agent_message as Message & { quick_replies?: string[] }).quick_replies ?? []);
      }
    } catch {
      const errMsg: Message = {
        id:         -(Date.now()),
        direction:  'inbound',
        content:    'Envoi du fichier échoué. Veuillez réessayer.',
        status:     'sent',
        type:       'text',
        created_at: new Date().toISOString(),
      };
      setMessages((prev: Message[]) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [sessionToken, slug, convStatus.ai_active]);

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

  const isConfirmed  = convStatus.status === 'confirmed' || convStatus.status === 'completed';
  const displayAgent = agent ?? { name: 'Agent Daymond', avatar_url: null, support_phone: null };

  return (
    <div className="h-dvh flex flex-col bg-[#e5ddd5] overflow-hidden">
      <AgentHeader
        agent={displayAgent}
        isOnline={convStatus.ai_active}
        aiActive={convStatus.ai_active}
        productImage={product?.image_url ?? null}
        onOpenCatalog={handleOpenCatalog}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 chat-bg">
        {/* Carte produit flottante en premier dans le chat (comme WhatsApp) */}
        {product && (
          <div className="flex justify-center mb-2">
            <ProductCard
              product={product}
              onOrder={(msg) => handleSend(msg)}
            />
          </div>
        )}

        {messages.map((msg: Message, idx: number) => {
          const prev       = messages[idx - 1];
          const showDate   = !prev || !isSameDay(new Date(msg.created_at), new Date(prev.created_at));
          const showAvatar = msg.direction === 'outbound' && (!prev || prev.direction !== 'outbound');

          // Détecte le recap depuis msg.order_recap (session courante) OU depuis le contenu (rechargement)
          const { text: cleanContent, recap: parsedRecap } = msg.direction === 'outbound'
            ? parseRecapB64(msg.content)
            : { text: msg.content, recap: null };
          const orderRecap = msg.order_recap ?? parsedRecap;

          if (orderRecap) {
            return (
              <div key={msg.id}>
                {showDate && <DateSeparator label={dateLabel(msg.created_at)} />}
                {cleanContent && (
                  <MessageBubble
                    message={{ ...msg, content: cleanContent }}
                    agentName={displayAgent.name}
                    agentAvatar={displayAgent.avatar_url}
                    showAvatar={showAvatar}
                  />
                )}
                <OrderRecapCard
                  recap={orderRecap}
                  isConfirmed={isConfirmed}
                  onConfirm={() => handleSend('JE CONFIRME ma commande')}
                  onModify={() => handleSend('Je souhaite modifier ma commande')}
                />
              </div>
            );
          }

          return (
            <div key={msg.id}>
              {showDate && <DateSeparator label={dateLabel(msg.created_at)} />}
              <MessageBubble
                message={msg}
                agentName={displayAgent.name}
                agentAvatar={displayAgent.avatar_url}
                showAvatar={showAvatar}
              />
              {/* Cartes produits suggérées inline sous le message agent */}
              {msg.product_suggestions && msg.product_suggestions.length > 0 && (
                <ProductSuggestions
                  suggestions={msg.product_suggestions}
                  onSelect={(name) => {
                    setQuickReplies([]);
                    handleSend(`Je suis intéressé par le ${name}`);
                  }}
                />
              )}
            </div>
          );
        })}

        {isTyping && <TypingIndicator />}

        {/* Banner commande confirmée — non bloquant, le chat reste ouvert */}
        {isConfirmed && (
          <div className="flex justify-center my-4">
            <div className="bg-neo text-white text-sm px-5 py-3 rounded-2xl shadow-md flex items-center gap-2 max-w-xs text-center animate-slide-up">
              <ShoppingBag size={16} className="flex-shrink-0" />
              <span>Commande confirmée. Notre équipe vous contactera très bientôt.</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Boutons de réponse rapide */}
      {quickReplies.length > 0 && (
        <QuickReplies
          replies={quickReplies}
          onSelect={(text) => {
            setQuickReplies([]);
            handleSend(text);
          }}
        />
      )}

      {/* Input — toujours actif même après confirmation */}
      <MessageInput
        onSendText={handleSend}
        onSendFile={handleUpload}
        disabled={false}
        placeholder={
          isConfirmed
            ? 'Poser une question sur votre commande…'
            : !convStatus.ai_active
            ? 'Un conseiller va vous répondre…'
            : 'Ecrire un message…'
        }
      />

      {/* Catalogue boutique */}
      {catalogOpen && (
        <ProductCatalog
          products={catalogProducts}
          loading={catalogLoading}
          onSelectProduct={handleSelectProduct}
          onClose={() => setCatalogOpen(false)}
        />
      )}

      {/* Modal collecte informations client */}
      {showInfoForm && (
        <CustomerInfoModal
          onSubmit={(msg) => { setShowInfoForm(false); handleSend(msg); }}
          onClose={() => setShowInfoForm(false)}
          agentName={displayAgent.name}
          agentAvatar={displayAgent.avatar_url}
        />
      )}
    </div>
  );
}
