
import { Course, OpenSection } from '../types/course';
import { toast } from '../components/ui/use-toast';

const BASE_URL = 'https://classes.rutgers.edu/soc/api';

export const fetchCourses = async (
  year: string = '2025',
  term: string = '1',
  campus: string = 'NB',
  subject?: string
): Promise<Course[]> => {
  try {
    // If we have a subject, we can use a more specific endpoint
    let url = `${BASE_URL}/courses.json?year=${year}&term=${term}&campus=${campus}`;
    
    if (subject) {
      url += `&subject=${subject}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    
    const data: Course[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    toast({
      title: "Error fetching courses",
      description: "There was a problem fetching course data. Please try again later.",
      variant: "destructive"
    });
    return [];
  }
};

export const fetchOpenSections = async (
  year: string = '2025',
  term: string = '1',
  campus: string = 'NB'
): Promise<OpenSection[]> => {
  try {
    const url = `${BASE_URL}/openSections.json?year=${year}&term=${term}&campus=${campus}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch open sections');
    }
    
    const data: OpenSection[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching open sections:', error);
    toast({
      title: "Error fetching open sections",
      description: "There was a problem fetching open sections data. Please try again later.",
      variant: "destructive"
    });
    return [];
  }
};

export const checkSectionsStatus = async (
  indices: string[],
  year: string = '2025',
  term: string = '1',
  campus: string = 'NB'
): Promise<Record<string, boolean>> => {
  try {
    const openSections = await fetchOpenSections(year, term, campus);
    const openIndices = openSections.map(section => section.index);
    
    // Create a map of indices to their open status
    const statusMap: Record<string, boolean> = {};
    indices.forEach(index => {
      statusMap[index] = openIndices.includes(index);
    });
    
    return statusMap;
  } catch (error) {
    console.error('Error checking section status:', error);
    return {};
  }
};

export const fetchSubjects = async (
  year: string = '2025',
  term: string = '1',
  campus: string = 'NB'
): Promise<string[]> => {
  try {
    const url = `${BASE_URL}/subjects.json?year=${year}&term=${term}&campus=${campus}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch subjects');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    toast({
      title: "Error fetching subjects",
      description: "There was a problem fetching subject data. Please try again later.",
      variant: "destructive"
    });
    return [];
  }
};
