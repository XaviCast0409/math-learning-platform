import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, BookOpen } from 'lucide-react';
import { Button } from '../../../../components/common/Button';
import { Input } from '../../../../components/common/Input';
import type { Lesson } from '../../../../types/admin.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Lesson | null;
  unitId: number | null;
}

export const LessonModal = ({ isOpen, onClose, onSubmit, initialData, unitId }: Props) => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setValue('title', initialData.title);
      setValue('xp_reward', initialData.xp_reward);
      setValue('order_index', initialData.order_index);
      // theory_content se editará en otra pantalla más compleja
    } else {
      reset({ xp_reward: 20, order_index: 1 });
    }
  }, [initialData, isOpen]);

  const onFormSubmit = async (data: any) => {
    if (!unitId && !initialData) return;
    setLoading(true);
    await onSubmit({ ...data, unit_id: unitId });
    setLoading(false);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-brand-blue p-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">
            <BookOpen size={18} /> {initialData ? 'Editar Lección' : 'Nueva Lección'}
          </h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          <Input label="Título" {...register('title', { required: true })} placeholder="Ej: Suma de Polinomios" />
          <div className="grid grid-cols-2 gap-4">
             <Input label="XP Recompensa" type="number" {...register('xp_reward', { required: true })} />
             <Input label="Orden" type="number" {...register('order_index', { required: true })} />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};