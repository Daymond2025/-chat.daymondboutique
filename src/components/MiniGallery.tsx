'use client';

import { useRef, useState } from 'react';

interface Props {
  images: string[];
  alt: string;
  dotSize?: string;
}

/** Galerie compacte à défilement horizontal (swipe) avec indicateurs, pour les
 * cartes produit dans le chat — évite de cacher les images multiples derrière un tap. */
export default function MiniGallery({ images, alt, dotSize = 'w-1 h-1' }: Props) {
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
