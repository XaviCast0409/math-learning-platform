import { useState, useEffect } from 'react';
import { Book, Search, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { clsx } from 'clsx'; // 👈 Necesario para los estilos de los tabs
import { MainLayout } from '../../../components/layout/MainLayout';
import { studyApi, type DeckSummary } from '../api/study.api';
import { DeckCard } from '../components/DeckCard';
import { RewardsTable } from '../components/RewardsTable';

// Interfaz para el filtro
interface CourseOption { id: number; title: string; }

export default function StudyHub() {
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Paginación y Búsqueda
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // 👇 FILTRO DE CURSO
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(undefined);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  // 1. Cargar lista de cursos al montar (para el filtro)
  useEffect(() => {
    const loadCourses = async () => {
      try {
        // Asegúrate de tener este método o usa uno equivalente de tu API
        const allCourses = await studyApi.getCoursesList();
        setCourses(allCourses);
      } catch (e) {
        console.error("Error cargando cursos para filtro", e);
      }
    };
    loadCourses();
  }, []);

  // 2. Cargar Mazos (Debounce incluido)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDecks();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, searchTerm, selectedCourseId]); // 👈 Se recarga si cambia el curso

  const fetchDecks = async () => {
    setLoading(true);
    try {
      // Pasamos el curso seleccionado a la API
      const data = await studyApi.getAllDecks(page, searchTerm, selectedCourseId);

      setDecks(data.decks);
      setTotalPages(data.totalPages);

      // Reset a página 1 si el filtro actual no tiene resultados en la página actual
      if (data.totalItems > 0 && data.decks.length === 0 && page > 1) {
        setPage(1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handler para cambiar de pestaña
  const handleCourseChange = (id: number | undefined) => {
    setSelectedCourseId(id);
    setPage(1); // Siempre volver a pág 1 al cambiar filtro
  };

  return (
    <MainLayout>
      <div className="p-4 space-y-6 pb-24">
        <header>
          <h1 className="text-2xl font-black text-gray-800">Centro de Repaso 🧠</h1>
          <p className="text-gray-500 text-sm">Estudia 20 minutos al día para ganar gemas.</p>
        </header>

        {/* Rewards Table */}
        <RewardsTable />

        {/* 👇 BARRA DE FILTRO DE CURSOS (Scroll Horizontal) */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {/* Botón "Todos" */}
          <button
            onClick={() => handleCourseChange(undefined)}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2",
              selectedCourseId === undefined
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            )}
          >
            Todos
          </button>

          {/* Botones Dinámicos */}
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => handleCourseChange(course.id)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2",
                selectedCourseId === course.id
                  ? "bg-brand-blue text-white border-brand-blue shadow-md"
                  : "bg-white text-gray-500 border-gray-200 hover:border-brand-blue/50"
              )}
            >
              {course.title}
            </button>
          ))}
        </div>

        {/* 🔍 BARRA DE BÚSQUEDA */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar mazo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none transition-colors"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
        </div>

        {/* 📦 LISTA DE MAZOS */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="animate-spin text-brand-blue mb-2" size={32} />
            <p className="text-gray-400 text-sm">Cargando mazos...</p>
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Book size={48} className="mx-auto mb-2 opacity-50" />
            <p>No encontramos mazos.</p>
            {(searchTerm || selectedCourseId) && (
              <button
                onClick={() => { setSearchTerm(''); handleCourseChange(undefined); }}
                className="text-brand-blue font-bold text-sm mt-2 hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        )}

        {/* ⏭️ PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-600"
            >
              <ArrowLeft size={24} />
            </button>

            <span className="font-bold text-gray-400 text-sm">
              Página {page} de {totalPages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-600"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
