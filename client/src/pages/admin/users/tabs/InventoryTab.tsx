import { useEffect, useState } from 'react';
import { Gift, Trash2, ShoppingBag, Gem, Save, X } from 'lucide-react';
import { adminUsersApi } from '../../../../api/admin/users.api';
import { adminProductsApi } from '../../../../api/admin/products.api';
import type { UserItem, Product } from '../../../../types/admin.types';
import { Button } from '../../../../components/common/Button';
import { Input } from '../../../../components/common/Input'; // Asegúrate de importar tu Input

export const InventoryTab = ({ userId }: { userId: number }) => {
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para Regalar Ítems
  const [isGiftMode, setIsGiftMode] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');

  // Estado para Gemas
  const [isGemMode, setIsGemMode] = useState(false);
  const [gemAmount, setGemAmount] = useState(''); // Lo que escribes en el input

  const fetchInventory = () => {
    setLoading(true);
    adminUsersApi.getInventory(userId).then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, [userId]);

  // Cargar lista de productos solo si se necesita
  const handleLoadGiftOptions = async () => {
    setIsGiftMode(true);
    setIsGemMode(false); // Cerrar el otro modo si está abierto
    if(availableProducts.length === 0) {
        const res = await adminProductsApi.getAll({ page: 1 });
        setAvailableProducts(res.products);
    }
  }

  // --- LÓGICA DE ÍTEMS ---
  const handleGiveItem = async () => {
    if(!selectedProduct) return;
    try {
        await adminUsersApi.grantItem(userId, Number(selectedProduct));
        alert("Ítem entregado exitosamente");
        setIsGiftMode(false);
        fetchInventory();
    } catch (e) { alert("Error al entregar ítem"); }
  };

  const handleRevokeItem = async (itemId: number) => {
      if(!confirm("¿Quitar este ítem del inventario del usuario?")) return;
      await adminUsersApi.revokeItem(userId, itemId);
      fetchInventory();
  }

  // --- LÓGICA DE GEMAS ---
  const handleGemUpdate = async () => {
      const amount = Number(gemAmount);
      if (amount === 0) return;

      try {
          await adminUsersApi.grantGems(userId, amount);
          alert(`Gemas ${amount > 0 ? 'añadidas' : 'quitadas'} con éxito.`);
          setIsGemMode(false);
          setGemAmount('');
          // Aquí idealmente recargaríamos el "UserDetail" completo para ver el saldo actualizado en el header,
          // o podrías pasar una función prop 'onUpdate' desde el padre.
          // Por ahora, solo cerramos el modal.
      } catch (error) {
          alert("Error al ajustar gemas");
      }
  }

  if (loading) return <div className="p-4">Cargando mochila...</div>;

  return (
    <div className="space-y-6">
      
      {/* 1. BARRA DE HERRAMIENTAS DE SOPORTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* A. Tarjeta de Gemas */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-2">
                 <div className="flex gap-2 items-center text-blue-800 font-bold">
                    <Gem size={20}/> Gestión de Divisa
                 </div>
                 {!isGemMode && (
                    <Button variant="outline" className="text-xs h-8" onClick={() => { setIsGemMode(true); setIsGiftMode(false); }}>
                        Ajustar Saldo
                    </Button>
                 )}
              </div>
              
              {isGemMode ? (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                      <Input 
                        placeholder="+500 o -100" 
                        type="number" 
                        value={gemAmount}
                        onChange={(e) => setGemAmount(e.target.value)}
                        className="h-9 bg-white"
                        containerClass="flex-1" // Si usaste mi fix anterior del containerClass
                      />
                      <Button onClick={handleGemUpdate} disabled={!gemAmount} className="h-10 px-3">
                          <Save size={16}/>
                      </Button>
                      <Button variant="outline" onClick={() => setIsGemMode(false)} className="h-10 px-3">
                          <X size={16}/>
                      </Button>
                  </div>
              ) : (
                  <p className="text-xs text-blue-600">
                      Usa esto para bonificar gemas por errores del sistema o eventos.
                  </p>
              )}
          </div>

          {/* B. Tarjeta de Ítems */}
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-2">
                 <div className="flex gap-2 items-center text-purple-800 font-bold">
                    <ShoppingBag size={20}/> Gestión de Ítems
                 </div>
                 {!isGiftMode && (
                    <Button variant="outline" className="text-xs h-8" onClick={handleLoadGiftOptions}>
                        <Gift size={14} className="mr-1"/> Regalar Ítem
                    </Button>
                 )}
              </div>

              {isGiftMode ? (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                      <select 
                        className="flex-1 p-2 h-10 text-sm border border-gray-300 rounded-lg outline-none"
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        value={selectedProduct}
                      >
                          <option value="">Seleccionar...</option>
                          {availableProducts.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                      </select>
                      <Button onClick={handleGiveItem} disabled={!selectedProduct} className="h-10 px-3">
                          <Save size={16}/>
                      </Button>
                      <Button variant="outline" onClick={() => setIsGiftMode(false)} className="h-10 px-3">
                          <X size={16}/>
                      </Button>
                  </div>
              ) : (
                 <p className="text-xs text-purple-600">
                    Envía pociones, escudos o skins directamente al inventario.
                 </p>
              )}
          </div>
      </div>

      <div className="border-t border-gray-100 my-4"></div>

      {/* 2. GRID DE ÍTEMS EXISTENTES */}
      <h3 className="font-bold text-gray-700 mb-3">Inventario Actual ({items.length})</h3>
      
      {items.length === 0 && (
          <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-xl text-gray-400">
              La mochila está vacía.
          </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
         {items.map(item => (
             <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-3 relative group hover:shadow-md transition-all">
                 <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    {item.productImage ? (
                        <img src={item.productImage} className="w-full h-full object-contain" onError={(e) => e.currentTarget.src='https://placehold.co/40'} />
                    ) : (
                        <ShoppingBag size={20} className="text-gray-300"/>
                    )}
                 </div>
                 <div className="overflow-hidden">
                     <p className="font-bold text-sm text-gray-800 truncate" title={item.productName}>{item.productName}</p>
                     <p className="text-xs text-gray-500">Cantidad: <span className="font-bold text-purple-600">{item.quantity}</span></p>
                 </div>
                 
                 {/* Botón Borrar */}
                 <button 
                    onClick={() => handleRevokeItem(item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-md shadow opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-110"
                    title="Eliminar del inventario"
                 >
                    <Trash2 size={14} />
                 </button>
             </div>
         ))}
      </div>
    </div>
  );
};