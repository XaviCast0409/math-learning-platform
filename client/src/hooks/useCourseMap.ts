import useSWR from 'swr';
import { courseApi, type UnitMap, type CourseSummary } from '../api/course.api';

export function useCourseMap(courseId: string | undefined) {
    // Fetch Consolidated Map Data (Course Info + Units)
    const {
        data,
        error,
        isLoading
    } = useSWR<{ courseInfo: CourseSummary; units: UnitMap[] }>(
        courseId ? `/learn/course/${courseId}/map` : null,
        () => courseApi.getCourseMap(Number(courseId)),
        {
            revalidateOnFocus: true
        }
    );

    return {
        units: data?.units || [],
        currentCourse: data?.courseInfo,
        isLoading,
        isError: error
    };
}
