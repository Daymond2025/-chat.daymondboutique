'use client';

import { X, ShoppingBag, Package } from 'lucide-react';
import type { CatalogProduct } from '@/lib/api';

interface Props {
  products:        CatalogProduct[];
  loading:         boolean;
  onSelectProduct: (name: string) => void;
  onClose:         () => void;
}

const fmt = (n: string | null) =>
  n ? new Intl.NumberFormat('fr-CI').format(Number(n.replace(/\s/g, '').replace(',', '.'))) : null;

export default function ProductCatalog({ products, loading, onSelectProduct, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* Handle + titre */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-neo" />
            <h2 className="font-bold text-gray-900 text-base">Catalogue Daymond</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-neo border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Package size={36} className="text-gray-300" />
              <p className="text-sm text-gray-400">Aucun produit disponible</p>
            </div>
          ) : (
            products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-100"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden bg-white border border-gray-100">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={24} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                  {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    {p.sale_price ? (
                      <>
                        <span className="text-neo font-bold text-sm">{p.sale_price}</span>
                        <span className="text-xs text-gray-400 line-through">{p.price}</span>
                      </>
                    ) : (
                      <span className="text-neo font-bold text-sm">{p.price}</span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => { onSelectProduct(p.name); onClose(); }}
                  className="flex-shrink-0 bg-neo text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-neo-dark active:scale-95 transition-all"
                >
                  Commander
                </button>
              </div>
            ))
          )}
        </div>

        <div className="h-4 flex-shrink-0" />
      </div>
    </div>
  );
}
