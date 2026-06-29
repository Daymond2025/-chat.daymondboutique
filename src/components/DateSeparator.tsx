interface Props {
  label: string; // 'Aujourd\'hui' | 'Hier' | '12 juin 2026'
}

export default function DateSeparator({ label }: Props) {
  return (
    <div className="flex items-center gap-3 my-3 px-4">
      <div className="flex-1 h-px bg-black/10" />
      <span className="text-xs text-gray-500 bg-white/70 px-3 py-0.5 rounded-full shadow-sm whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-black/10" />
    </div>
  );
}