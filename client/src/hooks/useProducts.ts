import useSWR from 'swr';
import { adminProductsApi } from '../api/admin/products.api';

interface UseProductsParams {
    page?: number;
    category?: string;
    search?: string;
}

export function useProducts({ page = 1, category = '', search = '' }: UseProductsParams) {
    const key = `/admin/products?page=${page}&category=${category}&search=${search}`;

    const { data, error, isLoading, mutate } = useSWR(
        key,
        () => adminProductsApi.getAll({ page, category, search }),
        {
            keepPreviousData: true,
            dedupingInterval: 2000,
        }
    );

    return {
        products: data?.products || [],
        pagination: {
            total: data?.totalItems || 0,
            totalPages: data?.totalPages || 1,
            currentPage: data?.currentPage || 1
        },
        isLoading,
        isError: error,
        mutate
    };
}
