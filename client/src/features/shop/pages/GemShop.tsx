import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Backpack, Gem } from 'lucide-react';
import { clsx } from 'clsx';

// Components & Hooks
// Components & Hooks
import { useShop } from '../hooks/useShop';
import { ShopCard } from '../components/ShopCard'; // Ajusta ruta si es necesario
import { InventoryCard } from '../components/InventoryCard'; // Ajusta ruta si es necesario
import { GlobalLoading } from '../../../components/common/GlobalLoading';

// Pequeño componente visual auxiliar para los tabs
const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex-1 py-3 flex items-center justify-center gap-2 font-bold text-sm transition-colors border-b-2 relative outline-none",
      active ? "border-brand-blue text-brand-blue" : "border-transparent text-gray-400 hover:text-gray-600"
    )}
  >
    <Icon size={18} />
    {label}
    {active && (
      <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />
    )}
  </button>
);

export default function GemShop() {
  const {
    activeTab, setActiveTab, loading, processingId,
    products, inventory, userGems, actions
  } = useShop();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* --- HEADER --- */}
      <div className="bg-white sticky top-0 z-20 shadow-sm">
        <header className="p-4 flex justify-between items-center max-w-md mx-auto">
          <h1 className="text-xl font-black text-gray-800 italic tracking-tight">MERCADO</h1>
          <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            <Gem size={16} className="text-blue-500 fill-blue-500" />
            <span className="font-black text-gray-700">{userGems}</span>
          </div>
        </header>

        <div className="flex max-w-md mx-auto px-2">
          <TabButton active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} icon={ShoppingBag} label="Tienda" />
          <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={Backpack} label="Mochila" />
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="max-w-md mx-auto p-4">
        {loading ? (
          <div className="py-20 flex justify-center"><GlobalLoading /></div>
        ) : (
          <AnimatePresence mode='wait'>

            {/* VISTA TIENDA */}
            {activeTab === 'shop' && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-2 gap-3"
              >
                {products.length === 0 && <p className="col-span-2 text-center text-gray-400 py-10">No hay productos.</p>}

                {products.map(product => (
                  <ShopCard
                    key={product.id}
                    product={product}
                    userGems={userGems}
                    onBuy={actions.buyProduct}
                    isProcessing={processingId === product.id}
                  />
                ))}
              </motion.div>
            )}

            {/* VISTA MOCHILA */}
            {activeTab === 'inventory' && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3"
              >
                {inventory.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                    <Backpack size={48} className="mb-2 opacity-30" />
                    <p className="font-medium">Tu mochila está vacía.</p>
                    <button onClick={() => setActiveTab('shop')} className="text-brand-blue font-bold mt-2 hover:underline">Ir a comprar</button>
                  </div>
                ) : (
                  inventory.map(item => (
                    <InventoryCard
                      key={item.id}
                      item={item}
                      onEquip={actions.equipItem}
                      onUse={actions.useItem}
                      isProcessing={processingId === item.id}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}