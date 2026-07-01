'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, CheckCheck, FileText, Download } from 'lucide-react';
import type { Message, MediaContent } from '@/lib/types';

function ImageWithFallback({ src, name }: { src: string; name?: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 text-neo-dark text-sm underline"
      >
        <FileText size={16} className="flex-shrink-0" />
        <span className="truncate max-w-[180px]">{name ?? 'Voir l\'image'}</span>
      </a>
    );
  }
  return (
    <img
      src={src}
      alt={name ?? 'Image'}
      className="rounded-xl max-w-full max-h-60 object-cover"
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

interface Props {
  message:     Message;
  agentName:   string;
  agentAvatar: string | null;
  showAvatar:  boolean;
}

// Résoudre les URLs relatives depuis le stockage backend
function resolveUrl(url: string): string {
  if (!url || url.startsWith('http')) return url;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api\/?$/, '');
  return base + url;
}

function parseContent(content: string): { isMedia: boolean; media?: MediaContent; text?: string } {
  try {
    const parsed = JSON.parse(content);
    if (parsed?.url) return { isMedia: true, media: parsed as MediaContent };
  } catch {}
  return { isMedia: false, text: content };
}

function formatText(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <strong key={i}>{part.slice(1, -1)}</strong>;
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

function guessTypeFromName(name?: string): 'image' | 'audio' | null {
  if (!name) return null;
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg','jpeg','png','gif','webp','bmp','svg'].includes(ext)) return 'image';
  if (['mp3','ogg','webm','wav','aac','m4a','opus'].includes(ext))  return 'audio';
  return null;
}

function MessageContent({ message, isInbound }: { message: Message; isInbound: boolean }) {
  const { isMedia, media, text } = parseContent(message.content);

  if (isMedia && media) {
    const src = resolveUrl(media.url);
    // Fallback : si le type stocké est 'file' mais que le nom de fichier dit image/audio
    const effectiveType = (message.type === 'file' || !message.type)
      ? (guessTypeFromName(media.name) ?? message.type)
      : message.type;

    if (effectiveType === 'image') {
      return (
        <ImageWithFallback src={src} name={media.name} />
      );
    }

    if (effectiveType === 'audio') {
      return (
        <div className="flex flex-col gap-1">
          <audio controls src={src} className="h-10 w-full min-w-[200px]" />
        </div>
      );
    }

    return (
      <a
        href={src}
        download={media.name}
        target="_blank"
        rel="noreferrer"
        className={`flex items-center gap-2 ${isInbound ? 'text-neo-darker' : 'text-neo-dark'}`}
      >
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isInbound ? 'bg-neo-border' : 'bg-neo-bg'}`}>
          <FileText size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium truncate max-w-[180px]">{media.name}</p>
          <p className="text-[10px] text-gray-400">
            {media.size ? `${(media.size / 1024).toFixed(0)} Ko` : 'Fichier'}
          </p>
        </div>
        <Download size={16} className="flex-shrink-0 opacity-70" />
      </a>
    );
  }

  return (
    <p className={`text-sm leading-relaxed ${isInbound ? 'text-neo-darker' : 'text-gray-800'}`}>
      {formatText(text ?? '')}
    </p>
  );
}

export default function MessageBubble({ message, agentName, agentAvatar, showAvatar }: Props) {
  const isOutbound = message.direction === 'outbound';
  const isInbound  = !isOutbound;
  const time       = format(new Date(message.created_at), 'HH:mm', { locale: fr });
  const initials   = agentName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  // ── Bulle agent — gauche, blanche ───────────────────────────────────────────
  if (isOutbound) {
    return (
      <div className="flex items-end gap-2 max-w-[80%] animate-slide-up">
        <div className="w-7 h-7 flex-shrink-0 mb-0.5">
          {showAvatar && (
            agentAvatar ? (
              <img src={agentAvatar} alt={agentName} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-neo flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )
          )}
        </div>

        <div className="flex flex-col items-start gap-0.5">
          {showAvatar && (
            <span className="text-xs text-neo-dark font-semibold ml-1">{agentName}</span>
          )}
          <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm max-w-full">
            <MessageContent message={message} isInbound={false} />
            <span className="text-[10px] text-gray-400 mt-1 block text-right">{time}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Bulle client — droite, vert clair style WhatsApp ────────────────────────
  return (
    <div className="flex items-end gap-1 max-w-[80%] ml-auto animate-slide-up">
      <div className="bg-neo-bg border border-neo-border rounded-2xl rounded-tr-sm px-3 py-2 shadow-sm">
        <MessageContent message={message} isInbound={true} />
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-neo-dark opacity-60">{time}</span>
          {message.status === 'delivered' || message.status === 'read' ? (
            <CheckCheck size={12} className="text-neo-dark opacity-60" />
          ) : (
            <Check size={12} className="text-neo-dark opacity-40" />
          )}
        </div>
      </div>
    </div>
  );
}
