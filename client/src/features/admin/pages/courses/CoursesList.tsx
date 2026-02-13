import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Edit3, Trash2, RefreshCcw, BookOpen, Layers
} from 'lucide-react';
import { adminCoursesApi } from '../../api/courses.api';
import type { Course } from '../../../../types/admin.types';
import { useCourses } from '../../hooks/useCourses';
import { useDebounce } from '../../../../hooks/useDebounce';

// Components
import { Button } from '../../../../components/common/Button';
import { toast } from 'react-hot-toast';

export default function CoursesList() {
  const navigate = useNavigate();

  // Estado local de UI
  const [page, /* setPage */] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // Debounce de búsqueda para no machacar la API
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Hook de Data Fetching (SWR)
  const { courses, isLoading, mutate } = useCourses({
    page,
    search: debouncedSearch,
    level: levelFilter
  });

  const handleDeleteToggle = async (course: Course) => {
    if (!confirm(`¿Confirmar ${course.deletedAt ? 'restauración' : 'eliminación'}?`)) return;
    try {
      if (course.deletedAt) await adminCoursesApi.restoreCourse(course.id);
      else await adminCoursesApi.deleteCourse(course.id);

      // Actualizamos la lista localmente (revalidar)
      mutate();
    } catch (error) {
      toast.error("Error al actualizar estado del curso");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Cursos</h1>
          <p className="text-sm text-gray-500">Administra el contenido educativo.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/courses/new')}
          icon={<Plus size={18} />}
        >
          Nuevo Curso
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar curso..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
        >
          <option value="">Todos los Niveles</option>
          <option value="secundaria">Secundaria</option>
          <option value="pre_universitario">Pre-U</option>
          <option value="universitario">Universidad</option>
        </select>
      </div>

      {/* Grid de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Skeleton Loading
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>
          ))
        ) : courses.map((course) => (
          <div key={course.id} className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow relative ${course.deletedAt ? 'opacity-60 grayscale' : ''}`}>

            {course.deletedAt && (
              <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">DESHABILITADO</div>
            )}

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 line-clamp-1">{course.title}</h3>
                <p className="text-xs text-gray-500 uppercase font-bold mt-1">{course.level.replace('_', ' ')}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
              {course.description}
            </p>

            <div className="flex gap-2 border-t border-gray-100 pt-4">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                icon={<Layers size={14} />}
                onClick={() => navigate(`/admin/courses/${course.id}/structure`)}
              >
                Estructura
              </Button>
              <Button
                variant="secondary"
                className="px-3"
                icon={<Edit3 size={14} />}
                onClick={() => navigate(`/admin/courses/${course.id}/edit`)} // Editar Metadata
              />
              <button
                onClick={() => handleDeleteToggle(course)}
                className={`p-2 rounded-lg transition-colors ${course.deletedAt ? 'text-green-500 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'}`}
              >
                {course.deletedAt ? <RefreshCcw size={16} /> : <Trash2 size={16} />}
              </button>
            </div>
          </div>
        ))}
        {!isLoading && courses.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500">
            No se encontraron cursos con los filtros actuales.
          </div>
        )}
      </div>
    </div>
  );
}
