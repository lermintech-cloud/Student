import {
  Student,
  Subject,
  Assignment,
  GradeEntry,
  SchoolSettings,
  AppScriptConfig,
  AIAnalysisResult
} from '../types.js';
import {
  initialStudents,
  initialSubjects,
  initialAssignments,
  initialGrades,
  initialSchoolSettings,
  initialAppScriptConfig
} from '../data/initialData.js';

const API_BASE = '/api';

export interface FullDbState {
  students: Student[];
  subjects: Subject[];
  assignments: Assignment[];
  grades: GradeEntry[];
  settings: SchoolSettings;
  gasConfig: AppScriptConfig;
}

export async function fetchDatabase(): Promise<FullDbState> {
  try {
    const res = await fetch(`${API_BASE}/db`);
    if (!res.ok) throw new Error('Failed to fetch DB');
    return await res.json();
  } catch (err) {
    console.warn('Backend offline or fallback to localStorage:', err);
    const saved = localStorage.getItem('chibi_gradebook_db');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      students: [...initialStudents],
      subjects: [...initialSubjects],
      assignments: [...initialAssignments],
      grades: [...initialGrades],
      settings: { ...initialSchoolSettings },
      gasConfig: { ...initialAppScriptConfig }
    };
  }
}

export async function saveDatabase(db: FullDbState): Promise<void> {
  try {
    localStorage.setItem('chibi_gradebook_db', JSON.stringify(db));
    await fetch(`${API_BASE}/db`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db)
    });
  } catch (err) {
    console.warn('Could not save to backend, saved to localStorage:', err);
  }
}

export async function resetDatabase(): Promise<FullDbState> {
  localStorage.removeItem('chibi_gradebook_db');
  try {
    const res = await fetch(`${API_BASE}/db/reset`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      return data.db;
    }
  } catch (err) {
    console.warn('Reset local fallback:', err);
  }
  return {
    students: [...initialStudents],
    subjects: [...initialSubjects],
    assignments: [...initialAssignments],
    grades: [...initialGrades],
    settings: { ...initialSchoolSettings },
    gasConfig: { ...initialAppScriptConfig }
  };
}

export async function syncWithAppsScript(webAppUrl: string, action: 'push' | 'pull'): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  data?: FullDbState;
}> {
  try {
    const res = await fetch(`${API_BASE}/sync/gas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webAppUrl, action })
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ: ' + err.message
    };
  }
}

export async function analyzeClassWithAI(
  students: Student[],
  assignments: Assignment[],
  grades: GradeEntry[]
): Promise<{
  success: boolean;
  analysis?: AIAnalysisResult;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students, assignments, grades })
    });
    const data = await res.json();
    return { success: data.success, analysis: data.analysis };
  } catch (err: any) {
    return {
      success: false,
      error: 'วิเคราะห์ AI ไม่สำเร็จ: ' + err.message
    };
  }
}

// Utility to export students and scores as CSV
export function exportToCSV(
  students: Student[],
  assignments: Assignment[],
  grades: GradeEntry[],
  filename = 'สรุปคะแนนนักเรียน_โรงเรียนบ้านไร่.csv'
) {
  // UTF-8 BOM for Thai support in Excel
  const BOM = '\uFEFF';
  const headers = [
    'รหัส',
    'คำนำหน้า',
    'ชื่อ',
    'นามสกุล',
    'ชื่อเล่น',
    'ชั้นเรียน',
    'ห้อง',
    ...assignments.map(a => a.title),
    'รวมคะแนน',
    'ร้อยละ',
    'สถานะ'
  ];

  const rows = students.map(stu => {
    let totalScore = 0;
    let totalMax = 0;

    const assignScores = assignments.map(a => {
      totalMax += a.maxScore;
      const g = grades.find(x => x.studentId === stu.id && x.assignmentId === a.id);
      if (g && g.score !== null) {
        totalScore += g.score;
        return g.score.toString();
      }
      return '-';
    });

    const percent = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(1) + '%' : '0%';

    return [
      `"${stu.code}"`,
      `"${stu.title}"`,
      `"${stu.firstName}"`,
      `"${stu.lastName}"`,
      `"${stu.nickname}"`,
      `"${stu.classLevel}"`,
      `"${stu.room}"`,
      ...assignScores,
      totalScore,
      `"${percent}"`,
      `"${stu.status === 'active' ? 'ใช้งาน' : 'ขาดเรียน'}"`
    ];
  });

  const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
