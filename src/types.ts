export interface Student {
  id: string;
  code: string; // เช่น STU-1001, 001
  title: string; // ด.ช., ด.ญ., นาย, นางสาว
  firstName: string;
  lastName: string;
  nickname: string;
  gender: 'male' | 'female';
  classLevel: string; // เช่น ป.1/1, ป.1/2, ป.2/1
  room: string; // เช่น ห้อง 101, ห้อง 102
  avatar: string;
  status: 'active' | 'absent' | 'inactive'; // ใช้งาน, ขาดเรียน
  note?: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  code: string; // เช่น COM-101
  name: string; // เช่น วิทยาการคำนวณ (คอมพิวเตอร์), การงานอาชีพ
  classLevel: string; // เช่น ป.1/1
  defaultMaxScore: number;
  icon: string; // Material symbol icon
  color: string; // Tailwind color theme
}

export interface Assignment {
  id: string;
  subjectId: string;
  classLevel: string;
  title: string;
  description: string;
  maxScore: number;
  dueDate: string;
  category: 'homework' | 'quiz' | 'project' | 'behavior'; // A1, A2, A3, etc.
  createdAt: string;
}

export interface GradeEntry {
  id: string;
  studentId: string;
  assignmentId: string;
  score: number | null; // null if not graded yet
  isCompleted: boolean;
  note?: string;
  updatedAt: string;
}

export interface AppScriptConfig {
  webAppUrl: string;
  spreadsheetId?: string;
  sheetName?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface SchoolSettings {
  schoolName: string;
  teacherName: string;
  academicYear: string;
  semester: string;
  mascotUrl: string;
  teacherAvatarUrl: string;
}

export interface AIAnalysisResult {
  summaryText: string;
  classAverage: number;
  passRate: number;
  strengths: string[];
  improvementAreas: string[];
  recommendedActions: string[];
  studentInsights?: Record<string, string>; // studentId -> feedback
}

export type ActiveTab = 
  | 'dashboard' 
  | 'students' 
  | 'grading' 
  | 'summary' 
  | 'appScriptSync' 
  | 'githubExport' 
  | 'aiAssistant';
