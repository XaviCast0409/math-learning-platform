import { useState } from 'react';
import { Plus } from 'lucide-react';
import { adminProductsApi } from '../../api/products.api';
import type { Product } from '../../../../types/admin.types';
import { Button } from '../../../../components/common/Button';
import { ProductModal } from './modals/ProductModal';
import { ProductCard } from './ProductCard';
import { useProducts } from '../../../shop/hooks/useProducts';
import { toast } from 'react-hot-toast';

export default function ProductList() {
  const [categoryFilter, setCategoryFilter] = useState('');

  // Hook de Data Fetching (SWR)
  const { products, isLoading, mutate } = useProducts({
    page: 1, // Por ahora solo página 1 en la vista principal
    category: categoryFilter
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- HANDLERS ---
  const handleSave = async (data: any) => {
    try {
      // 1. Enviamos los datos
      if (editingProduct) {
        await adminProductsApi.update(editingProduct.id, data);
        toast.success('Producto actualizado');
      } else {
        await adminProductsApi.create(data);
        toast.success('Producto creado');
      }

      // 2. IMPORTANTE: Revalidar la lista (Optimistic UI o Refetch)
      mutate();

      // 3. Cerrar solo si todo salió bien
      setModalOpen(false);

    } catch (error: any) {
      console.error("Error detallado:", error);
      const serverMsg = error.response?.data?.message || error.message || "Error desconocido";
      toast.error(`⚠️ No se pudo guardar: ${serverMsg}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      await adminProductsApi.delete(id);
      toast.success('Producto eliminado');
      mutate(); // Revalidar
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se puede eliminar.");
    }
  };

  const handleToggleActive = async (p: Product) => {
    try {
      await adminProductsApi.update(p.id, { active: !p.active });
      toast.success('Estado actualizado');
      mutate(); // Revalidar
    } catch (error) { toast.error("Error actualizando estado"); }
  }

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setModalOpen(true);
  };

  const openNew = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingProduct}
      />

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Tienda de XaviCoins</h1>
          <p className="text-sm text-gray-500">Gestiona avatares, pociones y skins.</p>
        </div>
        <Button variant="primary" onClick={openNew} icon={<Plus size={18} />}>
          Nuevo Producto
        </Button>
      </div>

      {/* Tabs Filtro */}
      <div className="flex gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
        {['', 'instant', 'inventory', 'cosmetic'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${categoryFilter === cat
              ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-500'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            {cat === '' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-gray-400">Cargando...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full py-10 text-center text-gray-400 border-2 border-dashed rounded-xl">No hay productos aquí.</div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))
        )}
      </div>
    </div>
  );
}
