import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { RichText } from '../../../components/common/RichText';
import { Loader2, Flame } from 'lucide-react';
import type { RaidQuestion } from '../../../types/raid.types';

interface Props {
  question: RaidQuestion | null; // Puede ser null si está cargando más
  selectedOption: string | null;
  isAnswerCorrect: boolean | null;
  onOptionClick: (opt: string, idx: number) => void;
}

export const RaidQuestionDisplay = ({ question, selectedOption, isAnswerCorrect, onOptionClick }: Props) => {
  
  if (!question) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 animate-pulse">
            <Loader2 className="w-10 h-10 mb-4 animate-spin text-slate-600" />
            <p className="font-bold uppercase tracking-widest text-sm">Recargando Munición...</p>
        </div>
    );
  }

  // Helper seguro para opciones
  const options = Array.isArray(question.options) ? question.options : Object.values(question.options || {});

  return (
    <div className="flex-1 flex flex-col justify-end pb-8">
        {/* Tarjeta Pregunta */}
        <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl mb-6 min-h-[140px] flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none" />
            <div className="text-white [&_*]:text-white text-center w-full">
                <RichText content={question.prompt} className="text-2xl font-black leading-tight drop-shadow-sm" />
            </div>
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-1 gap-3">
            <AnimatePresence mode="popLayout">
                {options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    
                    // Lógica de estilos (Dark Mode + Feedback)
                    let containerClass = "bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750";
                    let textClass = "text-slate-200";
                    let badgeClass = "bg-slate-900 text-slate-500 border-slate-700";

                    if (isSelected) {
                        if (isAnswerCorrect === true) { // Correcto
                            containerClass = "bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]";
                            textClass = "text-green-100";
                            badgeClass = "bg-green-500 text-white border-green-400";
                        } else if (isAnswerCorrect === false) { // Incorrecto
                            containerClass = "bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]";
                            textClass = "text-red-100";
                            badgeClass = "bg-red-500 text-white border-red-400";
                        } else { // Seleccionado
                            containerClass = "bg-blue-500/20 border-blue-500";
                            textClass = "text-blue-100";
                            badgeClass = "bg-blue-500 text-white border-blue-400";
                        }
                    }

                    return (
                        <motion.button
                            key={`${question.id}-${idx}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            disabled={!!selectedOption}
                            onClick={() => onOptionClick(opt, idx)}
                            className={clsx("w-full p-4 rounded-xl border-2 text-lg font-bold transition-all duration-200 text-left flex items-center relative overflow-hidden group active:scale-[0.98]", containerClass)}
                        >
                            <span className={clsx("flex items-center justify-center w-10 h-10 rounded-lg border-2 mr-4 text-sm font-black shrink-0 transition-colors uppercase", badgeClass)}>
                                {String.fromCharCode(65 + idx)}
                            </span>
                            <div className={clsx("flex-1 pointer-events-none font-bold [&_*]:text-inherit [&_p]:m-0", textClass)}>
                                <RichText content={opt} />
                            </div>
                        </motion.button>
                    );
                })}
            </AnimatePresence>
        </div>

        {/* Feedback Flotante */}
        <div className="h-12 mt-4 flex justify-center items-center">
            <AnimatePresence>
                {isAnswerCorrect === true && (
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="bg-green-500 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-lg shadow-green-500/40 flex items-center gap-2 border-2 border-green-400">
                        <Flame size={20} fill="currentColor" /> <span>¡Golpe Crítico!</span>
                    </motion.div>
                )}
                {isAnswerCorrect === false && (
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="bg-red-500 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-lg shadow-red-500/40 border-2 border-red-400">
                        Fallo
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
};