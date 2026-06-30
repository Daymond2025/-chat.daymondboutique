'use client';

import { ShoppingBag } from 'lucide-react';
import type { ProductSuggestion } from '@/lib/types';

interface Props {
  suggestions: ProductSuggestion[];
  onSelect:    (name: string) => void;
}

export default function ProductSuggestions({ suggestions, onSelect }: Props) {
  if (!suggestions.length) return null;

  return (
    <div className="mt-2 mb-1 animate-slide-up">
      {/* Label */}
      <p className="text-[11px] text-gray-400 ml-9 mb-2 font-medium">
        Produits disponibles
      </p>

      {/* Scrollable cards row */}
      <div className="flex gap-3 overflow-x-auto pb-2 pl-9 pr-3 scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {suggestions.map((p) => {
          const displayPrice = p.sale_price ?? p.price;
          const hasPromo     = p.sale_price !== null;

          return (
            <div
              key={p.id}
              className="flex-shrink-0 w-36 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
            >
              {/* Image produit */}
              <div className="w-full h-24 bg-gray-50 flex-shrink-0 relative">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag size={28} className="text-gray-300" />
                  </div>
                )}
                {hasPromo && (
                  <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    PROMO
                  </span>
                )}
              </div>

              {/* Infos */}
              <div className="p-2 flex flex-col flex-1">
                <p className="text-[11px] font-semibold text-gray-900 line-clamp-2 leading-tight flex-1">
                  {p.name}
                </p>
                {p.brand && (
                  <p className="text-[10px] text-gray-400 mt-0.5">{p.brand}</p>
                )}
                <div className="mt-1.5">
                  <p className="text-neo font-bold text-xs leading-tight">{displayPrice}</p>
                  {hasPromo && (
                    <p className="text-gray-400 text-[10px] line-through leading-tight">{p.price}</p>
                  )}
                </div>

                <button
                  onClick={() => onSelect(p.name)}
                  className="mt-2 w-full bg-neo text-white text-[11px] font-bold py-1.5 rounded-xl hover:bg-neo-dark active:scale-95 transition-all"
                >
                  Commander
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
