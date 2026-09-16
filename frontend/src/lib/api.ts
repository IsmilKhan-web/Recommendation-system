import type {
  Profile, Role, ResearchArea, FacultyResearchArea, StudentResearchInterest, FacultySlot,
  FacultyWithDetails, RecommendationResult, TopicMatchResponse, RecommendationHistoryEntry,
  SupervisionRequest,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function setToken(token: string | null) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  signup: (body: { email: string; password: string; fullName: string; role: string; department?: string }) =>
    request<{ token: string; profile: Profile }>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (email: string, password: string, role: Role) =>
    request<{ token: string; profile: Profile }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role }) }),
  getMe: () => request<{ profile: Profile }>('/auth/me'),
  updateMe: (body: { bio?: string; department?: string; office_hours?: string; courses?: string[]; publications?: string[]; research_keywords?: string[] }) =>
    request<{ profile: Profile }>('/auth/me', { method: 'PUT', body: JSON.stringify(body) }),
  getResearchAreas: () => request<ResearchArea[]>('/research-areas'),
  getFaculty: () => request<FacultyWithDetails[]>('/faculty'),
  getAdminOverview: () => request<{ students: number; faculty: number }>('/admin/overview'),
  getAdminFaculty: () => request<Profile[]>('/admin/faculty'),
  createFaculty: (body: { name: string; email: string; temporaryPassword: string; department: string; designation: string; researchInterests: string }) =>
    request<Profile>('/admin/faculty', { method: 'POST', body: JSON.stringify(body) }),
  updateFaculty: (id: string, body: Partial<Pick<Profile, 'full_name' | 'email' | 'department' | 'designation' | 'research_keywords'>>) =>
    request<Profile>(`/admin/faculty/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteFaculty: (id: string) => request<{ message: string }>(`/admin/faculty/${id}`, { method: 'DELETE' }),
  getStudentInterests: (id: string) => request<StudentResearchInterest[]>(`/student-interests/${id}`),
  saveStudentInterests: (interests: { research_area_id: string; weight: number }[]) =>
    request<StudentResearchInterest[]>('/student-interests', { method: 'PUT', body: JSON.stringify({ interests }) }),
  getFacultySlot: (id: string) => request<FacultySlot | null>(`/faculty-slots/${id}`),
  saveFacultySlot: (total_slots: number, taken_slots: number) =>
    request<FacultySlot>('/faculty-slots', { method: 'PUT', body: JSON.stringify({ total_slots, taken_slots }) }),
  getMyFacultyResearchAreas: () => request<FacultyResearchArea[]>('/faculty-research-areas/me'),
  saveFacultyResearchAreas: (areas: { research_area_id: string; weight: number }[]) =>
    request<FacultyResearchArea[]>('/faculty-research-areas', { method: 'PUT', body: JSON.stringify({ areas }) }),
  getRecommendations: () => request<RecommendationResult[]>('/recommendations'),
  matchByTopic: (topic: string, options?: { excludeFull?: boolean; minScore?: number }) =>
    request<TopicMatchResponse>('/recommendations/match', { method: 'POST', body: JSON.stringify({ topic, ...options }) }),
  getHistory: () => request<RecommendationHistoryEntry[]>('/recommendations/history'),
  getMySupervisionRequests: () => request<SupervisionRequest[]>('/supervision-requests/me'),
  createSupervisionRequest: (body: { faculty_id: string; project_mode: 'Solo' | 'Group'; group_members: string[]; project_title: string; project_proposal: string }) =>
    request<SupervisionRequest>('/supervision-requests', { method: 'POST', body: JSON.stringify(body) }),
  getPendingSupervisionRequests: () => request<SupervisionRequest[]>('/supervision-requests/pending'),
  getApprovedSupervisionRequests: () => request<SupervisionRequest[]>('/supervision-requests/approved'),
  updateSupervisionRequestStatus: (id: string, status: 'approved' | 'denied') =>
    request<SupervisionRequest>(`/supervision-requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
