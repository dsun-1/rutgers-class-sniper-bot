
import { Course, OpenSection } from '../types/course';
import { toast } from '../components/ui/use-toast';

// CORS proxy to fix API access issues
const CORS_PROXY = 'https://corsproxy.io/?';
const BASE_URL = `${CORS_PROXY}https://classes.rutgers.edu/soc/api`;

// Updated Default Parameters (Summer 2025)
const CURRENT_YEAR = '2025';
const CURRENT_TERM = '7'; // Summer term
const DEFAULT_CAMPUS = 'NB';

export const fetchCourses = async (
  subject?: string,
  year: string = CURRENT_YEAR,
  term: string = CURRENT_TERM,
  campus: string = DEFAULT_CAMPUS
): Promise<Course[]> => {
  try {
    let url = `${BASE_URL}/courses.json?year=${year}&term=${term}&campus=${campus}`;
    
    if (subject) {
      url += `&subject=${subject}`;
    }
    console.log(`Fetching courses from: ${url}`); // DEBUG
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Failed to fetch courses, status:', response.status, await response.text()); // DEBUG
      throw new Error(`Failed to fetch courses. Status: ${response.status}`);
    }
    
    const data: Course[] = await response.json();
    console.log('Fetched courses data:', data); // DEBUG
    return data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    toast({
      title: "Error fetching courses",
      description: `There was a problem fetching course data: ${error instanceof Error ? error.message : String(error)}. Please try again later or check API parameters.`,
      variant: "destructive"
    });
    return [];
  }
};

export const fetchOpenSections = async (
  year: string = CURRENT_YEAR,
  term: string = CURRENT_TERM,
  campus: string = DEFAULT_CAMPUS
): Promise<OpenSection[]> => {
  try {
    const url = `${BASE_URL}/openSections.json?year=${year}&term=${term}&campus=${campus}`;
    console.log(`Fetching open sections from: ${url}`); // DEBUG
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Failed to fetch open sections, status:', response.status, await response.text()); // DEBUG
      throw new Error(`Failed to fetch open sections. Status: ${response.status}`);
    }
    
    const data: OpenSection[] = await response.json();
    console.log('Fetched open sections data:', data); // DEBUG
    return data;
  } catch (error) {
    console.error('Error fetching open sections:', error);
    toast({
      title: "Error fetching open sections",
      description: `There was a problem fetching open sections data: ${error instanceof Error ? error.message : String(error)}. Please try again later.`,
      variant: "destructive"
    });
    return [];
  }
};

export const checkSectionsStatus = async (
  indices: string[],
  year: string = CURRENT_YEAR,
  term: string = CURRENT_TERM,
  campus: string = DEFAULT_CAMPUS
): Promise<Record<string, boolean>> => {
  try {
    console.log(`Checking section status for indices: ${indices.join(', ')} with params: year=${year}, term=${term}, campus=${campus}`); // DEBUG
    const openSections = await fetchOpenSections(year, term, campus);
    const openIndices = openSections.map(section => section.index);
    
    const statusMap: Record<string, boolean> = {};
    indices.forEach(index => {
      statusMap[index] = openIndices.includes(index);
    });
    console.log('Section status map:', statusMap); // DEBUG
    return statusMap;
  } catch (error) {
    console.error('Error checking section status:', error);
    // Do not toast here as it's called frequently by CourseCard
    return {};
  }
};

export const fetchSubjects = async (
  year: string = CURRENT_YEAR,
  term: string = CURRENT_TERM,
  campus: string = DEFAULT_CAMPUS
): Promise<string[]> => {
  try {
    const url = `${BASE_URL}/subjects.json?year=${year}&term=${term}&campus=${campus}`;
    console.log(`Fetching subjects from: ${url}`); // DEBUG
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Failed to fetch subjects, status:', response.status, await response.text()); // DEBUG
      throw new Error(`Failed to fetch subjects. Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fetched subjects data:', data); // DEBUG
    return data.map((s: { code?: string; description?: string }) => s.description ? `${s.description} (${s.code})` : String(s.code || s)); // Adjusted to handle potential object structure
  } catch (error) {
    console.error('Error fetching subjects:', error);
    toast({
      title: "Error fetching subjects",
      description: `There was a problem fetching subject data: ${error instanceof Error ? error.message : String(error)}. Please try again later.`,
      variant: "destructive"
    });
    return [];
  }
};
