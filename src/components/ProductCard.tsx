'use client';

import { useState } from 'react';
import { ShoppingBag, Tag } from 'lucide-react';
import type { Product } from '@/lib/types';
import ProductDetailSheet from './ProductDetailSheet';

interface Props {
  product: Product;
  onOrder: (msg: string) => void;
}

export default function ProductCard({ product, onOrder }: Props) {
  const [showDetail, setShowDetail] = useState(false);

  const displayPrice = product.sale_price ?? product.price;
  const hasPromo     = product.sale_price !== null;

  return (
    <>
      {/* Carte compacte style WhatsApp */}
      <button
        onClick={() => setShowDetail(true)}
        className="w-full bg-white border-b border-gray-200 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3 px-4 py-3">

          {/* Miniature produit */}
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 bg-gray-100 relative">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag size={20} className="text-gray-300" />
              </div>
            )}
            {hasPromo && (
              <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">
                PROMO
              </span>
            )}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 truncate leading-snug">
              {product.name}
            </p>
            {product.brand && (
              <p className="text-[11px] text-gray-400 truncate">{product.brand}</p>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[13px] font-bold text-neo">{displayPrice}</span>
              {hasPromo && (
                <span className="text-[11px] text-gray-400 line-through">{product.price}</span>
              )}
            </div>
          </div>

          {/* Indicateur tap */}
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <Tag size={13} className="text-neo opacity-60" />
            <span className="text-[10px] text-gray-400">Détails</span>
          </div>
        </div>
      </button>

      {/* Fiche produit complète */}
      {showDetail && (
        <ProductDetailSheet
          product={product}
          onOrder={(msg) => { setShowDetail(false); onOrder(msg); }}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
