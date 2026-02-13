import useSWR from 'swr';
import { shopApi } from '../api/shop.api';
import type { Product, UserItem } from '../../../types';

export function useShopData() {
    // SWR for Products
    const {
        data: products,
        error: productsError,
        isLoading: loadingProducts
    } = useSWR<Product[]>('/shop/products', shopApi.getProducts, {
        revalidateOnFocus: false,
        dedupingInterval: 60000 // Cache for 1 minute
    });

    // SWR for Inventory
    const {
        data: inventory,
        error: inventoryError,
        isLoading: loadingInventory,
        mutate: mutateInventory
    } = useSWR<UserItem[]>('/shop/inventory', shopApi.getInventory, {
        revalidateOnFocus: true // Update inventory when coming back to tab
    });

    return {
        products: products || [],
        inventory: inventory || [],
        isLoading: loadingProducts || loadingInventory,
        isError: productsError || inventoryError,
        mutateInventory
    };
}
