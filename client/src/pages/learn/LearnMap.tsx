import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi, type UnitMap, type CourseSummary } from '../../api/course.api';
import { StatsHeader } from '../../components/layout/StatsHeader';
import { LessonNode } from '../../components/math/LessonNode';
import { GlobalLoading } from '../../components/common/GlobalLoading';
import { ChevronLeft, Map as MapIcon, Star } from 'lucide-react';
import { StartLessonModal } from '../../components/learn/StartLessonModal';
import { clsx } from 'clsx';

export default function LearnMap() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [units, setUnits] = useState<UnitMap[]>([]);
  const [currentCourse, setCurrentCourse] = useState<CourseSummary | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);

  useEffect(() => {
    const initData = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        const mapData = await courseApi.getCourseMap(Number(courseId));
        // @ts-ignore
        setUnits(mapData.units || []);
        
        const allCourses = await courseApi.getAllCourses();
        const found = allCourses.find(c => c.id === Number(courseId));
        setCurrentCourse(found);
      } catch (error) {
        console.error("Error", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [courseId]);

  if (loading) return <GlobalLoading />;

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

         {units.map((unit, unitIndex) => (
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
                </div>
                
                {/* 🗺️ CAMINO DE NODOS */}
                <div className="flex flex-col items-center gap-6 relative">
                  
                  {/* Línea conectora de fondo (El Camino) */}
                  <div className="absolute top-0 bottom-0 w-3 bg-gray-200 rounded-full -z-10" />

                  {unit.lessons.map((lesson, idx) => {
                    // Lógica para el "Zig Zag" (Snake Layout)
                    // Movemos los nodos izquierda/derecha para que parezca un camino
                    const offsetClass = idx % 2 === 0 ? '-translate-x-8' : 'translate-x-8';
                    
                    return (
                        <div key={lesson.id} className={clsx("relative transition-transform duration-300", offsetClass)}>
                            {/* Pequeño conector horizontal hacia la línea central */}
                            <div className={clsx(
                                "absolute top-1/2 w-10 h-3 bg-gray-200 -z-10 rounded-full",
                                idx % 2 === 0 ? "left-full -ml-2" : "right-full -mr-2"
                            )} />

                            <LessonNode 
                              lesson={lesson} 
                              index={idx} 
                              onClick={(clickedLesson) => setSelectedLesson(clickedLesson)}
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
         ))}

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