import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Book, Image as ImageIcon } from 'lucide-react';
import { adminCoursesApi } from '../../../api/admin/courses.api';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';

export default function CreateCourse() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // 1. Crear el curso en el backend
      const newCourse = await adminCoursesApi.createCourse(data);
      
      // 2. Redirigir inmediatamente a la vista de "Estructura" (Árbol) 
      // para que empieces a agregarle unidades.
      navigate(`/admin/courses/${newCourse.id}/structure`);
      
    } catch (error) {
      console.error(error);
      alert("Error al crear el curso. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/admin/courses')} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={20} /> Volver a la lista
      </button>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
          <div className="bg-brand-blue p-3 rounded-xl text-white">
            <Book size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">Nuevo Curso</h1>
            <p className="text-sm text-gray-500">Información básica del curso</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input 
            label="Título del Curso"
            {...register("title", { required: "El título es obligatorio" })}
            placeholder="Ej: Aritmética Avanzada"
            error={errors.title?.message as string}
          />

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
             <textarea 
               {...register("description", { required: "La descripción es obligatoria" })}
               rows={3}
               className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
               placeholder="¿De qué trata este curso?"
             />
             {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nivel Académico</label>
                <select 
                  {...register("level", { required: true })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="secundaria">Secundaria</option>
                  <option value="pre_universitario">Pre-Universitario</option>
                  <option value="universitario">Universitario</option>
                </select>
             </div>

             <Input 
               label="URL de Imagen (Portada)"
               {...register("img_url")}
               placeholder="https://..."
               icon={<ImageIcon size={18} />}
             />
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full md:w-auto"
              disabled={loading}
              icon={<Save size={18} />}
            >
              {loading ? 'Creando...' : 'Crear y Editar Estructura'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}