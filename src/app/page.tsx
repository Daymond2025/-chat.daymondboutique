'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageSquare, MessageSquarePlus, Search, MoreVertical } from 'lucide-react';
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

const AVATAR_COLORS = [
  'bg-neo',
  'bg-emerald-600',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-blue-600',
  'bg-violet-600',
];

function avatarColor(name?: string): string {
  const idx = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function ConversationListPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    setSessions(getAllSessions());
  }, []);

  return (
    <div className="h-dvh flex flex-col bg-white">

      {/* Header style WhatsApp blanc */}
      <header className="bg-white px-4 pt-10 pb-3 flex items-center justify-between border-b border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neo">Daymond</h1>
          <p className="text-xs text-gray-500">Agent Commercial</p>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <Search size={19} className="text-gray-600" />
          </button>
          <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <MoreVertical size={19} className="text-gray-600" />
          </button>
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
              {/* Avatar produit (image) ou initiale colorée */}
              <div className="flex-shrink-0">
                {s.productImage ? (
                  <img
                    src={s.productImage}
                    alt={s.productName ?? 'Produit'}
                    className="w-12 h-12 rounded-full object-cover border border-gray-100"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${avatarColor(s.productName ?? s.agentName)}`}>
                    {(s.productName ?? s.agentName ?? 'D').charAt(0).toUpperCase()}
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

      {/* FAB circulaire style WhatsApp */}
      <div className="fixed bottom-6 right-5 z-10">
        <Link
          href="/p/general"
          className="w-14 h-14 bg-neo text-white rounded-full flex items-center justify-center shadow-xl hover:bg-neo-dark active:scale-95 transition-all"
          aria-label="Nouvelle conversation"
        >
          <MessageSquarePlus size={26} />
        </Link>
      </div>
    </div>
  );
}
