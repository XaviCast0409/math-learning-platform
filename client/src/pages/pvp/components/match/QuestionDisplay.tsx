import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../../../components/common/Button';
import { RichText } from '../../../../components/common/RichText';

interface Props {
  question: any; // Tipa esto con tu interfaz Question
  selectedOption: string | null;
  isAnswerCorrect: boolean | null;
  isSubmitting: boolean;
  gameTimeLeft: number;
  onOptionClick: (opt: string) => void;
}

export const QuestionDisplay = ({ 
  question, selectedOption, isAnswerCorrect, isSubmitting, gameTimeLeft, onOptionClick 
}: Props) => {
  
  // Parseo seguro de opciones (Logica de vista extraída)
  let safeOptions: string[] = [];
  try {
    const raw = question.options;
    if (Array.isArray(raw)) safeOptions = raw;
    else if (typeof raw === 'string') {
      const parsed = JSON.parse(raw);
      safeOptions = Array.isArray(parsed) ? parsed : Object.values(parsed);
    } else if (typeof raw === 'object' && raw !== null) {
      safeOptions = Object.values(raw);
    } else safeOptions = ["Error formato"];
  } catch (e) { safeOptions = ["Error"]; }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full z-0">
      
      {/* TARJETA DE PREGUNTA */}
      <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl w-full mb-8 text-center min-h-[150px] flex items-center justify-center relative">
        {gameTimeLeft === 0 && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white font-black text-xl z-20">
            ¡TIEMPO AGOTADO!
          </div>
        )}
        <div className="text-xl md:text-2xl font-bold leading-tight relative z-10">
           <RichText content={question.prompt} />
        </div>
      </div>

      {/* BOTONES DE RESPUESTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {safeOptions.map((opt, idx) => {
          let btnVariant: any = 'outline';
          const isSelected = selectedOption === opt;
          
          if (isSelected) {
            if (isAnswerCorrect === true) btnVariant = 'secondary'; // Verde/Correcto
            else if (isAnswerCorrect === false) btnVariant = 'danger'; // Rojo/Incorrecto
            else btnVariant = 'primary'; // Azul/Seleccionado esperando
          }

          return (
            <Button
              key={idx}
              variant={btnVariant}
              onClick={() => onOptionClick(opt)}
              disabled={isSubmitting || isAnswerCorrect !== null || gameTimeLeft <= 0}
              className={`w-full py-6 text-lg normal-case flex justify-between px-6 border-2 transition-all 
                ${isSelected && isAnswerCorrect === null ? 'animate-pulse scale-[1.02]' : ''}`}
            >
              <span className="flex-1 text-left"><RichText content={opt} /></span>
              {isSelected && isAnswerCorrect === true && <CheckCircle className="text-white shrink-0 ml-2" />}
              {isSelected && isAnswerCorrect === false && <XCircle className="text-white shrink-0 ml-2" />}
            </Button>
          );
        })}
      </div>

      {/* FEEDBACK TEXTUAL */}
      <div className="h-8 mt-6">
        {isAnswerCorrect === true && <p className="text-green-400 font-bold text-center animate-bounce">¡Correcto! +Puntos</p>}
        {isAnswerCorrect === false && <p className="text-red-400 font-bold text-center shake">¡Incorrecto!</p>}
      </div>
    </div>
  );
};