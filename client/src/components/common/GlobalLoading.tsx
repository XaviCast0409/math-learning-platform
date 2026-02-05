import { useEffect, useState } from 'react';
import { Calculator, Zap, Brain, Rocket } from 'lucide-react';

const FUN_MESSAGES = [
    "Afilando los lápices... ✏️",
    "Calibrando el cerebro... 🧠",
    "Invocando a Pitágoras... 📐",
    "Cargando diversión exponencial... 🚀",
    "Resolviendo X... ✖️",
    "Sumando gemas... 💎"
];

const ICONS = [Calculator, Zap, Brain, Rocket];

export const GlobalLoading = () => {
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const [Icon, setIcon] = useState(() => ICONS[0]);

    useEffect(() => {
        // 1. Simulación de progreso (AJUSTADO PARA SER MÁS LENTO)
        const timer = setInterval(() => {
            setProgress((prev) => {
                // Si ya llegamos casi al final, esperamos ahí un poco
                if (prev >= 95) {
                    return 95;
                }
                // Incremento más pequeño (entre 0.5 y 3) para que tarde más
                const increment = Math.random() * 3 + 0.5;
                return Math.min(prev + increment, 95);
            });
        }, 100); // Se actualiza cada 100ms para ser más fluido

        // 2. Rotación de mensajes e íconos
        const msgTimer = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % FUN_MESSAGES.length);
            setIcon(() => ICONS[Math.floor(Math.random() * ICONS.length)]);
        }, 1500);

        return () => {
            clearInterval(timer);
            clearInterval(msgTimer);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue/90 backdrop-blur-sm transition-all">
            {/* Tarjeta Flotante */}
            <div className="w-full max-w-md p-8 m-4 bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

                {/* Icono Saltarin */}
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-brand-yellow border-2 border-black rounded-full animate-bounce shadow-retro-sm">
                        <Icon size={40} className="text-black" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Título */}
                <h2 className="text-2xl font-black text-center text-black mb-2 uppercase tracking-wide">
                    Cargando Mundo
                </h2>

                {/* Mensaje Cambiante */}
                <p className="text-center text-gray-600 font-bold mb-6 h-6">
                    {FUN_MESSAGES[messageIndex]}
                </p>

                {/* Barra de Progreso Retro */}
                <div className="relative w-full h-8 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                    <div
                        className="h-full bg-brand-green animate-stripes transition-all duration-300 ease-out border-r-2 border-black"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Porcentaje numérico */}
                <div className="flex justify-end mt-2">
                    <span className="font-black text-sm text-black">{Math.round(progress)}%</span>
                </div>

            </div>
        </div>
    );
};