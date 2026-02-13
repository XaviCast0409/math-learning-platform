import useSWR from 'swr';
import { adminCoursesApi } from '../api/courses.api';

interface UseCoursesParams {
    page: number;
    search: string;
    level: string;
}

export function useCourses({ page, search, level }: UseCoursesParams) {
    // Clave compuesta para SWR: si cambia algo, refetch
    const key = `/admin/courses?page=${page}&search=${search}&level=${level}`;

    const { data, error, isLoading, mutate } = useSWR(
        key,
        () => adminCoursesApi.getAll({ page, search, level }),
        {
            keepPreviousData: true, // Mantiene los datos viejos mientras carga los nuevos (mejor UX)
            dedupingInterval: 2000,
        }
    );

    return {
        courses: data?.courses || [],
        pagination: {
            total: data?.totalItems || 0,
            totalPages: data?.totalPages || 1,
            currentPage: data?.currentPage || 1
        },
        isLoading,
        isError: error,
        mutate // Para recargar manualmente (ej: después de borrar)
    };
}
