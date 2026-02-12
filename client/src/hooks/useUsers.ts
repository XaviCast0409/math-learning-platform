import useSWR from 'swr';
import { adminUsersApi } from '../api/admin/users.api';

interface UseUsersParams {
    page: number;
    search: string;
    role: string;
}

export function useUsers({ page, search, role }: UseUsersParams) {
    const key = `/admin/users?page=${page}&search=${search}&role=${role}`;

    const { data, error, isLoading, mutate } = useSWR(
        key,
        () => adminUsersApi.getAll({ page, search, role }),
        {
            keepPreviousData: true,
            dedupingInterval: 2000,
        }
    );

    return {
        users: data?.data || [],
        pagination: {
            total: data?.total || 0,
            totalPages: data?.pages || 1,
            currentPage: page // La API no devuelve currentPage en este endpoint, usamos el local
        },
        isLoading,
        isError: error,
        mutate
    };
}
