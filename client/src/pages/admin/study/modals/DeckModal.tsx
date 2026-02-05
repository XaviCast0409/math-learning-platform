import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Layers, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../../../components/common/Button';
import { Input } from '../../../../components/common/Input';
import type { Deck } from '../../../../types/admin.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Deck | null;
}

export const DeckModal = ({ isOpen, onClose, onSubmit, initialData }: Props) => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name);
      setValue('description', initialData.description);
      setValue('unit_id', initialData.unit_id);
      setValue('image_url', initialData.image_url);
    } else {
      reset({ unit_id: 1 }); // Valor por defecto temporal
    }
  }, [initialData, isOpen]);

  const onFormSubmit = async (data: any) => {
    setLoading(true);
    await onSubmit({ ...data, unit_id: Number(data.unit_id) });
    setLoading(false);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-indigo-900 p-4 flex justify-between items-center text-white rounded-t-2xl">
          <h3 className="font-bold flex items-center gap-2">
            <Layers size={18} /> {initialData ? 'Editar Mazo' : 'Nuevo Mazo'}
          </h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          <Input label="Nombre del Mazo" {...register('name', { required: true })} placeholder="Ej: Derivadas Básicas" />
          <Input label="ID Unidad" type="number" {...register('unit_id', { required: true })} placeholder="Ej: 1" />
          <Input label="Descripción" {...register('description')} placeholder="Breve descripción del contenido..." />
          <Input label="Imagen URL" {...register('image_url')} icon={<ImageIcon size={16}/>} />
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};