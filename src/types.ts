export type TeamStatus = 'idle' | 'busy' | 'done';

export interface Team {
  id: string;
  teamNumber: number;
  boothLabel: string;
  status: TeamStatus;
  mentorId?: string;
  mentorName?: string;
  startTime?: number; 
  lastVisited?: number; 
  completedStages?: string[];
}

export interface RegistryEntry {
  teamId: string;
  boothId: string;
  sessionId: string;
}

export type RegistryState = Record<string, string>; // key: "boothId-sessionId", value: teamId

export interface Session {
  id: string;
  label: string;
}

export const SESSIONS: Session[] = [
  { id: 's1', label: 'Session 1' },
  { id: 's2', label: 'Session 2' },
  { id: 's3', label: 'Session 3' },
  { id: 's4', label: 'Session 4' },
  { id: 's5', label: 'Session 5' },
];

export const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export type UserRole = 'mentor' | 'coordinator' | null;

export interface MentorSession {
  id: string;
  name: string;
  currentTeamId?: string;
}
