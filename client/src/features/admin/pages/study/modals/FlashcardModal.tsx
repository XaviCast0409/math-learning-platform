import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, CreditCard, Eye } from 'lucide-react';
import { Button } from '../../../../../components/common/Button';
import { RichText } from '../../../../../components/common/RichText'; // Tu componente existente
import type { Flashcard } from '../../../../../types/admin.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Flashcard | null;
  deckId: number;
}

export const FlashcardModal = ({ isOpen, onClose, onSubmit, initialData, deckId }: Props) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [loading, setLoading] = useState(false);

  // Observamos los inputs para la vista previa en tiempo real
  const frontValue = watch('front', '');
  const backValue = watch('back', '');

  useEffect(() => {
    if (initialData) {
      setValue('front', initialData.front);
      setValue('back', initialData.back);
    } else {
      reset({ front: '', back: '' });
    }
  }, [initialData, isOpen]);

  const onFormSubmit = async (data: any) => {
    setLoading(true);
    await onSubmit({ ...data, deck_id: deckId });
    setLoading(false);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Modal Ancho para ver el preview */}
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white rounded-t-2xl shrink-0">
          <h3 className="font-bold flex items-center gap-2">
            <CreditCard size={18} /> {initialData ? 'Editar Flashcard' : 'Nueva Flashcard'}
          </h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        {/* Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="card-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 h-full flex flex-col">

            {/* ZONA DE EDICIÓN Y PREVIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">

              {/* Lado Izquierdo: INPUTS */}
              <div className="space-y-4 flex flex-col">
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Frente (Pregunta)</label>
                  <textarea
                    {...register('front', { required: true })}
                    className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                    placeholder="Escribe aquí... Usa $$ x^2 $$ para fórmulas."
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Reverso (Respuesta)</label>
                  <textarea
                    {...register('back', { required: true })}
                    className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                    placeholder="La respuesta es..."
                  />
                </div>
              </div>

              {/* Lado Derecho: VISTA PREVIA */}
              <div className="bg-indigo-50 rounded-xl border-2 border-indigo-100 p-4 flex flex-col overflow-y-auto">
                <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm mb-4">
                  <Eye size={16} /> Vista Previa (Alumno)
                </div>

                <div className="space-y-6">
                  {/* Preview Frente */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[100px] flex items-center justify-center text-center">
                    <RichText content={frontValue || '*Frente vacío*'} />
                  </div>

                  {/* Preview Reverso */}
                  <div className="bg-indigo-600 p-6 rounded-xl shadow-sm border border-indigo-500 min-h-[100px] flex items-center justify-center text-center text-white">
                    {/* Truco: RichText suele tener texto negro, forzamos blanco si es necesario o usamos un contenedor */}
                    <div className="prose-invert">
                      <RichText content={backValue || '*Reverso vacío*'} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-2 shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="card-form" variant="primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Tarjeta'}
          </Button>
        </div>
      </div>
    </div>
  );
};
