import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StatsHeader } from '../../components/layout/StatsHeader';
import { LessonNode } from '../../components/math/LessonNode';
import { GlobalLoading } from '../../components/common/GlobalLoading';
import { ChevronLeft, Map as MapIcon, Star } from 'lucide-react';
import { StartLessonModal } from '../../components/learn/StartLessonModal';
import { clsx } from 'clsx';
import { useCourseMap } from '../../hooks/useCourseMap';
import { useMapLayout } from '../../hooks/useMapLayout';
// 👇 Importamos el tipo correcto para evitar 'any'
import type { LessonMapNode } from '../../api/course.api';

export default function LearnMap() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { units, currentCourse, isLoading } = useCourseMap(courseId);
  const { getPositionClasses } = useMapLayout();
  // 👇 Estado tipado correctamente
  const [selectedLesson, setSelectedLesson] = useState<LessonMapNode | null>(null);

  if (isLoading) return <GlobalLoading />;

  return (
    // Fondo con patrón de puntos sutil para dar textura de "tablero"
    <div className="min-h-screen bg-brand-light font-sans pb-32 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">

      <StatsHeader
        currentCourse={currentCourse}
        onOpenCourseSelector={() => navigate('/learn')}
      />

      {/* Botón Flotante Volver (Mobile) - Estilo Botón Arcade */}
      <div className="fixed top-24 left-4 z-40 md:hidden">
        <button
          onClick={() => navigate('/learn')}
          className="bg-white p-3 rounded-2xl border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 text-gray-500 hover:text-brand-blue shadow-sm transition-all"
        >
          <ChevronLeft strokeWidth={3} />
        </button>
      </div>

      <div className="max-w-md mx-auto pt-28 px-4 relative">

        {/* Título del Mundo (Opcional, encima del mapa) */}
        <div className="text-center mb-8 opacity-50">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center justify-center gap-2">
            <MapIcon size={14} /> Mapa de Aprendizaje
          </span>
        </div>

        {units.map((unit, unitIndex) => {
          // Calculate unit progress
          const completedLessons = unit.lessons.filter(l => l.status === 'completed').length;
          const totalLessons = unit.lessons.length;
          const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

          return (
            <div key={unit.id} className="mb-12 relative z-10">

              {/* 🏳️ ENCABEZADO DE UNIDAD (Estilo Banner Flotante) */}
              <div className={clsx(
                "sticky top-24 z-30 mb-12 mx-2", // Sticky para que se quede arriba mientras bajas
                "bg-brand-blue text-white p-5 rounded-3xl",
                "border-b-[6px] border-blue-700 shadow-xl", // Borde inferior oscuro
                "flex flex-col items-center text-center transform hover:scale-[1.02] transition-transform"
              )}>
                {/* Decoración de estrellas en el banner */}
                <div className="absolute -top-3 -left-3 text-yellow-400 animate-bounce delay-100"><Star fill="currentColor" size={24} /></div>
                <div className="absolute -top-2 -right-2 text-yellow-400 animate-bounce"><Star fill="currentColor" size={18} /></div>

                <h2 className="font-black text-xl uppercase tracking-wider mb-1 drop-shadow-md">
                  {unit.title}
                </h2>
                <p className="text-sm text-blue-100 font-bold opacity-90 leading-tight max-w-[80%]">
                  {unit.description}
                </p>

                {/* Progress Bar */}
                <div className="w-full mt-4 space-y-2">
                  <div className="w-full bg-blue-800/40 rounded-full h-3 overflow-hidden border-2 border-blue-800/60">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-full rounded-full transition-all duration-700 ease-out shadow-lg"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs font-black text-blue-100">
                    <span className="bg-blue-800/40 px-2 py-1 rounded-lg">
                      {completedLessons}/{totalLessons} completadas
                    </span>
                    <span className="text-yellow-400">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 🗺️ CAMINO DE NODOS */}
              <div className="flex flex-col items-center gap-6 relative">

                {/* Línea conectora de fondo (El Camino) */}
                <div className="absolute top-0 bottom-0 w-3 bg-gray-200 rounded-full -z-10" />

                {unit.lessons.map((lesson, idx) => {
                  const { container, connector } = getPositionClasses(idx);

                  return (
                    <div key={lesson.id} className={container}>
                      {/* Pequeño conector horizontal hacia la línea central */}
                      <div className={connector} />

                      <LessonNode
                        lesson={lesson}
                        index={idx}
                        onClick={(clickedLesson) => setSelectedLesson(clickedLesson as LessonMapNode)}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Separador de fin de unidad (Icono de candado o meta) */}
              {unitIndex < units.length - 1 && (
                <div className="h-24 flex items-center justify-center opacity-20">
                  <div className="w-1 h-12 bg-gray-300 rounded-full border-dashed border-2 border-gray-400"></div>
                </div>
              )}
            </div>
          );
        })}

        {/* Decoración final */}
        <div className="text-center pb-10 pt-4">
          <div className="inline-block bg-gray-200 text-gray-400 px-4 py-2 rounded-full font-black text-xs uppercase">
            Próximamente más niveles...
          </div>
        </div>
      </div>

      <StartLessonModal
        lesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
      />

    </div>
  );
}