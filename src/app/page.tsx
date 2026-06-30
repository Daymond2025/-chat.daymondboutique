'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageSquare, Plus, ShoppingBag } from 'lucide-react';
import { getAllSessions } from '@/lib/session';
import type { ChatSession } from '@/lib/types';

function safeFormatDistance(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  try {
    return formatDistanceToNow(d, { addSuffix: true, locale: fr });
  } catch {
    return '';
  }
}

export default function ConversationListPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    setSessions(getAllSessions());
  }, []);

  return (
    <div className="h-dvh flex flex-col bg-white">

      {/* Header style WhatsApp */}
      <header className="bg-neo-header text-white px-4 pt-10 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Daymond</h1>
          <p className="text-xs text-neo-light opacity-80">Agent Commercial</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-neo flex items-center justify-center">
          <ShoppingBag size={18} className="text-white" />
        </div>
      </header>

      {/* Liste conversations */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
            <div className="w-20 h-20 rounded-full bg-neo-bg flex items-center justify-center">
              <MessageSquare size={36} className="text-neo" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Aucune conversation</p>
              <p className="text-sm text-gray-400 mt-1">
                Démarrez une discussion en cliquant sur le bouton ci-dessous.
              </p>
            </div>
          </div>
        ) : (
          sessions.map((s) => (
            <Link
              key={s.slug}
              href={`/p/${s.slug}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              {/* Avatar produit ou icône générique */}
              <div className="relative flex-shrink-0">
                {s.productImage ? (
                  <img
                    src={s.productImage}
                    alt={s.productName ?? 'Produit'}
                    className="w-12 h-12 rounded-full object-cover border border-gray-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-neo-bg flex items-center justify-center">
                    <ShoppingBag size={22} className="text-neo" />
                  </div>
                )}
              </div>

              {/* Infos conversation */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {s.productName ?? s.agentName ?? 'Daymond'}
                  </p>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {safeFormatDistance(s.lastMessageAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {s.agentName ? `Agent : ${s.agentName}` : 'Conversation en cours'}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* FAB — nouvelle conversation */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <Link
          href="/p/general"
          className="flex items-center justify-center gap-2 w-full bg-neo text-white font-semibold py-3.5 rounded-2xl shadow-md hover:bg-neo-dark active:scale-95 transition-all"
        >
          <Plus size={20} />
          Nouvelle conversation
        </Link>
      </div>
    </div>
  );
}
