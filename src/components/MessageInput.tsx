'use client';

import { useRef, useState, KeyboardEvent } from 'react';
import { Send, Mic, Paperclip, Camera, FileText, X, Smile } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';

const EMOJI_CATEGORIES = [
  { label: '😊', emojis: ['😀','😁','😂','🤣','😊','😍','🥰','😘','😎','🤩','🥺','😅','😭','😤','🤔','😴','🤯','😇','🤗','😬','😏','😒','🙄','😡','🤬','😱','😨','🤫','🤭','😶'] },
  { label: '👍', emojis: ['👍','👎','👋','🤝','🙏','👏','💪','✌️','🤜','🤛','🫶','☝️','🤞','🤟','🤙','💅','🫵','👊','✊','🫱'] },
  { label: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💕','💖','💗','💓','💞','💘','❣️','💔','💝','♥️','🫀'] },
  { label: '🎉', emojis: ['🎉','🎊','🎁','🎂','🎈','🏆','🥇','⭐','🌟','✨','🔥','💫','🎯','🎶','🎵','🎤','🎸','🎮','🎲','🎀'] },
  { label: '💰', emojis: ['💰','💸','💵','💳','🛒','📦','🚚','🏪','🛍️','💻','📱','🖥️','⌨️','🖨️','📧','📞','☎️','✅','❌','💯'] },
  { label: '🌸', emojis: ['🌸','🌺','🌻','🌹','🍀','🌈','☀️','🌙','⭐','🌊','🦁','🐯','🐶','🦋','🌴','🍎','🍊','🍋','🍇','🍓'] },
];

interface Props {
  onSendText:  (message: string) => void;
  onSendFile:  (file: File | Blob, filename?: string) => void;
  disabled:    boolean;
  placeholder?: string;
}

export default function MessageInput({ onSendText, onSendFile, disabled, placeholder }: Props) {
  const [text, setText]                   = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showVoice, setShowVoice]         = useState(false);
  const [showEmoji, setShowEmoji]         = useState(false);
  const [emojiTab, setEmojiTab]           = useState(0);
  const [preview, setPreview]             = useState<{ url: string; file: File } | null>(null);

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const fileRef      = useRef<HTMLInputElement>(null);
  const cameraRef    = useRef<HTMLInputElement>(null);
  const docRef       = useRef<HTMLInputElement>(null);

  const insertEmoji = (emoji: string) => {
    const el    = textareaRef.current;
    const start = el?.selectionStart ?? text.length;
    const end   = el?.selectionEnd   ?? text.length;
    const next  = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    setTimeout(() => {
      if (el) { el.selectionStart = el.selectionEnd = start + emoji.length; el.focus(); }
    }, 0);
  };

  // ── Envoi texte ─────────────────────────────────────────────────────────────
  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSendText(trimmed);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  // ── Sélection fichier ────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttachMenu(false);

    if (file.type.startsWith('image/')) {
      setPreview({ url: URL.createObjectURL(file), file });
    } else {
      onSendFile(file);
    }
    e.target.value = '';
  };

  const confirmImageSend = () => {
    if (preview) { onSendFile(preview.file); URL.revokeObjectURL(preview.url); }
    setPreview(null);
  };

  // ── Vocal ────────────────────────────────────────────────────────────────────
  const handleVoiceSend = (blob: Blob, filename: string) => {
    onSendFile(blob, filename);
    setShowVoice(false);
  };

  if (disabled) {
    return (
      <div className="bg-gray-100 border-t border-gray-200 px-4 py-3">
        <p className="text-center text-sm text-gray-400">Conversation terminée</p>
      </div>
    );
  }

  // ── Mode enregistrement vocal ────────────────────────────────────────────────
  if (showVoice) {
    return <VoiceRecorder onSend={handleVoiceSend} onCancel={() => setShowVoice(false)} />;
  }

  // ── Prévisualisation image avant envoi ──────────────────────────────────────
  if (preview) {
    return (
      <div className="bg-gray-100 border-t border-gray-200 p-3 flex items-end gap-2">
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-2 relative shadow-sm">
          <button
            onClick={() => { URL.revokeObjectURL(preview.url); setPreview(null); }}
            className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
          >
            <X size={12} className="text-white" />
          </button>
          <img src={preview.url} alt="Aperçu" className="max-h-40 rounded-xl object-contain mx-auto" />
        </div>
        <button
          onClick={confirmImageSend}
          className="w-10 h-10 rounded-full bg-neo flex items-center justify-center shadow-md hover:bg-neo-dark"
        >
          <Send size={18} className="text-white ml-0.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Picker emoji avec catégories */}
      {showEmoji && (
        <div className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg animate-slide-up">
          {/* Onglets catégories */}
          <div className="flex border-b border-gray-100 px-2 pt-1">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={i}
                onClick={() => setEmojiTab(i)}
                className={`flex-1 text-lg py-1.5 rounded-t-lg transition-colors ${
                  emojiTab === i ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Grille emojis */}
          <div className="grid grid-cols-8 gap-0.5 px-2 py-2 max-h-36 overflow-y-auto">
            {EMOJI_CATEGORIES[emojiTab].emojis.map((e) => (
              <button
                key={e}
                onClick={() => insertEmoji(e)}
                className="text-xl h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-90 transition-all"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu pièces jointes */}
      {showAttachMenu && (
        <div className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around shadow-lg animate-slide-up">
          {/* Galerie / Photo */}
          <label className="flex flex-col items-center gap-1 cursor-pointer text-neo">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Camera size={22} className="text-purple-600" />
            </div>
            <span className="text-xs text-gray-600">Galerie</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileRef}
              onChange={handleFileChange}
            />
          </label>

          {/* Caméra directe */}
          <label className="flex flex-col items-center gap-1 cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Camera size={22} className="text-red-500" />
            </div>
            <span className="text-xs text-gray-600">Caméra</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={cameraRef}
              onChange={handleFileChange}
            />
          </label>

          {/* Document */}
          <label className="flex flex-col items-center gap-1 cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-neo-bg flex items-center justify-center">
              <FileText size={22} className="text-neo-dark" />
            </div>
            <span className="text-xs text-gray-600">Document</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              className="hidden"
              ref={docRef}
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}

      {/* Barre de saisie principale */}
      <div className="bg-gray-100 border-t border-gray-200 px-3 py-2 flex items-end gap-2">
        {/* Bouton pièces jointes */}
        <button
          onClick={() => setShowAttachMenu((v) => !v)}
          className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-colors mb-0.5 ${
            showAttachMenu ? 'bg-neo text-white' : 'text-gray-500 hover:text-neo'
          }`}
        >
          {showAttachMenu ? <X size={20} /> : <Paperclip size={20} />}
        </button>

        {/* Emoji */}
        <button
          onClick={() => { setShowEmoji((v) => !v); setShowAttachMenu(false); }}
          className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-colors mb-0.5 ${
            showEmoji ? 'bg-neo text-white' : 'text-gray-500 hover:text-neo'
          }`}
        >
          <Smile size={20} />
        </button>

        {/* Zone de saisie */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 px-4 py-2 flex items-end shadow-sm">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onClick={() => { setShowAttachMenu(false); setShowEmoji(false); }}
            placeholder={placeholder ?? 'Écrire un message…'}
            rows={1}
            className="w-full resize-none text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent leading-relaxed max-h-[120px]"
          />
        </div>

        {/* Micro (vide) ou Envoi (avec texte) */}
        {text.trim() ? (
          <button
            onClick={handleSend}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-neo flex items-center justify-center shadow-md hover:bg-neo-dark active:scale-95 transition-all mb-0.5"
          >
            <Send size={18} className="text-white ml-0.5" />
          </button>
        ) : (
          <button
            onClick={() => { setShowAttachMenu(false); setShowVoice(true); }}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-neo flex items-center justify-center shadow-md hover:bg-neo-dark active:scale-95 transition-all mb-0.5"
          >
            <Mic size={18} className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
}