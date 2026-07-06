'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  images: string[];
  alt: string;
  dotSize?: string;
  arrows?: boolean;
}

/** Galerie compacte à défilement horizontal (swipe + flèches) avec indicateurs,
 * pour les cartes produit dans le chat — évite de cacher les images multiples
 * derrière un tap. Utilise des <div role="button"> plutôt que <button> car ce
 * composant est parfois imbriqué dans un <button> parent (carte cliquable). */
export default function MiniGallery({ images, alt, dotSize = 'w-1 h-1', arrows = true }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [broken, setBroken] = useState<Set<number>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  const visible = images.filter((_, i) => !broken.has(i));
  if (visible.length === 0) return null;

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    setActiveIdx(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(idx: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const el = ref.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(idx, visible.length - 1));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
    setActiveIdx(clamped);
  }

  return (
    <>
      <div
        ref={ref}
        onScroll={onScroll}
        className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
      >
        {visible.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full h-full object-cover shrink-0 snap-center"
            onError={() => setBroken((s) => new Set(s).add(i))}
          />
        ))}
      </div>

      {arrows && visible.length > 1 && (
        <>
          {activeIdx > 0 && (
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => goTo(activeIdx - 1, e)}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={14} />
            </div>
          )}
          {activeIdx < visible.length - 1 && (
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => goTo(activeIdx + 1, e)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={14} />
            </div>
          )}
        </>
      )}

      {visible.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
          {visible.map((_, i) => (
            <span
              key={i}
              className={`${dotSize} rounded-full transition-colors ${i === activeIdx ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
