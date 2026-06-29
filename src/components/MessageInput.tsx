'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Smile } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export default function MessageInput({ onSend, disabled, placeholder = 'Écrire un message…' }: Props) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return (
    <div className="bg-gray-100 border-t border-gray-200 px-3 py-2 flex items-end gap-2">
      {/* Emoji (décoratif — le clavier mobile gère les emojis) */}
      <button
        className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-gray-500 hover:text-neo transition-colors mb-0.5"
        tabIndex={-1}
        aria-label="Emojis"
      >
        <Smile size={22} />
      </button>

      {/* Zone de saisie */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 px-4 py-2 flex items-end shadow-sm">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          placeholder={disabled ? 'Conversation terminée' : placeholder}
          rows={1}
          className="w-full resize-none text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent leading-relaxed max-h-[120px]"
        />
      </div>

      {/* Bouton envoyer */}
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mb-0.5 transition-all shadow-md ${
          disabled || !text.trim()
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-neo hover:bg-neo-dark active:scale-95'
        }`}
        aria-label="Envoyer"
      >
        <Send size={18} className="text-white ml-0.5" />
      </button>
    </div>
  );
}