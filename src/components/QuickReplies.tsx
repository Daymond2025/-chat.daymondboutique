'use client';

interface Props {
  replies:  string[];
  onSelect: (text: string) => void;
}

export default function QuickReplies({ replies, onSelect }: Props) {
  if (!replies.length) return null;

  return (
    <div className="flex flex-wrap gap-2 px-3 pb-2 justify-end animate-slide-up">
      {replies.map((reply, i) => (
        <button
          key={i}
          onClick={() => onSelect(reply)}
          className="
            bg-white border border-neo text-neo-dark text-sm font-medium
            px-4 py-1.5 rounded-full shadow-sm
            hover:bg-neo hover:text-white active:scale-95
            transition-all duration-150 whitespace-nowrap
          "
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
