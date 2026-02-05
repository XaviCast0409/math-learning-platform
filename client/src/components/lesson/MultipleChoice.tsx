import { clsx } from 'clsx';
import { RichText } from '../common/RichText';

interface Props {
  options: string[] | string | Record<string, string>;
  selectedOption: string | null; // 👈 Permitimos null para evitar el error anterior
  onSelect: (opt: string) => void;
  disabled: boolean;
  correctAnswer?: string; // 👈 NUEVO: Opcional (signo ?) para no romper otros componentes
}

export const MultipleChoice = ({ 
  options, 
  selectedOption, 
  onSelect, 
  disabled, 
  correctAnswer // 👈 Lo recibimos aquí
}: Props) => {
  
  // 🧹 LÓGICA DE LIMPIEZA DE DATOS (Igual que antes)
  let validOptions: string[] = [];
  
  if (Array.isArray(options)) {
    validOptions = options;
  } 
  else if (typeof options === 'object' && options !== null) {
    validOptions = Object.values(options);
  } 
  else if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      if (Array.isArray(parsed)) validOptions = parsed;
      else if (typeof parsed === 'object') validOptions = Object.values(parsed);
    } catch (e) {
      console.error("Error parseando opciones:", e);
      validOptions = [];
    }
  }

  if (!validOptions || validOptions.length === 0) {
    return <div className="text-red-500">Error cargando opciones</div>;
  }

  return (
    <div className="grid gap-3">
      {validOptions.map((opt, i) => {
        const isSelected = selectedOption === opt;
        
        // 👇 LÓGICA DE COLORES
        // Si hay correctAnswer, estamos en modo "Revelar respuesta"
        const isCorrect = correctAnswer === opt;
        const isWrongSelection = isSelected && correctAnswer && !isCorrect;

        // Definimos estilos dinámicos
        let styles = "bg-white border-gray-200 border-b-gray-300 text-gray-700 hover:bg-gray-50";
        let badgeStyles = "bg-white border-gray-200 text-gray-400";

        // 1. Si ya se reveló la respuesta correcta (Raid/Review)
        if (correctAnswer) {
            if (isCorrect) {
                // VERDE (Correcto)
                styles = "bg-green-100 border-green-500 border-b-green-600 text-green-800";
                badgeStyles = "bg-green-500 text-white border-green-500";
            } else if (isWrongSelection) {
                // ROJO (Incorrecto seleccionado)
                styles = "bg-red-100 border-red-400 border-b-red-500 text-red-800";
                badgeStyles = "bg-red-500 text-white border-red-500";
            } else {
                // Resto (Opacos)
                styles = "bg-gray-50 border-gray-100 text-gray-300 opacity-50";
            }
        } 
        // 2. Si solo está seleccionado (Modo normal)
        else if (isSelected) {
            styles = "bg-blue-100 border-brand-blue border-b-brand-blue text-brand-blue";
            badgeStyles = "bg-brand-blue text-white border-brand-blue";
        }

        return (
          <button
            key={i}
            onClick={() => onSelect(opt)}
            disabled={disabled || !!correctAnswer} // Bloquear si ya hay respuesta
            className={clsx(
              "p-4 rounded-2xl border-b-4 border-2 text-lg font-bold transition-all text-left flex items-center w-full min-h-[70px]",
              styles
            )}
          >
            {/* Badge A, B, C */}
            <span className={clsx(
              "inline-flex items-center justify-center w-8 h-8 rounded-lg border-2 mr-3 text-sm shrink-0 font-black",
              badgeStyles
            )}>
              {String.fromCharCode(65 + i)}
            </span>
            
            <div className="flex-1">
               <RichText content={opt} className="prose-p:m-0 pointer-events-none leading-tight" />
            </div>
          </button>
        );
      })}
    </div>
  );
};