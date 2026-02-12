import useSWR from 'swr';
import { courseApi, type UnitMap, type CourseSummary } from '../api/course.api';

export function useCourseMap(courseId: string | undefined) {
    // 1. Fetch Units Map
    const {
        data: units,
        error: unitsError,
        isLoading: unitsLoading
    } = useSWR<UnitMap[]>(
        courseId ? `/learn/course/${courseId}/map` : null,
        () => courseApi.getCourseMap(Number(courseId)),
        {
            revalidateOnFocus: true
        }
    );

    // 2. Fetch Course Info (Could be optimized by passing from previous screen, but fetching is safer)
    // We reuse the same cache key as useStudentCourses if possible, but here we specifically need current course.
    // Actually, getAllCourses returns summaries. Let's just fetch all and find (cached).
    const { data: allCourses } = useSWR<CourseSummary[]>('/learn/courses', courseApi.getAllCourses);

    const currentCourse = allCourses?.find(c => c.id === Number(courseId));

    return {
        units: units || [],
        currentCourse,
        isLoading: unitsLoading || !currentCourse, // SWR for allCourses might be fast if cached
        isError: unitsError
    };
}
