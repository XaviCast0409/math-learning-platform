import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../../../components/common/Button';
import { Input } from '../../../../../components/common/Input';
import { Modal } from '../../../../../components/common/Modal';
import type { Lesson } from '../../../../../types/admin.types';

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Lección' : 'Nueva Lección'}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
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
    </Modal>
  );
};
