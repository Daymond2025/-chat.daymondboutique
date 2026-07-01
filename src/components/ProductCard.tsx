'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
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
      {/* Card bubble flottante — style WhatsApp "produit partagé" */}
      <button
        onClick={() => setShowDetail(true)}
        className="w-[88%] bg-white rounded-2xl shadow-md overflow-hidden text-left active:scale-[0.98] transition-transform border border-gray-100"
      >
        <div className="flex items-stretch">
          {/* Image carrée à gauche */}
          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 relative">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag size={24} className="text-gray-300" />
              </div>
            )}
            {hasPromo && (
              <span className="absolute top-1 left-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                PROMO
              </span>
            )}
          </div>

          {/* Infos à droite */}
          <div className="flex-1 px-3 py-2.5 min-w-0 flex flex-col justify-center">
            <p className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-snug">
              {product.name}
            </p>
            {product.brand && (
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">{product.brand}</p>
            )}
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[15px] font-extrabold text-gray-900">{displayPrice}</span>
              {hasPromo && (
                <span className="text-[11px] text-gray-400 line-through">{product.price}</span>
              )}
            </div>
          </div>
        </div>

        {/* Pied de carte */}
        <div className="border-t border-gray-100 px-3 py-1.5 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">Appuyez pour voir les détails</span>
          <span className="text-[11px] text-neo font-semibold">Voir ›</span>
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
