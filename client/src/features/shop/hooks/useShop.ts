import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { shopApi } from '../api/shop.api';
import type { Product, UserItem } from '../../../types';
import { useShopData } from './useShopData';
import { toast } from 'react-hot-toast';
import { useConfirm } from '../../../context/ConfirmContext';

export const useShop = () => {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
    const [processingId, setProcessingId] = useState<number | null>(null);
    const { confirm } = useConfirm();

    // Use SWR Hook
    const { products, inventory, isLoading, mutateInventory } = useShopData();

    const buyProduct = async (product: Product) => {
        if (!user) return;

        const ok = await confirm(`¿Comprar ${product.name} por ${product.cost_gems} XaviCoins?`, {
            title: 'Confirmar Compra',
            confirmText: 'Comprar',
            cancelText: 'Cancelar',
            variant: 'info'
        });

        if (!ok) return;

        setProcessingId(product.id);
        try {
            await shopApi.buyProduct(product.id);
            toast.success(`¡Compraste ${product.name}! 🎉`);
            // Refresh User (gems) and Inventory
            if (refreshUser) refreshUser();
            mutateInventory();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error en la compra');
        } finally {
            setProcessingId(null);
        }
    };

    const equipItem = async (item: UserItem) => {
        setProcessingId(item.id);
        try {
            await shopApi.equipItem(item.id);
            toast.success('Objeto equipado');

            // Optimistic update via mutate is complex here because of the "unequip others" logic.
            // For now, we rely on revalidation or simple re-fetch.
            // Ideally trigger revalidation:
            mutateInventory();

            if (refreshUser) refreshUser();
        } catch (error: any) {
            toast.error('No se pudo equipar el objeto');
        } finally {
            setProcessingId(null);
        }
    };

    const useItem = async (item: UserItem) => {
        const ok = await confirm(`¿Consumir ${item.Product.name}?`, {
            title: 'Usar Objeto',
            confirmText: 'Usar',
            variant: 'info'
        });

        if (!ok) return;

        setProcessingId(item.id);
        try {
            const res = await shopApi.useItem(item.id);
            toast.success(res.message || 'Objeto utilizado correctamente');
            mutateInventory(); // Refresh inventory
            if (refreshUser) refreshUser();
        } catch (error: any) {
            toast.error('Error al usar el objeto');
        } finally {
            setProcessingId(null);
        }
    };

    return {
        activeTab,
        setActiveTab,
        loading: isLoading,
        processingId,
        products,
        inventory,
        userGems: user?.gems || 0,
        actions: { buyProduct, equipItem, useItem }
    };
};
