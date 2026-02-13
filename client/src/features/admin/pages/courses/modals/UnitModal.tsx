import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../../../components/common/Button';
import { Input } from '../../../../../components/common/Input';
import { Modal } from '../../../../../components/common/Modal';
import type { Unit } from '../../../../../types/admin.types';

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Unidad' : 'Nueva Unidad'}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <Input label="Título" {...register('title', { required: true })} placeholder="Ej: Unidad 1: Álgebra Básica" />
        <Input label="Descripción" {...register('description')} placeholder="Breve descripción..." />
        <Input label="Orden" type="number" {...register('order_index', { required: true })} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </form>
    </Modal>
  );
};
