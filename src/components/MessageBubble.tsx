import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, CheckCheck, FileText, Download } from 'lucide-react';
import type { Message, MediaContent } from '@/lib/types';

interface Props {
  message:     Message;
  agentName:   string;
  agentAvatar: string | null;
  showAvatar:  boolean;
}

// Parse le contenu : JSON pour les médias, texte brut sinon
function parseContent(content: string): { isMedia: boolean; media?: MediaContent; text?: string } {
  try {
    const parsed = JSON.parse(content);
    if (parsed?.url) return { isMedia: true, media: parsed as MediaContent };
  } catch {}
  return { isMedia: false, text: content };
}

// Formatage texte : *gras* et retours à la ligne
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

// Contenu selon le type de message
function MessageContent({ message, isOutbound }: { message: Message; isOutbound: boolean }) {
  const { isMedia, media, text } = parseContent(message.content);
  const textColor = isOutbound ? 'text-white' : 'text-gray-800';

  if (isMedia && media) {
    if (message.type === 'image') {
      return (
        <img
          src={media.url}
          alt={media.name ?? 'Image'}
          className="rounded-xl max-w-full max-h-60 object-cover"
          loading="lazy"
        />
      );
    }

    if (message.type === 'audio') {
      return (
        <div className="flex flex-col gap-1">
          <audio controls src={media.url} className="h-10 w-full min-w-[200px]" />
        </div>
      );
    }

    // Fichier générique
    return (
      <a
        href={media.url}
        download={media.name}
        target="_blank"
        rel="noreferrer"
        className={`flex items-center gap-2 ${isOutbound ? 'text-white' : 'text-neo-dark'}`}
      >
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isOutbound ? 'bg-white/20' : 'bg-neo-bg'}`}>
          <FileText size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium truncate max-w-[180px]">{media.name}</p>
          <p className={`text-[10px] ${isOutbound ? 'text-neo-bg' : 'text-gray-400'}`}>
            {media.size ? `${(media.size / 1024).toFixed(0)} Ko` : 'Fichier'}
          </p>
        </div>
        <Download size={16} className="flex-shrink-0 opacity-70" />
      </a>
    );
  }

  return (
    <p className={`text-sm leading-relaxed ${textColor}`}>
      {formatText(text ?? '')}
    </p>
  );
}

export default function MessageBubble({ message, agentName, agentAvatar, showAvatar }: Props) {
  const isOutbound = message.direction === 'outbound';
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
            <MessageContent message={message} isOutbound={false} />
            <span className="text-[10px] text-gray-400 mt-1 block text-right">{time}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Bulle client — droite, neo green ────────────────────────────────────────
  return (
    <div className="flex items-end gap-1 max-w-[80%] ml-auto animate-slide-up">
      <div className="bg-neo rounded-2xl rounded-tr-sm px-3 py-2 shadow-sm">
        <MessageContent message={message} isOutbound={true} />
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-neo-bg">{time}</span>
          {message.status === 'delivered' || message.status === 'read' ? (
            <CheckCheck size={12} className="text-neo-bg" />
          ) : (
            <Check size={12} className="text-neo-bg opacity-70" />
          )}
        </div>
      </div>
    </div>
  );
}