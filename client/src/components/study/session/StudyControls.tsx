import { clsx } from 'clsx';
import { Button } from '../../common/Button';

const QUALITIES = [
  { val: 1, label: 'Olvidé', color: 'bg-red-500' },
  { val: 3, label: 'Difícil', color: 'bg-yellow-500' },
  { val: 4, label: 'Bien', color: 'bg-blue-500' },
  { val: 5, label: 'Fácil', color: 'bg-green-500' },
];

interface StudyControlsProps {
  isFlipped: boolean;
  canInteract: boolean;
  onReveal: () => void;
  onRate: (quality: number) => void;
}

export const StudyControls = ({ isFlipped, canInteract, onReveal, onRate }: StudyControlsProps) => {
  return (
    <div className="fixed bottom-0 w-full bg-white p-4 pb-8 border-t border-gray-100 z-20">
      {!isFlipped ? (
        <div className="w-full flex">
          <Button
            className="w-full flex-1 h-12 text-lg transition-all"
            onClick={onReveal}
            variant="primary"
            disabled={!canInteract}
          >
            {canInteract ? "Mostrar Respuesta" : "Leyendo..."}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 animate-in slide-in-from-bottom duration-300">
          {QUALITIES.map((q) => (
            <button
              key={q.val}
              onClick={(e) => { e.stopPropagation(); onRate(q.val); }}
              disabled={!canInteract}
              className={clsx(
                "flex flex-col items-center justify-center p-3 rounded-xl transition-transform active:scale-95 text-white font-bold shadow-md",
                !canInteract ? "opacity-50 cursor-not-allowed bg-gray-400" : q.color
              )}
            >
              <span className="text-sm">{q.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};