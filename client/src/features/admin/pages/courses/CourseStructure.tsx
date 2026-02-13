import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Edit2, Trash2, ChevronDown, ChevronRight, FileText, Zap
} from 'lucide-react';
import { adminCoursesApi } from '../../api/courses.api';
import type { Course, Unit, Lesson } from '../../../../types/admin.types';

// Componentes
import { Button } from '../../../../components/common/Button';
import { UnitModal } from './modals/UnitModal';
import { LessonModal } from './modals/LessonModal';
import { toast } from 'react-hot-toast';

export default function CourseStructure() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado para controlar qué unidades están expandidas (Acordeón)
  const [expandedUnits, setExpandedUnits] = useState<Record<number, boolean>>({});

  // Estados de Modales
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  // --- CARGAR DATOS ---
  const fetchStructure = async () => {
    if (!id) return;
    try {
      const data = await adminCoursesApi.getStructure(Number(id));
      setCourse(data);
      // Expandir la primera unidad por defecto si existe
      if (data.units && data.units.length > 0 && Object.keys(expandedUnits).length === 0) {
        setExpandedUnits({ [data.units[0].id]: true });
      }
    } catch (error) {
      console.error("Error cargando estructura", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructure();
  }, [id]);

  // --- HANDLERS UNIDADES ---
  const handleSaveUnit = async (data: any) => {
    try {
      if (editingUnit) {
        await adminCoursesApi.updateUnit(editingUnit.id, data);
      } else {
        await adminCoursesApi.createUnit(data);
      }
      fetchStructure(); // Recargar árbol
    } catch (error) {
      toast.error("Error guardando unidad");
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    if (!confirm("¿Eliminar unidad y sus lecciones?")) return;
    await adminCoursesApi.deleteUnit(unitId);
    fetchStructure();
  };

  // --- HANDLERS LECCIONES ---
  const handleSaveLesson = async (data: any) => {
    try {
      if (editingLesson) {
        await adminCoursesApi.updateLesson(editingLesson.id, data);
      } else {
        await adminCoursesApi.createLesson(data);
      }
      fetchStructure();
    } catch (error) {
      toast.error("Error guardando lección");
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("¿Eliminar lección?")) return;
    await adminCoursesApi.deleteLesson(lessonId);
    fetchStructure();
  };

  const toggleUnit = (unitId: number) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  if (loading) return <div className="p-8 text-center">Cargando estructura...</div>;
  if (!course) return <div className="p-8 text-center">Curso no encontrado</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">

      {/* MODALES */}
      <UnitModal
        isOpen={isUnitModalOpen}
        onClose={() => { setIsUnitModalOpen(false); setEditingUnit(null); }}
        onSubmit={handleSaveUnit}
        initialData={editingUnit}
        courseId={course.id}
      />
      <LessonModal
        isOpen={isLessonModalOpen}
        onClose={() => { setIsLessonModalOpen(false); setEditingLesson(null); }}
        onSubmit={handleSaveLesson}
        initialData={editingLesson}
        unitId={selectedUnitId}
      />

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/courses')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800">{course.title}</h1>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">
            Estructura del Contenido
          </span>
        </div>
      </div>

      {/* LISTA DE UNIDADES */}
      <div className="space-y-4">
        {course.units?.map((unit) => (
          <div key={unit.id} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all">

            {/* CABECERA DE UNIDAD */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100 group">
              <div
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => toggleUnit(unit.id)}
              >
                {expandedUnits[unit.id] ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{unit.title}</h3>
                  {unit.description && <p className="text-xs text-gray-500">{unit.description}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingUnit(unit); setIsUnitModalOpen(true); }}
                  className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-blue-500"
                  title="Editar Unidad"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteUnit(unit.id)}
                  className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500"
                  title="Eliminar Unidad"
                >
                  <Trash2 size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <Button
                  variant="primary"
                  className="h-8 text-xs px-3"
                  onClick={() => { setSelectedUnitId(unit.id); setIsLessonModalOpen(true); }}
                >
                  <Plus size={14} className="mr-1" /> Lección
                </Button>
              </div>
            </div>

            {/* LISTA DE LECCIONES (Acordeón) */}
            {expandedUnits[unit.id] && (
              <div className="p-2 bg-white space-y-1">
                {unit.lessons?.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-4 italic">No hay lecciones en esta unidad.</p>
                )}

                {unit.lessons?.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg group border border-transparent hover:border-blue-100 transition-colors ml-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{lesson.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1 text-yellow-600 font-bold bg-yellow-50 px-1.5 rounded">
                            <Zap size={10} fill="currentColor" /> {lesson.xp_reward} XP
                          </span>
                          <span>Orden: {lesson.order_index}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* BOTÓN CLAVE: IR A GESTIONAR CONTENIDO/EJERCICIOS */}
                      <Button
                        variant="outline"
                        className="h-8 text-xs border-gray-200 hover:border-blue-300 hover:text-blue-600"
                        onClick={() => navigate(`/admin/lessons/${lesson.id}`)} // 👈 Aún por crear esta vista
                      >
                        Contenido
                      </Button>

                      <button
                        onClick={() => { setEditingLesson(lesson); setSelectedUnitId(unit.id); setIsLessonModalOpen(true); }}
                        className="p-2 text-gray-300 hover:text-blue-500 hover:bg-white rounded-md transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-white rounded-md transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FOOTER ACTION */}
      <button
        onClick={() => { setEditingUnit(null); setIsUnitModalOpen(true); }}
        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-bold hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={20} /> Añadir Nueva Unidad
      </button>

    </div>
  );
}
