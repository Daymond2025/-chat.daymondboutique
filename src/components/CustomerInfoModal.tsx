'use client';

import { useState } from 'react';
import { X, User, Phone, MapPin, Calendar } from 'lucide-react';

interface FormData {
  name:     string;
  phone:    string;
  address:  string;
  city:     string;
  datetime: string;
}

interface Props {
  onSubmit: (message: string) => void;
  onClose:  () => void;
}

const CITIES = ['Abidjan', 'Bouaké', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Daloa', 'Man'];

const DELIVERY_TIMES = [
  "Aujourd'hui, dans l'immédiat",
  "Aujourd'hui dans l'après-midi",
  'Demain matin',
  'Demain après-midi',
  'Dans 2 à 3 jours',
  'Je vous préciserai plus tard',
];

export default function CustomerInfoModal({ onSubmit, onClose }: Props) {
  const [form, setForm] = useState<FormData>({
    name: '', phone: '', address: '', city: 'Abidjan', datetime: DELIVERY_TIMES[0],
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.name.trim())    e.name    = 'Champ requis';
    if (!form.phone.trim())   e.phone   = 'Champ requis';
    if (!form.address.trim()) e.address = 'Champ requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const msg = `Mon nom est ${form.name.trim()}, mon numéro est le ${form.phone.trim()}, mon adresse de livraison est ${form.address.trim()} à ${form.city}, et je souhaite être livré : ${form.datetime}.`;
    onSubmit(msg);
    onClose();
  }

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl animate-slide-up">

        {/* Header */}
        <div className="bg-neo-header px-5 py-4 rounded-t-3xl flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base">Vos informations de livraison</p>
            <p className="text-neo-light text-xs mt-0.5">Remplissez les champs ci-dessous</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-5 space-y-4">

          {/* Nom */}
          <div>
            <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 mb-1.5">
              <User size={13} /> Nom complet
            </label>
            <input
              type="text"
              placeholder="Ex : Koffi Jean-Baptiste"
              value={form.name}
              onChange={set('name')}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neo transition
                ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
            />
            {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
          </div>

          {/* Téléphone */}
          <div>
            <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 mb-1.5">
              <Phone size={13} /> Numéro de téléphone
            </label>
            <input
              type="tel"
              placeholder="Ex : +225 07 00 00 00 00"
              value={form.phone}
              onChange={set('phone')}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neo transition
                ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
            />
            {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
          </div>

          {/* Adresse */}
          <div>
            <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 mb-1.5">
              <MapPin size={13} /> Adresse de livraison
            </label>
            <input
              type="text"
              placeholder="Ex : Cocody, Rue des Jardins, face Total"
              value={form.address}
              onChange={set('address')}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neo transition
                ${errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
            />
            {errors.address && <p className="text-red-500 text-[11px] mt-1">{errors.address}</p>}
          </div>

          {/* Ville */}
          <div>
            <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 mb-1.5">
              <MapPin size={13} /> Ville
            </label>
            <select
              value={form.city}
              onChange={set('city')}
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neo transition"
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="Autre">Autre ville</option>
            </select>
          </div>

          {/* Date de livraison */}
          <div>
            <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 mb-1.5">
              <Calendar size={13} /> Date et heure de livraison
            </label>
            <select
              value={form.datetime}
              onChange={set('datetime')}
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neo transition"
            >
              {DELIVERY_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full bg-neo text-white font-bold py-3.5 rounded-2xl shadow-md hover:bg-neo-dark active:scale-95 transition-all mt-2 uppercase tracking-wide text-sm"
          >
            Confirmer mes informations
          </button>
        </div>
      </div>
    </div>
  );
}
