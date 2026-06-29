'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Tag } from 'lucide-react';
import type { Product } from '@/lib/types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white border-b border-neo-border shadow-sm">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-neo-bg transition-colors"
      >
        {/* Miniature produit */}
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-neo-border"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-neo-bg flex items-center justify-center flex-shrink-0">
            <Tag size={18} className="text-neo" />
          </div>
        )}

        <div className="flex-1 text-left min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">{product.name}</p>
          <p className="text-xs text-neo font-bold">
            {product.sale_price ?? product.price}
            {product.sale_price && (
              <span className="ml-1 text-gray-400 line-through font-normal text-xs">
                {product.price}
              </span>
            )}
          </p>
        </div>

        <span className="text-gray-400 flex-shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 flex gap-3 animate-slide-up">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-neo-border"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">{product.name}</p>
            {product.brand && (
              <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
            )}
            <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
            {product.sale_price && (
              <span className="inline-block mt-1 text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                Promo
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}