export type Role = 'student' | 'faculty' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  designation: string | null;
  department: string | null;
  bio: string | null;
  avatar_url: string | null;
  office_hours: string | null;
  courses: string[];
  publications: string[];
  research_keywords: string[];
  created_at: string;
}

export interface ResearchArea {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  created_at: string;
}

export interface FacultyResearchArea {
  id: string;
  faculty_id: string;
  research_area_id: string;
  weight: number;
  research_area?: ResearchArea;
}

export interface StudentResearchInterest {
  id: string;
  student_id: string;
  research_area_id: string;
  weight: number;
  research_area?: ResearchArea;
}

export interface FacultySlot {
  id: string;
  faculty_id: string;
  total_slots: number;
  taken_slots: number;
  term: string;
  updated_at: string;
}

export interface FacultyWithDetails extends Profile {
  research_areas: FacultyResearchArea[];
  slot: FacultySlot | null;
}

export type SupervisionRequestStatus = 'pending' | 'approved' | 'denied';

export interface SupervisionRequest {
  id: string;
  student_id: string;
  faculty_id: string;
  project_mode: 'Solo' | 'Group';
  group_members: string[];
  student_email: string;
  student_details?: { full_name: string; email: string; department: string };
  project_title: string;
  project_proposal: string;
  status: SupervisionRequestStatus;
  createdAt: string;
  student?: Profile | null;
  faculty?: Profile | null;
}

export interface RecommendationResult {
  faculty: FacultyWithDetails;
  matchScore: number;
  matchedAreas: { id: string; name: string; studentWeight: number; facultyWeight: number }[];
  availableSlots: number;
}

export interface TextMatchResult {
  faculty: FacultyWithDetails;
  matchScore: number;
  matchedKeywords: string[];
  availableSlots: number;
  totalSlots: number;
  similarity: number;
}

export interface TopicMatchResponse {
  topic: string;
  queryKeywords: string[];
  results: TextMatchResult[];
}

export interface RecommendationHistoryEntry {
  id: string;
  student_id: string;
  search_topic: string;
  recommended_supervisors: {
    faculty_id: string | { id: string; full_name: string; email: string; department: string; bio: string };
    score: number;
    matched_keywords: string[];
  }[];
  createdAt: string;
}
