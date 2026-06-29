import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';
import type { Message } from '@/lib/types';

interface Props {
  message: Message;
  agentName: string;
  agentAvatar: string | null;
  showAvatar: boolean; // premier msg d'une séquence agent
}

function formatContent(text: string) {
  // *gras* → <strong>
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
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

export default function MessageBubble({ message, agentName, agentAvatar, showAvatar }: Props) {
  const isOutbound = message.direction === 'outbound';
  const time = format(new Date(message.created_at), 'HH:mm', { locale: fr });

  const initials = agentName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (isOutbound) {
    // Bulle agent — gauche, blanche
    return (
      <div className="flex items-end gap-2 max-w-[80%] animate-slide-up">
        {/* Avatar agent */}
        <div className="w-7 h-7 flex-shrink-0 mb-0.5">
          {showAvatar ? (
            agentAvatar ? (
              <img
                src={agentAvatar}
                alt={agentName}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-neo flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-0.5">
          {showAvatar && (
            <span className="text-xs text-neo-dark font-semibold ml-1">{agentName}</span>
          )}
          <div className="relative bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm max-w-full">
            {/* Queue bulle */}
            {showAvatar && (
              <div className="absolute -left-1.5 top-0 w-3 h-3 bg-white clip-tail-left" />
            )}
            <p className="text-sm text-gray-800 leading-relaxed">
              {formatContent(message.content)}
            </p>
            <span className="text-[10px] text-gray-400 mt-1 block text-right">{time}</span>
          </div>
        </div>
      </div>
    );
  }

  // Bulle client — droite, neo green
  return (
    <div className="flex items-end gap-1 max-w-[80%] ml-auto animate-slide-up">
      <div className="relative bg-neo rounded-2xl rounded-tr-sm px-3 py-2 shadow-sm">
        {/* Queue bulle */}
        <div className="absolute -right-1.5 top-0 w-3 h-3 bg-neo clip-tail-right" />
        <p className="text-sm text-white leading-relaxed">
          {formatContent(message.content)}
        </p>
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