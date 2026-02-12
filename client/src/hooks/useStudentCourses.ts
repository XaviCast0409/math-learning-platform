import useSWR from 'swr';
import { courseApi } from '../api/course.api';
import type { CourseSummary } from '../api/course.api';

export function useStudentCourses() {
    const { data, error, isLoading } = useSWR<CourseSummary[]>(
        '/learn/courses',
        courseApi.getAllCourses,
        {
            revalidateOnFocus: false, // Don't revalidate on focus, course list doesn't change often
            dedupingInterval: 60000 // 1 minute cache
        }
    );

    return {
        courses: data || [],
        isLoading,
        isError: error
    };
}
