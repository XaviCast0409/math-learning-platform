import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Shield, ChevronRight, Loader2 } from 'lucide-react';
import { useClan } from '../hooks/useClan';
import { ClanEmblem } from '../components/ClanEmblem';
import type { Clan } from '../api/clan.api';

export default function ClanBrowser() {
  const { actions } = useClan();
  // Extraemos la función específica para que sea una dependencia estable
  // actions cambia si cambia myClan, pero searchClans es estable (useCallback [])
  const { searchClans } = actions;

  const [query, setQuery] = useState('');
  const [searchList, setSearchList] = useState<Clan[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Si no hay query, limpiar lista
    if (!query.trim()) {
      setSearchList([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchClans(query);
        setSearchList(results);
      } catch (error) {
        console.error(error);
        setSearchList([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, searchClans]);

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-600 active:scale-95 transition-transform">
            <ArrowLeft />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar clan por nombre..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm font-bold transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Lista de Resultados */}
      <div className="max-w-md mx-auto p-4 space-y-3">

        {/* 👇 ESTADO DE CARGA SUAVE */}
        {isSearching && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 animate-in fade-in duration-300">
            <Loader2 size={32} className="text-brand-blue animate-spin mb-3" />
            <span className="text-xs font-bold tracking-widest uppercase opacity-70">Buscando...</span>
          </div>
        )}

        {/* 👇 ESTADO VACÍO */}
        {!isSearching && query.trim() !== '' && searchList.length === 0 && (
          <div className="text-center py-20 text-gray-400 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <Shield size={48} className="text-gray-200 mb-3" />
            <p className="font-medium">No se encontraron clanes.</p>
            <p className="text-xs mt-1">Intenta con otro nombre.</p>
          </div>
        )}

        {/* 👇 ESTADO INICIAL (Query vacía) */}
        {!isSearching && query.trim() === '' && (
          <div className="text-center py-20 text-gray-300 flex flex-col items-center">
            <Search size={48} className="text-gray-200 mb-3" />
            <p className="font-medium">Escribe para buscar un clan...</p>
          </div>
        )}

        {/* 👇 LISTA DE RESULTADOS */}
        {!isSearching && searchList.map((clan) => (
          <div
            key={clan.id}
            onClick={() => navigate(`/clan/${clan.id}`)}
            className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.98] animate-in slide-in-from-bottom-2 duration-300"
          >
            <div className="flex items-center gap-3">

              {/* 👇 EMBLEMA REAL DEL CLAN */}
              <div className="w-12 h-12 flex-shrink-0">
                <ClanEmblem
                  emblemId={clan.emblem_id}
                  className="w-full h-full border border-gray-100 shadow-sm"
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-800 leading-tight">{clan.name}</h3>
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-gray-600">
                    Nvl {clan.level}
                  </span>
                  <span>• {clan.members_count}/30</span>
                </p>
              </div>
            </div>

            <div className="text-gray-300">
              <ChevronRight size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

