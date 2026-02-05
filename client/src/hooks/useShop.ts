import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { shopApi } from '../api/shop.api';
import type { Product, UserItem } from '../types';

export const useShop = () => {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const [products, setProducts] = useState<Product[]>([]);
    const [inventory, setInventory] = useState<UserItem[]>([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'shop') {
                const data = await shopApi.getProducts();
                setProducts(data);
            } else {
                const data = await shopApi.getInventory();
                setInventory(data);
            }
        } catch (error) {
            console.error("Error cargando datos del mercado", error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const buyProduct = async (product: Product) => {
        if (!user) return;
        if (!confirm(`¿Comprar ${product.name} por ${product.cost_gems} gemas?`)) return;

        setProcessingId(product.id);
        try {
            await shopApi.buyProduct(product.id);
            alert(`¡Compraste ${product.name}! 🎉`);
            if (refreshUser) refreshUser();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error en la compra');
        } finally {
            setProcessingId(null);
        }
    };

    const equipItem = async (item: UserItem) => {
        setProcessingId(item.id);
        try {
            await shopApi.equipItem(item.id);
            
            // Actualización optimista
            setInventory(prev => prev.map(i => {
                if (i.id === item.id) return { ...i, is_equipped: true };
                if (i.Product.type === item.Product.type && i.id !== item.id && i.is_equipped) {
                    return { ...i, is_equipped: false };
                }
                return i;
            }));

            if (refreshUser) refreshUser();
        } catch (error: any) {
            alert('No se pudo equipar el objeto');
            loadData(); // Revertir si falla
        } finally {
            setProcessingId(null);
        }
    };

    const useItem = async (item: UserItem) => {
        if (!confirm(`¿Consumir ${item.Product.name}?`)) return;

        setProcessingId(item.id);
        try {
            const res = await shopApi.useItem(item.id);
            alert(res.message || 'Objeto utilizado correctamente');
            setInventory(prev => prev.filter(i => i.id !== item.id));
            if (refreshUser) refreshUser();
        } catch (error: any) {
            alert('Error al usar el objeto');
        } finally {
            setProcessingId(null);
        }
    };

    return {
        activeTab,
        setActiveTab,
        loading,
        processingId,
        products,
        inventory,
        userGems: user?.gems || 0,
        actions: { buyProduct, equipItem, useItem }
    };
};