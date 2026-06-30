'use client';

import { User, Gift } from 'lucide-react';
import type { OrderRecap } from '@/lib/types';

interface Props {
  recap:       OrderRecap;
  isConfirmed: boolean;
  onConfirm:   () => void;
  onModify:    () => void;
}

function fmtNum(n: number, currency = 'FCFA') {
  return n.toLocaleString('fr-FR') + ' ' + currency;
}

export default function OrderRecapCard({ recap, isConfirmed, onConfirm, onModify }: Props) {
  const infoRows = [
    { label: 'Nom pour la facture',        value: recap.customer_name },
    { label: 'Lieu de livraison',          value: recap.delivery_address },
    { label: 'Numéro de téléphone',        value: recap.phone },
    { label: 'Date et heure de livraison', value: recap.delivery_date ?? "Aujourd'hui, dans l'immédiat" },
  ];

  const priceRows = [
    { label: 'Prix du produit',    value: recap.price },
    { label: 'Frais de livraison', value: fmtNum(recap.delivery_fee, recap.currency) },
    { label: 'TVA',                value: fmtNum(recap.tva, recap.currency) },
    { label: 'Remise',             value: fmtNum(recap.remise, recap.currency) },
  ];

  return (
    <div className="w-full max-w-xs mx-auto my-3 animate-slide-up">

      {/* Card principale */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">

        {/* Header sombre */}
        <div className="bg-gray-900 px-4 py-3 text-center">
          <p className="text-white font-bold text-xs tracking-widest uppercase">
            Récapitulation de votre commande
          </p>
        </div>

        {/* Corps blanc */}
        <div className="bg-white px-4 pt-4 pb-4 space-y-4">

          {/* Produit */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
            {recap.product_image ? (
              <img
                src={recap.product_image}
                alt={recap.product_name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-neo-bg flex items-center justify-center flex-shrink-0 text-2xl">
                📦
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                {recap.product_name}
              </p>
              <p className="text-neo font-bold text-base mt-1">{recap.price}</p>
            </div>
          </div>

          {/* Infos client */}
          <div className="divide-y divide-gray-100">
            {infoRows.map((row, i) => (
              <div key={i} className="flex items-start gap-2 py-2.5">
                <User size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-500 text-[11px] flex-shrink-0 w-[100px] leading-tight">
                  {row.label}
                </span>
                <span className="text-gray-900 text-[11px] font-bold text-right flex-1 leading-tight">
                  {row.value || '—'}
                </span>
              </div>
            ))}
          </div>

          {/* Tableau des prix */}
          <div className="bg-gray-50 rounded-xl px-3 py-3 space-y-2 border border-gray-100">
            {priceRows.map((row, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">{row.label}</span>
                <span className="text-gray-800 text-xs font-semibold">{row.value}</span>
              </div>
            ))}
            <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900">Total à payer</span>
              <span className="text-sm font-bold text-neo">{recap.total}</span>
            </div>
          </div>

          {/* Bonus */}
          {recap.bonuses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-800">Les bonus Offert</span>
                <Gift size={15} className="text-neo" />
              </div>
              <div className="flex flex-wrap gap-2">
                {recap.bonuses.map((bonus, i) => (
                  <span
                    key={i}
                    className="bg-neo text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    {bonus}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Boutons action */}
      {!isConfirmed && (
        <div className="flex gap-3 mt-3 px-1">
          <button
            onClick={onModify}
            className="flex-1 py-3 rounded-full border-2 border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all"
          >
            Modifier
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-full bg-neo text-white font-bold text-sm hover:bg-neo-dark active:scale-95 transition-all shadow-md uppercase tracking-wide"
          >
            Je Confirme
          </button>
        </div>
      )}
    </div>
  );
}
