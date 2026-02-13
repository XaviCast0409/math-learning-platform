import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle } from 'lucide-react';
import { Button } from '../../../../../components/common/Button';
import { Input } from '../../../../../components/common/Input';
import { Modal } from '../../../../../components/common/Modal';
import type { Exercise } from '../../../../../types/admin.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Exercise | null;
  lessonId: number;
}

export const ExerciseModal = ({ isOpen, onClose, onSubmit, initialData, lessonId }: Props) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [loading, setLoading] = useState(false);

  // Observamos el tipo para cambiar el formulario dinámicamente
  const exerciseType = watch('type', 'multiple_choice');

  useEffect(() => {
    if (initialData) {
      setValue('prompt', initialData.prompt);
      setValue('type', initialData.type);
      setValue('difficulty', initialData.difficulty);
      setValue('correct_answer', initialData.correct_answer);
      setValue('solution_explanation', initialData.solution_explanation);

      // Cargar opciones si existen (Asumimos formato { a: '', b: '', ... })
      if (initialData.options && typeof initialData.options === 'object') {
        Object.entries(initialData.options).forEach(([key, val]) => {
          setValue(`options.${key}`, val);
        });
      }
    } else {
      reset({
        type: 'multiple_choice',
        difficulty: 1,
        // Valores por defecto para opciones vacías
        options: { a: '', b: '', c: '', d: '' }
      });
    }
  }, [initialData, isOpen]);

  const onFormSubmit = async (data: any) => {
    setLoading(true);

    // Limpieza de datos según el tipo
    let formattedData = { ...data, lesson_id: lessonId };

    if (data.type === 'multiple_choice') {
      // Asegurar que options sea un objeto limpio
      formattedData.options = {
        a: data.options.a,
        b: data.options.b,
        c: data.options.c,
        d: data.options.d
      };
    } else if (data.type === 'true_false') {
      formattedData.options = { true: 'Verdadero', false: 'Falso' };
    } else {
      formattedData.options = {}; // Fill in no lleva opciones
    }

    await onSubmit(formattedData);
    setLoading(false);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">

        {/* Fila 1: Tipo y Dificultad */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Pregunta</label>
            <select
              {...register('type')}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="multiple_choice">Opción Múltiple</option>
              <option value="true_false">Verdadero / Falso</option>
              <option value="fill_in">Completar (Escribir respuesta)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dificultad (1-3)</label>
            <select
              {...register('difficulty')}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="1">1 - Fácil (Novato)</option>
              <option value="2">2 - Media (Estándar)</option>
              <option value="3">3 - Difícil (Desafío)</option>
            </select>
          </div>
        </div>

        {/* Pregunta (Prompt) */}
        <Input
          label="Enunciado de la Pregunta (Soporta LaTeX entre $$ $$)"
          {...register('prompt', { required: true })}
          placeholder="Ej: Calcula el valor de $$ x^2 $$ si x=3"
        />

        {/* ZONA DE OPCIONES (Dinámica) */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
          <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" /> Configuración de Respuesta
          </h4>

          {exerciseType === 'multiple_choice' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Opción A" {...register('options.a', { required: true })} placeholder="Respuesta A" />
              <Input label="Opción B" {...register('options.b', { required: true })} placeholder="Respuesta B" />
              <Input label="Opción C" {...register('options.c', { required: true })} placeholder="Respuesta C" />
              <Input label="Opción D" {...register('options.d', { required: true })} placeholder="Respuesta D" />

              <div className="col-span-1 md:col-span-2 mt-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">¿Cuál es la correcta?</label>
                <select {...register('correct_answer')} className="w-full p-2 border border-green-300 bg-green-50 rounded-lg">
                  <option value="a">Opción A</option>
                  <option value="b">Opción B</option>
                  <option value="c">Opción C</option>
                  <option value="d">Opción D</option>
                </select>
              </div>
            </div>
          )}

          {exerciseType === 'true_false' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Respuesta Correcta</label>
              <select {...register('correct_answer')} className="w-full p-2 border border-green-300 bg-green-50 rounded-lg">
                <option value="true">Verdadero</option>
                <option value="false">Falso</option>
              </select>
              <p className="text-xs text-gray-400 mt-2">* Las opciones se generarán automáticamente.</p>
            </div>
          )}

          {exerciseType === 'fill_in' && (
            <Input
              label="Respuesta Exacta (Lo que debe escribir el usuario)"
              {...register('correct_answer', { required: true })}
              placeholder="Ej: 25"
              className="border-green-300 bg-green-50"
            />
          )}
        </div>

        {/* Explicación */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase">Explicación de la Solución (Opcional)</label>
          <textarea
            {...register('solution_explanation')}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            placeholder="Explica paso a paso por qué es la respuesta correcta (Soporta LaTeX)..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Ejercicio'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
