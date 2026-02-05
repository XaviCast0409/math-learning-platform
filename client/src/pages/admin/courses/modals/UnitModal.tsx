import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Layers } from 'lucide-react';
import { Button } from '../../../../components/common/Button';
import { Input } from '../../../../components/common/Input';
import type { Unit } from '../../../../types/admin.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Unit | null;
  courseId: number;
}

export const UnitModal = ({ isOpen, onClose, onSubmit, initialData, courseId }: Props) => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setValue('title', initialData.title);
      setValue('description', initialData.description);
      setValue('order_index', initialData.order_index);
    } else {
      reset({ order_index: 1 }); // Valor por defecto
    }
  }, [initialData, isOpen]);

  const onFormSubmit = async (data: any) => {
    setLoading(true);
    await onSubmit({ ...data, course_id: courseId });
    setLoading(false);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">
            <Layers size={18} /> {initialData ? 'Editar Unidad' : 'Nueva Unidad'}
          </h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          <Input label="Título" {...register('title', { required: true })} placeholder="Ej: Unidad 1: Álgebra Básica" />
          <Input label="Descripción" {...register('description')} placeholder="Breve descripción..." />
          <Input label="Orden" type="number" {...register('order_index', { required: true })} />
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};