'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MoreVertical } from 'lucide-react';
import type { Agent } from '@/lib/types';

function ShopIcon({ size = 19, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Toit / barre du haut */}
      <line x1="2" y1="5" x2="22" y2="5" />
      {/* Auvent festonné (3 arches) */}
      <path d="M2 5 Q4 9.5 6.5 5 Q9 9.5 11.5 5 Q14 9.5 16.5 5 Q19 9.5 22 5" />
      {/* Mur gauche */}
      <line x1="2" y1="9.5" x2="2" y2="22" />
      {/* Mur droit */}
      <line x1="22" y1="9.5" x2="22" y2="22" />
      {/* Sol */}
      <line x1="2" y1="22" x2="22" y2="22" />
      {/* Vitrine gauche */}
      <rect x="3.5" y="13" width="8.5" height="5.5" rx="1" />
      {/* Porte droite */}
      <path d="M14.5 22 V14 Q14.5 13 15.5 13 H20.5 Q21.5 13 21.5 14 V22" />
    </svg>
  );
}

interface Props {
  agent:          Agent;
  isOnline:       boolean;
  aiActive:       boolean;
  productImage?:  string | null;
  onOpenCatalog:  () => void;
}

export default function AgentHeader({ agent, isOnline, aiActive, productImage, onOpenCatalog }: Props) {
  const router      = useRouter();
  const initials    = agent.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const phoneNumber = agent.support_phone ?? process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? null;
  const avatarSrc   = productImage ?? agent.avatar_url ?? null;

  return (
    <header className="bg-white text-gray-900 flex items-center gap-2 px-2 py-2.5 sticky top-0 z-20 shadow-sm border-b border-gray-100">

      {/* Bouton retour */}
      <button
        onClick={() => router.push('/')}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
        aria-label="Retour"
      >
        <ArrowLeft size={22} className="text-gray-700" />
      </button>

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={agent.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neo flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
        )}
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-400' : 'bg-gray-300'
          }`}
        />
      </div>

      {/* Nom + statut */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight truncate text-gray-900">{agent.name}</p>
        <p className="text-xs leading-tight text-neo font-medium">
          {!aiActive ? 'Un conseiller va vous répondre…' : isOnline ? 'En ligne' : 'Agent Daymond'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onOpenCatalog}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          title="Voir le catalogue"
        >
          <ShopIcon size={19} className="text-gray-600" />
        </button>

        <a
          href={phoneNumber ? `tel:${phoneNumber}` : undefined}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
            phoneNumber ? 'hover:bg-gray-100 cursor-pointer' : 'opacity-30 cursor-not-allowed'
          }`}
          title={phoneNumber ? `Appeler : ${phoneNumber}` : 'Numéro non configuré'}
          aria-disabled={!phoneNumber}
          onClick={(e) => { if (!phoneNumber) e.preventDefault(); }}
        >
          <Phone size={19} className="text-gray-600" />
        </a>

        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <MoreVertical size={19} className="text-gray-600" />
        </button>
      </div>
    </header>
  );
}
