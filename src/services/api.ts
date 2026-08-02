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
    const res = await fetch(`${API_BASE}/db`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) throw new Error('Failed to fetch centralized server database');
    return await res.json();
  } catch (err) {
    console.warn('Centralized server database fetch error, returning initial fallback state:', err);
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
    await fetch(`${API_BASE}/db`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db)
    });
  } catch (err) {
    console.warn('Could not save to Centralized Server Database (/api/db):', err);
  }
}

export async function resetDatabase(): Promise<FullDbState> {
  try {
    const res = await fetch(`${API_BASE}/db/reset`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      return data.db;
    }
  } catch (err) {
    console.warn('Reset centralized database error:', err);
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

export async function syncWithAppsScript(
  webAppUrl: string,
  action: 'push' | 'pull',
  currentData?: FullDbState
): Promise<{
  success: boolean;
  action?: 'push' | 'pull';
  message?: string;
  error?: string;
  data?: FullDbState;
}> {
  if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com')) {
    return {
      success: false,
      error: 'กรุณาระบุ URL ของ Google Apps Script Web App ให้ถูกต้อง (ต้องขึ้นต้นด้วย https://script.google.com...)'
    };
  }

  try {
    const res = await fetch(`${API_BASE}/sync/gas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webAppUrl, action, currentData })
    });
    if (!res.ok) {
      throw new Error(`HTTP status ${res.status}`);
    }
    const json = await res.json();
    if (json && json.success === false) {
      throw new Error(json.error || 'Server GAS sync reported failure');
    }
    return json;
  } catch (err: any) {
    console.warn('Backend proxy sync failed, switching to direct client Apps Script sync:', err);
    return await fallbackGasDirectSync(webAppUrl, action, currentData);
  }
}

async function fallbackGasDirectSync(
  webAppUrl: string,
  action: 'push' | 'pull',
  currentData?: FullDbState
): Promise<{
  success: boolean;
  action?: 'push' | 'pull';
  message?: string;
  error?: string;
  data?: FullDbState;
}> {
  try {
    if (action === 'pull') {
      const res = await fetch(webAppUrl, {
        method: 'GET',
        redirect: 'follow'
      });
      const text = await res.text();
      try {
        const result = JSON.parse(text);
        if (result && (result.students || result.grades || result.status === 'success')) {
          const loadedDb: FullDbState = {
            students: Array.isArray(result.students) && result.students.length > 0 ? result.students : (currentData?.students || []),
            subjects: Array.isArray(result.subjects) && result.subjects.length > 0 ? result.subjects : (currentData?.subjects || []),
            assignments: Array.isArray(result.assignments) && result.assignments.length > 0 ? result.assignments : (currentData?.assignments || []),
            grades: Array.isArray(result.grades) && result.grades.length > 0 ? result.grades : (currentData?.grades || []),
            settings: result.settings && typeof result.settings === 'object' ? { ...initialSchoolSettings, ...result.settings } : (currentData?.settings || { ...initialSchoolSettings }),
            gasConfig: {
              ...(currentData?.gasConfig || { ...initialAppScriptConfig }),
              webAppUrl,
              lastSyncedAt: new Date().toISOString()
            }
          };
          return {
            success: true,
            action: 'pull',
            message: 'เชื่อมต่อและดึงข้อมูลจาก Google Sheets เรียบร้อยแล้ว (Direct Mode)',
            data: loadedDb
          };
        }
      } catch (parseErr) {
        return {
          success: false,
          error: 'ไม่สามารถอ่านค่า JSON จาก Google Sheets ได้ (โปรดตรวจสอบว่าตอน Deploy ได้ตั้งค่า Who has access เป็น Anyone)'
        };
      }
    } else {
      // action === 'push'
      const payloadData = currentData || {
        students: initialStudents,
        subjects: initialSubjects,
        assignments: initialAssignments,
        grades: initialGrades,
        settings: initialSchoolSettings
      };
      const payload = {
        action: 'push',
        timestamp: new Date().toISOString(),
        students: payloadData.students,
        subjects: payloadData.subjects,
        assignments: payloadData.assignments,
        grades: payloadData.grades,
        settings: payloadData.settings || initialSchoolSettings
      };

      try {
        const res = await fetch(webAppUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload),
          redirect: 'follow'
        });

        const text = await res.text();
        try {
          const result = JSON.parse(text);
          if (result && result.status === 'success') {
            return {
              success: true,
              message: 'ส่งข้อมูลบันทึกใน Google Sheets เรียบร้อยแล้ว (Direct Mode)'
            };
          }
        } catch (err) {
          if (res.ok || res.status === 200 || res.status === 0) {
            return {
              success: true,
              message: 'ส่งข้อมูลบันทึกใน Google Sheets เรียบร้อยแล้ว (Direct Mode)'
            };
          }
        }
      } catch (corsErr) {
        // Fallback to mode: 'no-cors' when browser CORS blocks Apps Script redirects
        await fetch(webAppUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        return {
          success: true,
          message: 'ส่งข้อมูลบันทึกใน Google Sheets เรียบร้อยแล้ว (Direct no-cors)'
        };
      }
      return {
        success: true,
        message: 'ส่งข้อมูลบันทึกใน Google Sheets เรียบร้อยแล้ว'
      };
    }
    return { success: false, error: 'ไม่สามารถดำเนินการเชื่อมต่อได้' };
  } catch (err: any) {
    return {
      success: false,
      error: 'เชื่อมต่อ Google Sheets ไม่สำเร็จ: ' + err.message + ' (โปรดตรวจดูว่าตอน Deploy ใน Apps Script เลือก Who has access เป็น Anyone)'
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
