'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import type { Product, ProductSuggestion } from '@/lib/types';
import ProductDetailSheet from './ProductDetailSheet';

interface Props {
  suggestions: ProductSuggestion[];
  onOrder:     (msg: string) => void;
}

function toProduct(p: ProductSuggestion): Product {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    description: p.description ?? '',
    price: p.price,
    sale_price: p.sale_price,
    image_url: p.image_url,
    images: p.images?.length ? p.images : (p.image_url ? [p.image_url] : []),
    slug: p.slug,
    specs: p.specs ?? null,
  };
}

export default function ProductSuggestions({ suggestions, onOrder }: Props) {
  const [detail, setDetail] = useState<ProductSuggestion | null>(null);

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
            <button
              key={p.id}
              onClick={() => setDetail(p)}
              className="flex-shrink-0 w-36 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col text-left active:scale-[0.97] transition-transform"
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
                {(p.images?.length ?? 0) > 1 && (
                  <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                    +{(p.images!.length) - 1}
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

                <span className="mt-2 w-full bg-neo-bg text-neo-dark text-center text-[11px] font-bold py-1.5 rounded-xl">
                  Voir le produit
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {detail && (
        <ProductDetailSheet
          product={toProduct(detail)}
          onOrder={(msg) => { setDetail(null); onOrder(msg); }}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}
