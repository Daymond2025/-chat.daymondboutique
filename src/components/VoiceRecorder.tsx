'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';

interface Props {
  onSend: (blob: Blob) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: Props) {
  const [seconds, setSeconds]     = useState(0);
  const [isReady, setIsReady]     = useState(false);
  const [blob, setBlob]           = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl]   = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopTimer();
      recorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const recorded = new Blob(chunksRef.current, { type: 'audio/webm' });
        setBlob(recorded);
        setAudioUrl(URL.createObjectURL(recorded));
        setIsReady(true);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(100);
      recorderRef.current = recorder;

      // Timer
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      onCancel(); // Micro refusé par l'utilisateur
    }
  };

  const stopRecording = () => {
    stopTimer();
    recorderRef.current?.stop();
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSend = () => {
    if (blob) onSend(blob);
  };

  const handleCancel = () => {
    stopTimer();
    recorderRef.current?.stop();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    onCancel();
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="bg-gray-100 border-t border-gray-200 px-3 py-2 flex items-center gap-3">
      {/* Annuler */}
      <button
        onClick={handleCancel}
        className="w-9 h-9 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition-colors"
      >
        <Trash2 size={20} />
      </button>

      {/* Indicateur enregistrement ou lecteur */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 px-4 py-2 shadow-sm flex items-center gap-2">
        {isReady && audioUrl ? (
          <audio controls src={audioUrl} className="h-8 w-full" />
        ) : (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <span className="text-sm text-gray-600 font-mono">{formatTime(seconds)}</span>
            <span className="text-xs text-gray-400 ml-1">Enregistrement…</span>
          </>
        )}
      </div>

      {/* Stop ou Envoyer */}
      {isReady ? (
        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-full bg-neo flex items-center justify-center shadow-md hover:bg-neo-dark transition-colors"
        >
          <Send size={18} className="text-white ml-0.5" />
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
        >
          <Square size={16} className="text-white fill-white" />
        </button>
      )}
    </div>
  );
}