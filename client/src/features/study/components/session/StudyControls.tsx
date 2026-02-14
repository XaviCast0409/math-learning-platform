import { clsx } from 'clsx';
import { Button } from '../../../../components/common/Button';

const QUALITIES = [
  { val: 1, label: 'Olvidé', emoji: '😰', color: 'bg-red-500', nextReview: '1 día' },
  { val: 3, label: 'Difícil', emoji: '😐', color: 'bg-yellow-500', nextReview: '2 días' },
  { val: 4, label: 'Bien', emoji: '😊', color: 'bg-blue-500', nextReview: '3 días' },
  { val: 5, label: 'Fácil', emoji: '🎉', color: 'bg-green-500', nextReview: '7 días' },
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
        <div className="w-full flex flex-col gap-2">
          <Button
            className="w-full flex-1 h-12 text-lg transition-all"
            onClick={onReveal}
            variant="primary"
            disabled={!canInteract}
          >
            {canInteract ? "Mostrar Respuesta" : "Leyendo..."}
          </Button>
          <div className="text-xs text-gray-400 text-center">
            Atajo: <kbd className="px-2 py-1 bg-gray-100 rounded font-mono">ESPACIO</kbd>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 animate-in slide-in-from-bottom duration-300">
            {QUALITIES.map((q) => (
              <button
                key={q.val}
                onClick={(e) => { e.stopPropagation(); onRate(q.val); }}
                disabled={!canInteract}
                className={clsx(
                  "flex flex-col items-center justify-center p-3 rounded-xl transition-all active:scale-95 text-white font-bold shadow-md border-2 border-black/10",
                  !canInteract ? "opacity-50 cursor-not-allowed bg-gray-400" : q.color
                )}
              >
                <span className="text-2xl mb-1">{q.emoji}</span>
                <span className="text-xs font-black">{q.label}</span>
                <span className="text-[10px] opacity-80 mt-0.5">{q.nextReview}</span>
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400 text-center">
            Atajos: <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono text-[10px]">1</kbd>{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono text-[10px]">2</kbd>{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono text-[10px]">3</kbd>{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono text-[10px]">4</kbd>
          </div>
        </div>
      )}
    </div>
  );
};
