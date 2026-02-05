import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Layers } from 'lucide-react';
import { studyApi } from '../../../api/admin/study.api';
import type { Deck, Flashcard } from '../../../types/admin.types';

import { Button } from '../../../components/common/Button';
import { RichText } from '../../../components/common/RichText';
import { FlashcardModal } from './modals/FlashcardModal';

export default function DeckDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Flashcard
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const deckData = await studyApi.getDeckById(Number(id));
      setDeck(deckData);
      const cardsData = await studyApi.getCardsByDeck(Number(id));
      setCards(cardsData.flashcards);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleSaveCard = async (data: any) => {
    try {
      if (editingCard) {
        await studyApi.updateCard(editingCard.id, data);
      } else {
        await studyApi.createCard(data);
      }
      fetchDetails();
    } catch (error) {
      alert("Error guardando carta");
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if(!confirm("¿Borrar flashcard?")) return;
    try {
       await studyApi.deleteCard(cardId);
       setCards(prev => prev.filter(c => c.id !== cardId));
    } catch (error) {
       alert("Error eliminando");
    }
  }

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (!deck) return <div className="p-10 text-center">Mazo no encontrado</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <FlashcardModal 
         isOpen={modalOpen} 
         onClose={() => setModalOpen(false)} 
         onSubmit={handleSaveCard}
         initialData={editingCard}
         deckId={deck.id}
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/study/decks')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600"/>
        </button>
        <div>
           <div className="flex items-center gap-2">
              <Layers size={20} className="text-indigo-600"/>
              <h1 className="text-2xl font-black text-gray-800">{deck.name}</h1>
           </div>
           <p className="text-sm text-gray-500 ml-7">{deck.description} • {cards.length} Cartas</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
         <p className="text-indigo-800 font-bold text-sm">Gestiona el contenido de repaso.</p>
         <Button 
           variant="primary" 
           onClick={() => { setEditingCard(null); setModalOpen(true); }}
           icon={<Plus size={18}/>}
         >
           Agregar Flashcard
         </Button>
      </div>

      {/* Cards Grid */}
      <div className="space-y-4">
         {cards.map((card, idx) => (
           <div key={card.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
              
              {/* Index */}
              <div className="bg-gray-50 p-4 flex items-center justify-center border-r border-gray-100 font-bold text-gray-400 min-w-[50px]">
                 #{idx + 1}
              </div>

              {/* Content */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
                 <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Frente</span>
                    <RichText content={card.front} />
                 </div>
                 <div className="p-4 bg-indigo-50/30">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 mb-1 block">Reverso</span>
                    <RichText content={card.back} />
                 </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 p-2 flex md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-gray-100">
                 <button 
                   onClick={() => { setEditingCard(card); setModalOpen(true); }}
                   className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                 >
                    <Edit2 size={16}/>
                 </button>
                 <button 
                   onClick={() => handleDeleteCard(card.id)}
                   className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                 >
                    <Trash2 size={16}/>
                 </button>
              </div>
           </div>
         ))}

         {cards.length === 0 && (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
               No hay cartas en este mazo aún.
            </div>
         )}
      </div>
    </div>
  );
}