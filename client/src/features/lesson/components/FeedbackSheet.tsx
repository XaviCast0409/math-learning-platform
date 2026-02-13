import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { clsx } from 'clsx';
import { RichText } from '../../../components/common/RichText';

interface FeedbackSheetProps {
  status: 'correct' | 'wrong' | 'idle'; // idle = oculto
  correctAnswer: string;
  explanation: string;
  onContinue: () => void;
}

export const FeedbackSheet = ({ status, correctAnswer, explanation, onContinue }: FeedbackSheetProps) => {
  if (status === 'idle') return null;

  const isCorrect = status === 'correct';

  return (
    <div className={clsx(
      "fixed bottom-0 left-0 right-0 z-50 p-6 pb-8 border-t-4 border-black animate-in slide-in-from-bottom duration-300",
      isCorrect ? "bg-[#d7ffb8]" : "bg-[#ffdfe0]" // Verde claro vs Rojo claro
    )}>
      <div className="max-w-md mx-auto">
        
        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-2">
          {isCorrect ? (
            <CheckCircle2 className="text-brand-green" size={32} strokeWidth={3} />
          ) : (
            <XCircle className="text-brand-red" size={32} strokeWidth={3} />
          )}
          <h2 className={clsx("font-black text-2xl", isCorrect ? "text-brand-green" : "text-brand-red")}>
            {isCorrect ? '¡Excelente!' : 'Incorrecto'}
          </h2>
        </div>

        {/* Explicación (Solo si falló) */}
        {!isCorrect && (
          <div className="mb-6">
            <p className="font-bold text-gray-600 text-sm uppercase mb-1">Respuesta correcta:</p>
            
            <p className="text-lg font-medium mb-2">{correctAnswer}</p>
            <div className="bg-white/50 p-3 rounded-xl text-sm border-2 border-brand-red/20 text-brand-red font-medium">
              💡 <RichText content={explanation} />
            </div>
          </div>
        )}
        
        {/* Explicación Extra (Si acertó y hay explicación) */}
        {isCorrect && explanation && (
             <div className="mb-6 text-brand-green font-medium text-sm">
                💡 <RichText content={explanation} />
             </div>
        )}

        {/* Botón Continuar */}
        <Button 
          onClick={onContinue}
          className={clsx(
            "w-full",
            isCorrect 
              ? "bg-brand-green hover:bg-green-600 text-white shadow-[4px_4px_0px_0px_#15803d]" 
              : "bg-brand-red hover:bg-red-600 text-white shadow-[4px_4px_0px_0px_#b91c1c]"
          )}
          icon={<ArrowRight />}
        >
          CONTINUAR
        </Button>
      </div>
    </div>
  );
};

