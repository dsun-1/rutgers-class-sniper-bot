import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchCourses, fetchSubjects } from '@/utils/api'; // fetchSubjects might now use new defaults
import { Course, Section } from '@/types/course';
import { Search } from 'lucide-react';

interface CourseSearchProps {
  onCourseSelect: (course: Course, selectedSections: Section[]) => void;
}

// These could be made dynamic via props or context in a future enhancement
const DEFAULT_YEAR = '2025'; // Year used for fetching subjects/courses
const DEFAULT_TERM = '7';   // Term used for fetching subjects/courses (Summer)
const DEFAULT_CAMPUS = 'NB';// Campus used for fetching subjects/courses

const CourseSearch = ({ onCourseSelect }: CourseSearchProps) => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>(''); // Store subject code
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({});

  // Fetch subjects when component mounts
  useEffect(() => {
    const loadSubjects = async () => {
      setLoadingSubjects(true);
      // fetchSubjects will use its internal defaults (Year: 2025, Term: 7, Campus: NB)
      // unless these are overridden by passing parameters here.
      const fetchedSubjects = await fetchSubjects(DEFAULT_YEAR, DEFAULT_TERM, DEFAULT_CAMPUS);
      setSubjects(fetchedSubjects);
      setLoadingSubjects(false);
    };
    
    loadSubjects();
  }, []);

  // Fetch courses when subject changes
  useEffect(() => {
    if (!selectedSubjectCode) { // Use selectedSubjectCode
      setCourses([]); // Clear courses if no subject is selected
      setFilteredCourses([]);
      return;
    }
    
    const loadCourses = async () => {
      setLoading(true);
      setSelectedCourse(null); // Reset selected course when subject changes
      setSelectedSections({}); // Reset selected sections
      // Extract the actual subject code if it's in "Description (CODE)" format
      const subjectCodeMatch = selectedSubjectCode.match(/\((\w+)\)$/);
      const actualSubjectCode = subjectCodeMatch ? subjectCodeMatch[1] : selectedSubjectCode;

      const fetchedCourses = await fetchCourses(actualSubjectCode, DEFAULT_YEAR, DEFAULT_TERM, DEFAULT_CAMPUS);
      setCourses(fetchedCourses);
      setFilteredCourses(fetchedCourses);
      setLoading(false);
    };
    
    loadCourses();
  }, [selectedSubjectCode]); // Depend on selectedSubjectCode

  // Filter courses based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCourses(courses);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = courses.filter(course => 
      course.title.toLowerCase().includes(lowerSearchTerm) || 
      course.courseString.toLowerCase().includes(lowerSearchTerm) ||
      (course.expandedTitle && course.expandedTitle.toLowerCase().includes(lowerSearchTerm))
    );
    
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setSelectedSections({}); // Reset sections when a new course is selected
  };

  const handleSectionToggle = (sectionIndex: string) => {
    setSelectedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const handleAddCourse = () => {
    if (!selectedCourse) return;
    
    const sectionsToAdd = selectedCourse.sections.filter(section => 
      selectedSections[section.index]
    );
    
    if (sectionsToAdd.length > 0) {
      onCourseSelect(selectedCourse, sectionsToAdd);
    }
    
    // Reset selection, or clear search for next use
    // setSelectedCourse(null);
    // setSelectedSections({});
    // Consider clearing search term or subject for better UX after adding
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Courses</CardTitle>
        <CardDescription>
          Search for courses by subject for {DEFAULT_CAMPUS}, {DEFAULT_TERM === '7' ? 'Summer' : DEFAULT_TERM === '9' ? 'Fall' : 'Spring'} {DEFAULT_YEAR} and add them to your watch list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={selectedSubjectCode} 
                onValueChange={setSelectedSubjectCode} // Update to use subject code
                disabled={loadingSubjects}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder={loadingSubjects ? "Loading subjects..." : "Select subject"} />
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
              <Label htmlFor="search">Search by Title or Course #</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="e.g., Data Structures or 01:198:111"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8"
                  disabled={!selectedSubjectCode || loading}
                />
              </div>
            </div>
          </div>
          
          {loading && (
            <div className="py-8 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading courses for {selectedSubjectCode}...</p>
            </div>
          )}
          
          {!loading && selectedSubjectCode && courses.length === 0 && (
             <div className="py-8 text-center">
               <p className="text-muted-foreground">No courses found for {selectedSubjectCode}. This subject might have no offerings this term, or there might be an API issue.</p>
             </div>
          )}

          {!loading && !selectedSubjectCode && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Please select a subject to see available courses.</p>
            </div>
          )}
          
          {!loading && filteredCourses.length > 0 && (
            <div className="max-h-72 overflow-y-auto border rounded-md">
              <div className="divide-y">
                {filteredCourses.map((course) => (
                  <div 
                    key={course.courseString}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedCourse?.courseString === course.courseString ? 'bg-gray-100' : ''}`}
                    onClick={() => handleCourseClick(course)}
                  >
                    <div className="font-medium">{course.courseString}: {course.title}</div>
                    {course.expandedTitle && course.expandedTitle !== course.title && (
                        <div className="text-xs text-muted-foreground">{course.expandedTitle}</div>
                    )}
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
                <h3 className="font-medium mb-2">Select Sections to Watch for {selectedCourse.courseString}</h3>
                <div className="space-y-2 max-h-72 overflow-y-auto border rounded-md p-3">
                  {selectedCourse.sections.length > 0 ? selectedCourse.sections.map((section) => (
                    <div key={section.index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`section-${section.index}`}
                        checked={!!selectedSections[section.index]}
                        onChange={() => handleSectionToggle(section.index)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`section-${section.index}`} className="text-sm cursor-pointer">
                        Section {section.number} (Index: {section.index}) - 
                        <span className={section.isOpen ? 'status-open' : 'status-closed'}>
                          {section.isOpen ? ' Open' : ' Closed'}
                        </span>
                        {section.instructors && section.instructors.length > 0 && (
                            <span className="text-xs text-gray-500 ml-1">
                                ({section.instructors.map(i => i.name).join(', ')})
                            </span>
                        )}
                      </label>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">No sections listed for this course.</p>
                  )}
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
