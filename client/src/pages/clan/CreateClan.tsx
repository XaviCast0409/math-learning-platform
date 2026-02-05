import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Check } from 'lucide-react';
import { useClan } from './hooks/useClan';
import { Button } from '../../components/common/Button';
import { clsx } from 'clsx';

// 👇 1. IMPORTAMOS TUS NUEVOS RECURSOS
import { AVAILABLE_EMBLEMS } from '../../config/emblems.config';
import { ClanEmblem } from './components/ClanEmblem';

export default function CreateClan() {
  const { actions } = useClan();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  
  // 👇 2. Inicializamos con el primer ID real de tu config
  const [selectedEmblem, setSelectedEmblem] = useState(AVAILABLE_EMBLEMS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    // Llamamos a la acción del hook con el ID del emblema (ej: 'cubo.jpeg')
    const success = await actions.createClan(name, desc, selectedEmblem);
    setIsSubmitting(false);

    if (success) {
      navigate('/clan');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* --- HEADER --- */}
      <div className="bg-white sticky top-0 z-10 shadow-sm p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 active:scale-95 transition-transform"
          >
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-black text-gray-800 italic">FUNDAR UN CLAN</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. SELECCIÓN DE EMBLEMA */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Elige tu Estandarte
            </label>
            
            {/* 👇 3. Grid para mostrar tus emblemas matemáticos */}
            <div className="grid grid-cols-3 gap-3">
              {AVAILABLE_EMBLEMS.map((emblem) => {
                const isSelected = selectedEmblem === emblem.id;
                
                return (
                  <button
                    key={emblem.id}
                    type="button"
                    onClick={() => setSelectedEmblem(emblem.id)}
                    className={clsx(
                      "relative flex flex-col items-center p-3 rounded-xl border-2 transition-all group",
                      isSelected
                        ? "border-brand-blue bg-blue-50 shadow-sm scale-105"
                        : "border-transparent hover:bg-gray-50 hover:border-gray-200"
                    )}
                  >
                    {/* Renderizamos la imagen real */}
                    <ClanEmblem 
                        emblemId={emblem.id} 
                        className="w-12 h-12 mb-2 shadow-sm group-hover:scale-110 transition-transform" 
                    />
                    
                    {/* Nombre del emblema */}
                    <span className={clsx(
                        "text-[10px] font-bold leading-tight transition-colors",
                        isSelected ? "text-brand-blue" : "text-gray-400"
                    )}>
                        {emblem.name}
                    </span>

                    {/* Checkmark de seleccionado */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-brand-blue text-white rounded-full p-1 border-2 border-white shadow-sm z-10">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. DATOS DEL CLAN */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                Nombre del Clan
              </label>
              <input
                type="text"
                maxLength={20}
                placeholder="Ej: Los Fractaleros"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-black focus:ring-0 focus:outline-none font-bold text-gray-800 transition-colors placeholder:font-normal"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 text-right mt-1 font-medium">
                {name.length}/20
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                Descripción
              </label>
              <textarea
                rows={3}
                maxLength={100}
                placeholder="¿Cuál es el objetivo de tu clan?"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-black focus:ring-0 focus:outline-none font-medium text-gray-700 transition-colors resize-none placeholder:font-normal"
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>
          </div>

          {/* 3. BOTÓN DE ACCIÓN */}
          <div className="pt-6">
            <Button
              type="submit"
              variant="primary"
              className="w-full shadow-retro hover:shadow-none translate-y-0 hover:translate-y-1 transition-all"
              isLoading={isSubmitting}
              disabled={!name.trim() || isSubmitting}
              icon={<Shield size={20} />}
            >
              FUNDAR CLAN
            </Button>
            <p className="text-center text-xs text-gray-400 mt-4 font-medium">
              Al crear un clan, te conviertes en su Líder automáticamente.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}