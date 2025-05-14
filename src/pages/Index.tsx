
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseSearch from '@/components/CourseSearch';
import CourseList from '@/components/CourseList';
import { Course, Section, WatchedCourse } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const STORAGE_KEY = 'rutgers-course-sniper-watchlist';
const DEFAULT_REFRESH_INTERVAL = 60000; // 1 minute

const Index = () => {
  const [watchedCourses, setWatchedCourses] = useState<WatchedCourse[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(DEFAULT_REFRESH_INTERVAL);

  // Load watched courses from localStorage on mount
  useEffect(() => {
    const savedWatchedCourses = localStorage.getItem(STORAGE_KEY);
    if (savedWatchedCourses) {
      try {
        setWatchedCourses(JSON.parse(savedWatchedCourses));
      } catch (error) {
        console.error('Error parsing watched courses from localStorage', error);
      }
    }
  }, []);

  // Save watched courses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedCourses));
  }, [watchedCourses]);

  const handleCourseSelect = (course: Course, selectedSections: Section[]) => {
    // Check if we already have this course with some or all of these sections
    const existingCourseIndex = watchedCourses.findIndex(
      (wc) => wc.course.courseString === course.courseString
    );

    if (existingCourseIndex >= 0) {
      // Course exists, let's merge the selected sections
      const existingCourse = watchedCourses[existingCourseIndex];
      const existingIndices = existingCourse.sections.map((section) => section.index);
      
      // Filter out sections that are already being watched
      const newSections = selectedSections.filter(
        (section) => !existingIndices.includes(section.index)
      );

      if (newSections.length === 0) {
        toast({
          title: "Sections already being watched",
          description: "The selected sections are already in your watch list.",
          variant: "default",
        });
        return;
      }

      // Add new sections to the existing course
      const updatedCourse = {
        ...existingCourse,
        sections: [...existingCourse.sections, ...newSections],
      };

      const updatedWatchedCourses = [...watchedCourses];
      updatedWatchedCourses[existingCourseIndex] = updatedCourse;
      
      setWatchedCourses(updatedWatchedCourses);
      
      toast({
        title: "Added to watch list",
        description: `Added ${newSections.length} new section(s) to ${course.courseString}.`,
      });
    } else {
      // This is a new course
      const newWatchedCourse: WatchedCourse = {
        id: uuidv4(),
        course,
        sections: selectedSections,
        isNotificationEnabled: true,
        isAutomaticRegistration: false,
      };

      setWatchedCourses([...watchedCourses, newWatchedCourse]);
      
      toast({
        title: "Added to watch list",
        description: `Added ${course.courseString}: ${course.title} with ${selectedSections.length} section(s).`,
      });
    }
  };

  const handleRemoveCourse = (id: string) => {
    setWatchedCourses(watchedCourses.filter((wc) => wc.id !== id));
    
    toast({
      title: "Removed from watch list",
      description: "Course has been removed from your watch list.",
    });
  };

  const handleUpdateCourse = (id: string, updates: Partial<WatchedCourse>) => {
    setWatchedCourses(
      watchedCourses.map((wc) =>
        wc.id === id ? { ...wc, ...updates } : wc
      )
    );
  };

  const handleClearAll = () => {
    setWatchedCourses([]);
    
    toast({
      title: "Watch list cleared",
      description: "All courses have been removed from your watch list.",
    });
  };

  // Convert refresh interval from ms to seconds for display
  const refreshIntervalInSeconds = refreshInterval / 1000;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <CourseSearch onCourseSelect={handleCourseSelect} />
        
        <div className="mt-8 mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Your Watch List</h2>
            <p className="text-muted-foreground">
              Monitoring {watchedCourses.length} courses with a total of {
                watchedCourses.reduce((acc, course) => acc + course.sections.length, 0)
              } sections
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="refresh-interval">Refresh interval</Label>
                <span className="text-sm">{refreshIntervalInSeconds}s</span>
              </div>
              <Slider
                id="refresh-interval"
                min={10}
                max={300}
                step={10}
                value={[refreshIntervalInSeconds]}
                onValueChange={(value) => setRefreshInterval(value[0] * 1000)}
              />
            </div>
            
            {watchedCourses.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleClearAll}
                className="whitespace-nowrap"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
        
        <CourseList 
          watchedCourses={watchedCourses}
          onRemoveCourse={handleRemoveCourse}
          onUpdateCourse={handleUpdateCourse}
          refreshInterval={refreshInterval}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
