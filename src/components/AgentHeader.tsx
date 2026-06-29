'use client';

import { Phone, MoreVertical } from 'lucide-react';
import type { Agent } from '@/lib/types';

interface Props {
  agent:    Agent;
  isOnline: boolean;
  aiActive: boolean;
}

export default function AgentHeader({ agent, isOnline, aiActive }: Props) {
  const initials     = agent.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const phoneNumber  = agent.support_phone ?? process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? null;

  return (
    <header className="bg-neo-darker text-white flex items-center gap-3 px-4 py-3 sticky top-0 z-20 shadow-md">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {agent.avatar_url ? (
          <img
            src={agent.avatar_url}
            alt={agent.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-neo-light"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neo flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
        )}
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-neo-darker ${
            isOnline ? 'bg-green-400' : 'bg-gray-400'
          }`}
        />
      </div>

      {/* Nom + statut */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight truncate">{agent.name}</p>
        <p className="text-xs text-neo-light leading-tight">
          {!aiActive ? 'Un conseiller va vous répondre…' : isOnline ? 'En ligne' : 'Agent Daymond'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Bouton appel — toujours visible */}
        <a
          href={phoneNumber ? `tel:${phoneNumber}` : undefined}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
            phoneNumber
              ? 'hover:bg-neo-dark cursor-pointer'
              : 'opacity-40 cursor-not-allowed'
          }`}
          title={phoneNumber ? `Appeler : ${phoneNumber}` : 'Numéro non configuré'}
          aria-disabled={!phoneNumber}
          onClick={(e) => { if (!phoneNumber) e.preventDefault(); }}
        >
          <Phone size={18} />
        </a>

        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neo-dark transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>
    </header>
  );
}