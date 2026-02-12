import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Sparkles, GraduationCap } from 'lucide-react';
import { type CourseSummary } from '../../api/course.api';
import { StatsHeader } from '../../components/layout/StatsHeader';
import { GlobalLoading } from '../../components/common/GlobalLoading';
import { clsx } from 'clsx';
import { useStudentCourses } from '../../hooks/useStudentCourses';

export default function CoursesLobby() {
  const navigate = useNavigate();
  const { courses, isLoading } = useStudentCourses();


  if (isLoading) return <GlobalLoading />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-32">

      {/* HUD Superior */}
      <StatsHeader onOpenCourseSelector={() => { }} />

      {/* Contenedor más estrecho para que parezca una lista de app móvil */}
      <div className="max-w-2xl mx-auto pt-24 px-4 relative z-10">

        {/* Encabezado Simple */}
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <GraduationCap className="text-brand-blue" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight leading-none">
              Mis Asignaturas
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
              Selecciona para continuar
            </p>
          </div>
        </div>

        {/* LISTA VERTICAL DE FILAS */}
        <div className="flex flex-col gap-3">
          {courses.length > 0 ? courses.map((course, index) => (

            <div
              key={course.id}
              onClick={() => navigate(`/learn/course/${course.id}`)}
              className={clsx(
                "group w-full bg-white p-3 rounded-2xl flex items-center gap-4 cursor-pointer relative overflow-hidden",
                // Bordes suaves pero con el toque 3D en la parte inferior
                "border-2 border-gray-100 border-b-[4px]",
                "hover:border-brand-blue hover:shadow-md transition-all duration-200",
                "active:border-b-2 active:translate-y-[2px] active:shadow-none" // Efecto click
              )}
            >
              {/* 1. ÍCONO IZQUIERDO (Cuadrado con esquinas redondeadas) */}
              <div className={clsx(
                "w-16 h-16 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                // Colores alternados manteniendo tu identidad
                index % 3 === 0 ? "bg-blue-100 text-brand-blue" :
                  index % 3 === 1 ? "bg-green-100 text-green-600" :
                    "bg-orange-100 text-orange-600"
              )}>
                {course.img_url ? (
                  <img src={course.img_url} className="w-10 h-10 object-contain" alt={course.title} />
                ) : (
                  <BookOpen size={28} strokeWidth={2.5} />
                )}
              </div>

              {/* 2. CONTENIDO CENTRAL */}
              <div className="flex-1 min-w-0 py-1">

                {/* Breadcrumb / Etiqueta Superior */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={clsx(
                    "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1",
                    index % 3 === 0 ? "bg-blue-50 text-blue-400" :
                      index % 3 === 1 ? "bg-green-50 text-green-400" :
                        "bg-orange-50 text-orange-400"
                  )}>
                    <BookOpen size={8} />
                    {course.level?.replace('_', ' ') || 'GENERAL'}
                  </span>
                </div>

                {/* Título Principal */}
                <h2 className="text-lg font-black text-gray-800 leading-tight truncate group-hover:text-brand-blue transition-colors">
                  {course.title}
                </h2>

                {/* Descripción corta (Opcional, si la API la trae, sino un texto default) */}
                <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                  {course.description || 'Toca para ver las unidades disponibles.'}
                </p>
              </div>

              {/* 3. FLECHA DERECHA (Discreta) */}
              <div className="pr-2 text-gray-300 group-hover:text-brand-blue transition-colors">
                <ChevronRight size={24} strokeWidth={3} />
              </div>

            </div>
          )) : (
            // ESTADO VACÍO
            <div className="text-center py-12 px-6 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-gray-300" size={24} />
              </div>
              <p className="text-gray-400 text-sm font-bold">No hay cursos disponibles aún.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}