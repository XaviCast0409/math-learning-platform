import { useNavigate } from 'react-router-dom';
import { Layers, ChevronRight, BookOpen } from 'lucide-react';
import type { DeckSummary } from '../../api/study.api';

export const DeckCard = ({ deck }: { deck: DeckSummary }) => {
  const navigate = useNavigate();
  
  // Extraemos títulos de forma segura
  // Nota: Asegúrate de que tu interfaz DeckSummary tenga: Unit?: { title: string, Course?: { title: string } }
  const courseTitle = deck.Unit?.Course?.title;
  const unitTitle = deck.Unit?.title;

  return (
    <div
      onClick={() => navigate(`/study/session/${deck.id}`)}
      className="bg-white rounded-2xl p-4 border-2 border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-brand-blue transition-colors active:scale-95 group"
    >
      <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-100 transition-colors">
        {deck.image_url ? (
          <img src={deck.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
        ) : (
          <Layers size={28} />
        )}
      </div>
      
      <div className="flex-1 min-w-0"> {/* min-w-0 evita que el texto se salga */}
        
        {/* 👇 BREADCRUMB: CURSO • UNIDAD */}
        {(courseTitle || unitTitle) && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            <BookOpen size={10} className="shrink-0" />
            
            <div className="truncate flex gap-1">
               {courseTitle && <span className="text-brand-blue">{courseTitle}</span>}
               {courseTitle && unitTitle && <span>•</span>}
               {unitTitle && <span>{unitTitle}</span>}
            </div>
          </div>
        )}

        <h3 className="font-bold text-gray-800 leading-tight truncate">{deck.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
          {deck.description || 'Repaso espaciado'}
        </p>
      </div>

      <ChevronRight className="text-gray-300 group-hover:text-brand-blue transition-colors shrink-0" />
    </div>
  );
};