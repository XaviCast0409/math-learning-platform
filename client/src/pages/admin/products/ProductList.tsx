import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { adminProductsApi } from '../../../api/admin/products.api';
import type { Product } from '../../../types/admin.types';
import { Button } from '../../../components/common/Button';
import { ProductModal } from './modals/ProductModal';
import { ProductCard } from './ProductCard';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await adminProductsApi.getAll({
        page: 1, 
        category: categoryFilter
      });
      setProducts(response.products);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  // --- HANDLERS ---
  const handleSave = async (data: any) => {
    try {
      // 1. Enviamos los datos
      if (editingProduct) {
        await adminProductsApi.update(editingProduct.id, data);
      } else {
        await adminProductsApi.create(data);
      }

      // 2. IMPORTANTE: Esperar a que la lista se actualice antes de cerrar
      await fetchProducts();
      
      // 3. Cerrar solo si todo salió bien
      setModalOpen(false);
      
    } catch (error: any) {
      // 👇 CORRECCIÓN: Mostrar el mensaje real del backend
      console.error("Error detallado:", error);
      const serverMsg = error.response?.data?.message || error.message || "Error desconocido";
      alert(`⚠️ No se pudo guardar: ${serverMsg}`);
    }
  };

  // ... (handleDelete y demás handlers se mantienen igual)
  const handleDelete = async (id: number) => {
    if(!confirm("¿Eliminar producto?")) return;
    try {
       await adminProductsApi.delete(id);
       await fetchProducts();
    } catch (error: any) {
       alert(error.response?.data?.message || "No se puede eliminar.");
    }
  };

  const handleToggleActive = async (p: Product) => {
    try {
       await adminProductsApi.update(p.id, { active: !p.active });
       fetchProducts();
    } catch (error) { alert("Error actualizando estado"); }
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
          <h1 className="text-2xl font-black text-gray-800">Tienda de Gemas</h1>
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
             className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${
               categoryFilter === cat 
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
        {loading ? (
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