import useSWR from 'swr';
import { adminStatsApi } from '../api/stats.api';
import type { DashboardStats } from '../../../types/admin.types';

export function useDashboardStats() {
    const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
        '/admin/stats/dashboard', // Key for SWR cache
        adminStatsApi.getDashboard, // Fetcher function
        {
            revalidateOnFocus: true,     // Auto-refresh when window gets focus
            dedupingInterval: 5000,      // Deduplicate requests within 5s
            keepPreviousData: true       // Show old data while fetching new
        }
    );

    return {
        stats: data,
        isLoading,
        isError: error,
        mutate
    };
}
