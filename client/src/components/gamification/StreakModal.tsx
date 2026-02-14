import React from 'react';
import { Button } from '../common/Button';
import { Flame, Coins, Zap, X } from 'lucide-react';
import Confetti from 'react-confetti'; // 👈 Importamos tu librería instalada

interface StreakReward {
  streak: number;
  xp: number;
  gems: number;
  message: string;
}

interface StreakModalProps {
  reward: StreakReward;
  onClose: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({ reward, onClose }) => {

  // Obtenemos dimensiones de la ventana para que el confeti cubra todo
  const width = window.innerWidth;
  const height = window.innerHeight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">

      {/* 👇 COMPONENTE DE CONFETI */}
      <Confetti
        width={width}
        height={height}
        recycle={true} // Cae infinitamente mientras el modal esté abierto
        numberOfPieces={200}
        gravity={0.2}
        colors={['#FFD700', '#FF4500', '#000000', '#FFFFFF']} // Oro, Naranja, Negro, Blanco
      />

      <div className="bg-white border-4 border-black rounded-3xl p-6 max-w-sm w-full shadow-retro relative animate-in zoom-in-50 duration-500 z-10">

        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full border-2 border-black shadow-sm hover:scale-110 transition-transform z-20"
        >
          <X size={20} strokeWidth={3} />
        </button>

        {/* Icono Principal Animado */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-brand-yellow border-4 border-black rounded-full p-6 shadow-retro-sm animate-bounce">
              <Flame size={64} className="text-red-600 fill-orange-500" />
            </div>
            {/* Badge de días */}
            <div className="absolute -bottom-2 -right-2 bg-black text-white font-black text-xl px-3 py-1 rounded-lg border-2 border-white transform rotate-12">
              {reward.streak} DÍAS
            </div>
          </div>
        </div>

        {/* Título y Mensaje */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-black italic text-black uppercase leading-none transform -skew-x-6">
            ¡Racha en Llamas!
          </h2>
          <p className="text-gray-600 font-bold text-lg">
            {reward.message}
          </p>
        </div>

        {/* Recompensas */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 mb-6 flex justify-around items-center">
          <div className="flex flex-col items-center">
            <Coins size={32} className="text-yellow-500 fill-yellow-200 mb-1" />
            <span className="font-black text-xl text-black">+{reward.gems}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">XaviCoins</span>
          </div>
          <div className="w-[2px] h-10 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <Zap size={32} className="text-blue-500 fill-blue-200 mb-1" />
            <span className="font-black text-xl text-black">+{reward.xp}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">XP</span>
          </div>
        </div>

        {/* Botón de Acción */}
        <Button
          onClick={onClose}
          variant="primary"
          className="w-full text-xl py-4"
        >
          ¡GENIAL!
        </Button>
      </div>
    </div>
  );
};