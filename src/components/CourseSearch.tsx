
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchCourses, fetchSubjects } from '@/utils/api';
import { Course, Section } from '@/types/course';
import { Search } from 'lucide-react';

interface CourseSearchProps {
  onCourseSelect: (course: Course, selectedSections: Section[]) => void;
}

const CourseSearch = ({ onCourseSelect }: CourseSearchProps) => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({});

  // Fetch subjects when component mounts
  useEffect(() => {
    const loadSubjects = async () => {
      const fetchedSubjects = await fetchSubjects();
      setSubjects(fetchedSubjects);
    };
    
    loadSubjects();
  }, []);

  // Fetch courses when subject changes
  useEffect(() => {
    if (!selectedSubject) return;
    
    const loadCourses = async () => {
      setLoading(true);
      const fetchedCourses = await fetchCourses('2025', '1', 'NB', selectedSubject);
      setCourses(fetchedCourses);
      setFilteredCourses(fetchedCourses);
      setLoading(false);
    };
    
    loadCourses();
  }, [selectedSubject]);

  // Filter courses based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCourses(courses);
      return;
    }
    
    const filtered = courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      course.courseString.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedSections({});
  };

  const handleSectionToggle = (sectionIndex: string) => {
    setSelectedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const handleAddCourse = () => {
    if (!selectedCourse) return;
    
    const sections = selectedCourse.sections.filter(section => 
      selectedSections[section.index]
    );
    
    onCourseSelect(selectedCourse, sections);
    
    // Reset selection
    setSelectedCourse(null);
    setSelectedSections({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Courses</CardTitle>
        <CardDescription>
          Search for courses by subject and add them to your watch list
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={selectedSubject} 
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by course title or number"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          
          {loading && (
            <div className="py-8 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading courses...</p>
            </div>
          )}
          
          {!loading && filteredCourses.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No courses found. Try selecting a subject or adjusting your search.</p>
            </div>
          )}
          
          {!loading && filteredCourses.length > 0 && (
            <div className="max-h-72 overflow-y-auto border rounded-md">
              <div className="divide-y">
                {filteredCourses.map((course) => (
                  <div 
                    key={course.courseString}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedCourse?.courseString === course.courseString ? 'bg-gray-100' : ''}`}
                    onClick={() => handleCourseSelect(course)}
                  >
                    <div className="font-medium">{course.courseString}: {course.title}</div>
                    <div className="text-sm text-muted-foreground">{course.credits} credits</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedCourse && (
            <>
              <Separator className="my-4" />
              
              <div>
                <h3 className="font-medium mb-2">Select Sections to Watch</h3>
                <div className="space-y-2 max-h-72 overflow-y-auto border rounded-md p-3">
                  {selectedCourse.sections.map((section) => (
                    <div key={section.index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`section-${section.index}`}
                        checked={!!selectedSections[section.index]}
                        onChange={() => handleSectionToggle(section.index)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`section-${section.index}`} className="text-sm">
                        Section {section.number} (Index: {section.index}) - 
                        <span className={section.isOpen ? 'status-open' : 'status-closed'}>
                          {section.isOpen ? ' Open' : ' Closed'}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  onClick={handleAddCourse}
                  disabled={Object.values(selectedSections).filter(Boolean).length === 0}
                >
                  Add Selected Sections to Watch List
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseSearch;
