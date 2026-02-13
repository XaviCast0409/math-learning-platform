import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Layers, Edit, Eye, EyeOff } from 'lucide-react';
import { studyApi } from '../../api/study.api';
import type { Deck } from '../../../../types/admin.types';

import { Button } from '../../../../components/common/Button';
import { DeckModal } from './modals/DeckModal';
import { toast } from 'react-hot-toast';

export default function DecksList() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [unitFilter, setUnitFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  const fetchDecks = async () => {
    setLoading(true);
    try {
      const response = await studyApi.getAllDecks({
        page: 1,
        search,
        unit_id: unitFilter ? Number(unitFilter) : undefined
      });
      setDecks(response.decks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, [unitFilter, search]);

  const handleSave = async (data: any) => {
    try {
      if (editingDeck) {
        await studyApi.updateDeck(editingDeck.id, data);
      } else {
        await studyApi.createDeck(data);
      }
      fetchDecks();
    } catch (error) {
      toast.error("Error al guardar mazo");
    }
  };

  const handleToggle = async (deck: Deck) => {
    try {
      await studyApi.toggleDeck(deck.id);
      setDecks(prev => prev.map(d => d.id === deck.id ? { ...d, active: !d.active } : d));
    } catch (error) {
      toast.error("Error cambiando estado");
    }
  };

  return (
    <div className="space-y-6">
      <DeckModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingDeck}
      />

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Mazos de Estudio</h1>
          <p className="text-sm text-gray-500">Gestiona flashcards para el sistema de repaso.</p>
        </div>
        <Button variant="primary" onClick={() => { setEditingDeck(null); setModalOpen(true); }} icon={<Plus size={18} />}>
          Nuevo Mazo
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar mazo..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input
          type="number"
          placeholder="ID Unidad..."
          className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p>Cargando mazos...</p> : decks.map(deck => (
          <div key={deck.id} className={`bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all ${!deck.active ? 'opacity-60 grayscale' : ''}`}>
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                {deck.image_url ? (
                  <img src={deck.image_url} className="w-8 h-8 object-contain" alt="" />
                ) : (
                  <Layers size={24} />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 line-clamp-1">{deck.name}</h3>
                <span className="text-xs font-bold text-gray-400 uppercase">UNIDAD {deck.unit_id}</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">{deck.description}</p>

            <div className="flex gap-2 border-t border-gray-100 pt-4">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => navigate(`/admin/study/decks/${deck.id}`)}
              >
                Gestionar Cartas
              </Button>
              <button
                onClick={() => { setEditingDeck(deck); setModalOpen(true); }}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleToggle(deck)}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                title={deck.active ? 'Desactivar' : 'Activar'}
              >
                {deck.active ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
