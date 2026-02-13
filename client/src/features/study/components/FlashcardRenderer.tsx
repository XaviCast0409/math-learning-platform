import { clsx } from 'clsx';
import MathRenderer from '../../../components/math/MathRenderer';

interface Props {
  content: string;
  type?: 'front' | 'back';
}

export const FlashcardRenderer = ({ content, type = 'front' }: Props) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
      {/* Etiqueta pequeña */}
      <span className={clsx(
        "absolute top-4 left-4 text-xs font-bold uppercase tracking-widest",
        type === 'front' ? "text-gray-400" : "text-brand-blue/60"
      )}>
        {type === 'front' ? 'Pregunta' : 'Respuesta'}
      </span>

      {/* Contenido Principal */}
      <div className="prose prose-lg max-w-none text-gray-700 select-none">
        <MathRenderer content={content} />
      </div>
    </div>
  );
};