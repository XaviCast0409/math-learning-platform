import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, BookOpen, Dumbbell, Plus, Trash2, Edit2, CheckCircle
} from 'lucide-react';
import { adminCoursesApi } from '../../../api/admin/courses.api';
import type { Lesson, Exercise } from '../../../types/admin.types';

// Components
import { Button } from '../../../components/common/Button';
import { ExerciseModal } from './modals/ExerciseModal';
import { RichText } from '../../../components/common/RichText'; // Para previsualizar
import { toast } from 'react-hot-toast';

export default function LessonContentEditor() {
  const { id } = useParams<{ id: string }>(); // lessonId
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'theory' | 'exercises'>('theory');

  // Estado para la Teoría
  const [theoryContent, setTheoryContent] = useState('');
  const [savingTheory, setSavingTheory] = useState(false);

  // Estado para Ejercicios
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const fetchLessonData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Este endpoint debe traer la lección + ejercicios (lo configuramos en LessonController)
      const data = await adminCoursesApi.getLessonDetail(Number(id));
      setLesson(data);
      setTheoryContent(data.theory_content || '');
      setExercises(data.exercises || []);
    } catch (error) {
      console.error("Error cargando lección", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonData();
  }, [id]);

  // --- LOGICA TEORÍA ---
  const handleSaveTheory = async () => {
    if (!lesson) return;
    setSavingTheory(true);
    try {
      await adminCoursesApi.updateLesson(lesson.id, { theory_content: theoryContent });
      toast.success("Teoría guardada correctamente");
    } catch (error) {
      toast.error("Error al guardar teoría");
    } finally {
      setSavingTheory(false);
    }
  };

  // --- LOGICA EJERCICIOS ---
  const handleSaveExercise = async (data: any) => {
    try {
      if (editingExercise) {
        await adminCoursesApi.updateExercise(editingExercise.id, data);
      } else {
        await adminCoursesApi.createExercise(data);
      }
      fetchLessonData(); // Recargar lista
    } catch (error) {
      toast.error("Error guardando ejercicio");
    }
  };

  const handleDeleteExercise = async (exId: number) => {
    if (!confirm("¿Eliminar ejercicio?")) return;
    try {
      await adminCoursesApi.deleteExercise(exId);
      // Actualizar estado local para que sea más rápido
      setExercises(prev => prev.filter(e => e.id !== exId));
    } catch (error) {
      toast.error("Error eliminando ejercicio");
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando editor...</div>;
  if (!lesson) return <div className="p-8 text-center">Lección no encontrada</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">

      {/* HEADER NAVEGACIÓN */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/admin/courses/${lesson.unit_id}/structure`)} // Volver al árbol
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-800">{lesson.title}</h1>
            <p className="text-sm text-gray-500">Editor de Contenido</p>
          </div>
        </div>

        {/* TABS SWITCHER */}
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'theory' ? 'bg-white shadow text-brand-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <BookOpen size={16} /> Teoría
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'exercises' ? 'bg-white shadow text-brand-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Dumbbell size={16} /> Ejercicios ({exercises.length})
          </button>
        </div>
      </div>

      {/* --- CONTENIDO PESTAÑA: TEORÍA --- */}
      {activeTab === 'theory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Editor (Izquierda) */}
          <div className="flex flex-col gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col">
              <label className="text-xs font-bold text-gray-400 uppercase mb-2">Editor Markdown / LaTeX</label>
              <textarea
                className="flex-1 w-full p-4 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={theoryContent}
                onChange={(e) => setTheoryContent(e.target.value)}
                placeholder="Escribe aquí... Usa $$ formula $$ para matemáticas."
              />
            </div>
            <Button onClick={handleSaveTheory} disabled={savingTheory} icon={<Save size={18} />}>
              {savingTheory ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>

          {/* Previsualización (Derecha) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-y-auto">
            <label className="text-xs font-bold text-gray-400 uppercase mb-4 block border-b pb-2">Vista Previa (Como lo verá el alumno)</label>
            <div className="prose max-w-none">
              {/* Reutilizamos tu componente RichText existente */}
              <RichText content={theoryContent || '*Sin contenido aún...*'} />
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENIDO PESTAÑA: EJERCICIOS --- */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          <ExerciseModal
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setEditingExercise(null); }}
            onSubmit={handleSaveExercise}
            initialData={editingExercise}
            lessonId={lesson.id}
          />

          <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex gap-3 items-center text-blue-800">
              <div className="bg-white p-2 rounded-full"><CheckCircle size={20} /></div>
              <p className="text-sm font-bold">Estos ejercicios aparecerán al final de la lección.</p>
            </div>
            <Button onClick={() => { setEditingExercise(null); setIsModalOpen(true); }} icon={<Plus size={18} />}>
              Agregar Ejercicio
            </Button>
          </div>

          <div className="space-y-3">
            {exercises.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400 font-bold">No hay ejercicios creados.</p>
              </div>
            )}

            {exercises.map((ex, index) => (
              <div key={ex.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start gap-4">
                <div className="flex gap-4">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs shrink-0 ${ex.difficulty === 1 ? 'bg-green-100 text-green-700' :
                    ex.difficulty === 2 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                    {ex.difficulty}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm mb-1">
                      <span className="text-gray-400 mr-2">#{index + 1}</span>
                      <RichText content={ex.prompt} />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                        {ex.type === 'multiple_choice' ? 'Opción Múltiple' : ex.type}
                      </span>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                        Rpta: {ex.correct_answer}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => { setEditingExercise(ex); setIsModalOpen(true); }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteExercise(ex.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}