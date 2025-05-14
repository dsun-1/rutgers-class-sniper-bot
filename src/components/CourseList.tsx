
import React from 'react';
import CourseCard from './CourseCard';
import { WatchedCourse } from '@/types/course';

interface CourseListProps {
  watchedCourses: WatchedCourse[];
  onRemoveCourse: (id: string) => void;
  onUpdateCourse: (id: string, updates: Partial<WatchedCourse>) => void;
  refreshInterval: number;
}

const CourseList = ({ 
  watchedCourses, 
  onRemoveCourse, 
  onUpdateCourse,
  refreshInterval
}: CourseListProps) => {
  if (watchedCourses.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
        <h3 className="text-lg font-medium mb-2">No courses in your watch list</h3>
        <p className="text-muted-foreground">
          Search for courses above and add them to start monitoring
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {watchedCourses.map((watchedCourse) => (
        <CourseCard
          key={watchedCourse.id}
          watchedCourse={watchedCourse}
          onRemove={onRemoveCourse}
          onUpdateSettings={onUpdateCourse}
          refreshInterval={refreshInterval}
        />
      ))}
    </div>
  );
};

export default CourseList;
