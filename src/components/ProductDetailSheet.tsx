'use client';

import { X, MessageCircle, ShoppingBag, Tag } from 'lucide-react';
import type { Product } from '@/lib/types';
import MiniGallery from './MiniGallery';

interface Props {
  product: Product;
  onOrder: (msg: string) => void;
  onClose: () => void;
}

export default function ProductDetailSheet({ product, onOrder, onClose }: Props) {
  const images = product.images?.length ? product.images : (product.image_url ? [product.image_url] : []);

  const displayPrice = product.sale_price ?? product.price;
  const hasPromo     = product.sale_price !== null;

  const specs = product.specs
    ? Object.entries(product.specs).filter(([, v]) => v)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Fond semi-transparent */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl max-h-[92dvh] flex flex-col overflow-hidden animate-slide-up">

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm"
        >
          <X size={16} className="text-white" />
        </button>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto flex-1">

          {/* Galerie d'images */}
          <div className="w-full bg-gray-100 relative" style={{ aspectRatio: '4/3' }}>
            {images.length > 0 ? (
              <MiniGallery images={images} alt={product.name} dotSize="w-1.5 h-1.5" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag size={48} className="text-gray-300" />
              </div>
            )}

            {hasPromo && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Tag size={10} /> PROMO
              </span>
            )}
          </div>

          {/* Infos produit */}
          <div className="px-5 pt-5 pb-4">
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{product.name}</h2>
            {product.brand && (
              <p className="text-sm text-gray-500 mt-0.5">{product.brand}</p>
            )}

            {/* Prix */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl font-extrabold text-neo">{displayPrice}</span>
              {hasPromo && (
                <span className="text-base text-gray-400 line-through">{product.price}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{product.description}</p>
            )}

            {/* Spécifications */}
            {specs.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {specs.map(([k, v]) => (
                  <span key={k} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-lg">
                    {k}: {v}
                  </span>
                ))}
              </div>
            )}

            {/* Livraison */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Livraison express
              </p>
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>Abidjan</span>
                <span className="font-semibold">1 000 FCFA</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-700 mt-1">
                <span>Hors Abidjan</span>
                <span className="font-semibold">3 000 FCFA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer : bouton commande */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3 bg-white shrink-0">
          <button
            onClick={() => onOrder(`Je veux commander le ${product.name}`)}
            className="flex-1 bg-neo text-white font-bold text-sm py-4 rounded-2xl hover:bg-neo-dark active:scale-95 transition-all shadow-lg shadow-neo/30"
          >
            JE VEUX PASSER LA COMMANDE
          </button>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-neo/10 flex items-center justify-center flex-shrink-0"
          >
            <MessageCircle size={20} className="text-neo" />
          </button>
        </div>
      </div>
    </div>
  );
}
