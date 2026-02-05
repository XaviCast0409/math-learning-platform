import { Swords, Clock, Trophy, AlertCircle } from 'lucide-react';
import { type WarStatus } from '../../../api/clan.api';
import { motion } from 'framer-motion';

interface Props {
    war: WarStatus | null;
}

export const ClanWarWidget = ({ war }: Props) => {
    
    // CASO 1: NO HAY GUERRA ACTIVA
    if (!war || war.status !== 'active') {
        return (
            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center space-y-2 opacity-75">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                    <Swords size={24} />
                </div>
                <h3 className="font-bold text-gray-500">Tiempos de Paz</h3>
                <p className="text-xs text-gray-400 max-w-[200px] mx-auto">
                    Tu clan no está en guerra actualmente. ¡Busca un rival para ganar recompensas extra!
                </p>
            </div>
        );
    }

    // CASO 2: GUERRA ACTIVA (Cálculos)

    // 👇 CORRECCIÓN CLAVE: Extraemos los puntajes de la propiedad 'scores'
    // Si por alguna razón 'scores' no existe, usamos 0 como fallback para evitar errores.
    const myScore = war.scores?.myScore || 0;
    const opponentScore = war.scores?.opponentScore || 0;
    
    // Evitamos división por cero usando los valores extraídos
    const totalScore = Math.max(1, myScore + opponentScore);
    
    // Calculamos porcentajes (Mínimo 10% para que siempre se vea algo de barra)
    const myPercent = totalScore === 1 ? 50 : Math.max(10, Math.min(90, (myScore / totalScore) * 100));
    
    // Formatear tiempo restante (HH:MM)
    const hours = Math.floor(war.timeLeftMs / (1000 * 60 * 60));
    const minutes = Math.floor((war.timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    const isUrgent = hours < 2; // Menos de 2 horas = Urgente

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            
            {/* Header: VS y Tiempo */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Swords size={12} /> EN GUERRA
                    </span>
                </div>
                
                <div className={`flex items-center gap-1.5 font-bold font-mono text-sm ${isUrgent ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                    <Clock size={16} />
                    <span>{hours}h {minutes}m</span>
                </div>
            </div>

            {/* MARCADOR PRINCIPAL */}
            <div className="flex justify-between items-end mb-2 px-1">
                {/* Mi Clan */}
                <div className="text-left">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Tu Clan</div>
                    {/* 👇 Usamos la variable myScore */}
                    <div className="text-2xl font-black text-brand-blue leading-none">{myScore}</div>
                    <div className="text-[10px] text-gray-400 font-bold mt-1">XP Ganada</div>
                </div>

                {/* VS Icono Central */}
                <div className="mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-black text-xs border-2 border-white shadow-sm">
                        VS
                    </div>
                </div>

                {/* Rival */}
                <div className="text-right">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1 truncate max-w-[100px]">
                        {war.opponent?.name || 'Rival'}
                    </div>
                    {/* 👇 Usamos la variable opponentScore */}
                    <div className="text-2xl font-black text-red-500 leading-none">{opponentScore}</div>
                    <div className="text-[10px] text-gray-400 font-bold mt-1">XP Ganada</div>
                </div>
            </div>

            {/* BARRA DE PROGRESO (TUG OF WAR) */}
            <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                {/* Lado Azul (Nosotros) */}
                <motion.div 
                    initial={{ width: '50%' }}
                    animate={{ width: `${myPercent}%` }}
                    transition={{ type: 'spring', stiffness: 50 }}
                    className="h-full bg-gradient-to-r from-blue-400 to-brand-blue relative"
                >
                    {/* Brillo animado */}
                    <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-pulse"></div>
                </motion.div>
                
                {/* Lado Rojo (Ellos) - Ocupa el resto automáticamente */}
                <div className="flex-1 bg-gradient-to-l from-red-500 to-red-400"></div>

                {/* Indicador central de quién va ganando */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-white/50 z-10"></div>
            </div>

            {/* Mensaje de Estado */}
            <div className="mt-4 flex justify-center">
                {myScore > opponentScore ? (
                    <div className="text-xs font-bold text-green-600 flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
                        <Trophy size={14} />
                        ¡Vamos ganando! Mantengan el ritmo.
                    </div>
                ) : myScore < opponentScore ? (
                    <div className="text-xs font-bold text-red-500 flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full">
                        <AlertCircle size={14} />
                        ¡Nos están ganando! Necesitamos más XP.
                    </div>
                ) : (
                    <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                        Empate técnico. ¡Cualquiera puede ganar!
                    </div>
                )}
            </div>

        </div>
    );
};