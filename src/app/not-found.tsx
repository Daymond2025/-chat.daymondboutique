import { MessageCircleOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-[#e5ddd5] p-6 text-center">
      <div className="bg-white rounded-3xl p-8 shadow-lg max-w-sm w-full">
        <div className="w-16 h-16 bg-neo-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircleOff size={28} className="text-neo" />
        </div>
        <h1 className="text-lg font-bold text-gray-800 mb-2">Produit introuvable</h1>
        <p className="text-sm text-gray-500">
          Ce lien n'est plus disponible. Consultez nos publications Facebook pour trouver nos offres actuelles.
        </p>
      </div>
    </div>
  );
}