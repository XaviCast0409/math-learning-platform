import { useEffect, useState } from 'react';
import { BookOpen, Trophy, Clock } from 'lucide-react';
import { adminUsersApi } from '../../../api/users.api';
import type { UserCourseProgress } from '../../../../../types/admin.types';

export const AcademicTab = ({ userId }: { userId: number }) => {
  const [courses, setCourses] = useState<UserCourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminUsersApi.getAcademicProgress(userId).then(setCourses).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="p-4 text-center text-gray-400">Cargando notas...</div>;

  return (
    <div className="space-y-4">
      {courses.length === 0 && <p className="text-gray-400 italic">Este usuario no ha iniciado ningún curso.</p>}

      {courses.map((course) => (
        <div key={course.courseId} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <BookOpen size={20} />
          </div>

          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <h4 className="font-bold text-gray-800">{course.courseTitle}</h4>
              <span className="text-xs font-bold text-blue-600">{course.progressPercent}%</span>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${course.progressPercent}%` }}
              ></div>
            </div>

            <div className="mt-2 flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Trophy size={12} /> Unidad: {course.currentUnit || 'Inicio'}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> Último acceso: {course.lastLessonDate || 'Nunca'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
