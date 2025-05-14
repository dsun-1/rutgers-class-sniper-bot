
export interface Course {
  courseString: string;
  title: string;
  subjectNotes: string;
  courseNotes: string;
  sections: Section[];
  subjectCode: string;
  courseNumber: string;
  synopses: string[];
  credits: number;
  expandedTitle?: string;
}

export interface Section {
  index: string;
  number: string;
  sectionEligibility: string;
  instructors: Instructor[];
  isOpen: boolean;
  status: string;
  meetingTimes: MeetingTime[];
  examCode: string;
  subtitle?: string;
  comments?: string[];
}

export interface Instructor {
  name: string;
}

export interface MeetingTime {
  campusName: string;
  campusAbbrev: string;
  buildingCode: string;
  meetingDay: string; 
  startTime: string;
  endTime: string;
  roomNumber: string;
  pmCode: string;
}

export interface WatchedCourse {
  id: string;
  course: Course;
  sections: Section[];
  isNotificationEnabled: boolean;
  isAutomaticRegistration: boolean;
}

export interface OpenSection {
  index: string;
}
