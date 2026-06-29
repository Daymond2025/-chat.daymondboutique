export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-slide-up">
      <div className="w-7 h-7 flex-shrink-0" />
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-typing-dot-1" />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-typing-dot-2" />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-typing-dot-3" />
        </div>
      </div>
    </div>
  );
}