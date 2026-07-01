'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';

interface Props {
  onSubmit:    (message: string) => void;
  onClose:     () => void;
  agentName:   string;
  agentAvatar: string | null;
}

const CITIES = [
  'Abidjan', 'Bouaké', 'San-Pédro', 'Yamoussoukro',
  'Korhogo', 'Daloa', 'Man', 'Autre',
];

const DELIVERY_TIMES = [
  "Maintenant",
  "Cet après-midi",
  "Demain matin",
  "Demain après-midi",
  "Dans 2-3 jours",
  "Me recontacter",
];

interface Step {
  question:    string;
  placeholder: string;
  type:        'text' | 'tel' | 'chips';
  options?:    string[];
  field:       'address' | 'name' | 'phone' | 'city' | 'datetime';
}

const STEPS: Step[] = [
  {
    question:    'On vous livre où aujourd\'hui ?',
    placeholder: 'Votre adresse de livraison',
    type:        'text',
    field:       'address',
  },
  {
    question:    'Comment vous appelez-vous ?',
    placeholder: 'Votre nom complet',
    type:        'text',
    field:       'name',
  },
  {
    question:    'Votre numéro WhatsApp ?',
    placeholder: 'Ex : 07 00 00 00 00',
    type:        'tel',
    field:       'phone',
  },
  {
    question:    'Dans quelle ville ?',
    placeholder: '',
    type:        'chips',
    options:     CITIES,
    field:       'city',
  },
  {
    question:    'Quand souhaitez-vous être livré ?',
    placeholder: '',
    type:        'chips',
    options:     DELIVERY_TIMES,
    field:       'datetime',
  },
];

type FormData = Record<string, string>;

export default function CustomerInfoModal({ onSubmit, onClose, agentName, agentAvatar }: Props) {
  const [step,    setStep]    = useState(0);
  const [value,   setValue]   = useState('');
  const [form,    setForm]    = useState<FormData>({});
  const [error,   setError]   = useState('');
  const [leaving, setLeaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = STEPS[step];
  const initials = agentName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    if (current.type !== 'chips') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step, current.type]);

  function advance(val: string) {
    const trimmed = val.trim();
    if (!trimmed) { setError('Ce champ est obligatoire'); return; }

    const updated = { ...form, [current.field]: trimmed };
    setForm(updated);
    setError('');
    setValue('');

    if (step < STEPS.length - 1) {
      setLeaving(true);
      setTimeout(() => { setStep((s) => s + 1); setLeaving(false); }, 180);
    } else {
      // Dernier step — compiler et envoyer
      const msg =
        `Mon nom est ${updated.name}, mon numéro est le ${updated.phone}, ` +
        `je veux être livré à ${updated.address}, ${updated.city}. ` +
        `Créneau souhaité : ${updated.datetime}.`;
      onSubmit(msg);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') advance(value);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay flou */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm animate-scale-in">

        {/* Avatar agent — flottant au-dessus de la card */}
        <div className="flex justify-center mb-[-36px] relative z-10">
          {agentAvatar ? (
            <img
              src={agentAvatar}
              alt={agentName}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-neo flex items-center justify-center border-4 border-white shadow-lg">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="bg-white rounded-3xl shadow-2xl pt-14 pb-6 px-6 relative">

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <X size={14} />
          </button>

          {/* Indicateur de progression */}
          <div className="flex justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-neo' : i < step ? 'w-3 bg-neo/40' : 'w-3 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Question */}
          <p className={`text-center text-[17px] font-bold text-gray-800 mb-5 leading-snug transition-opacity duration-180 ${leaving ? 'opacity-0' : 'opacity-100'}`}>
            {current.question}
          </p>

          {/* Chips (ville / créneau) */}
          {current.type === 'chips' && current.options && (
            <div className="flex flex-wrap gap-2 justify-center">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => advance(opt)}
                  className="px-4 py-2 rounded-full border border-neo text-neo text-sm font-medium hover:bg-neo hover:text-white active:scale-95 transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Input texte / tel */}
          {current.type !== 'chips' && (
            <div className={`flex items-center gap-2 transition-opacity duration-180 ${leaving ? 'opacity-0' : 'opacity-100'}`}>
              <input
                ref={inputRef}
                type={current.type}
                inputMode={current.type === 'tel' ? 'tel' : 'text'}
                placeholder={current.placeholder}
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(''); }}
                onKeyDown={handleKey}
                className="flex-1 border-2 border-neo rounded-2xl px-4 py-3 text-sm outline-none placeholder-gray-300 text-gray-800 focus:border-neo transition-colors"
              />
              <button
                onClick={() => advance(value)}
                className="w-11 h-11 rounded-full bg-neo flex items-center justify-center shadow-md hover:bg-neo-dark active:scale-95 transition-all flex-shrink-0"
              >
                <ChevronRight size={20} className="text-white" />
              </button>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-xs text-center mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
