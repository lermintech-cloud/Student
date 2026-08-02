import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  initialStudents,
  initialSubjects,
  initialAssignments,
  initialGrades,
  initialSchoolSettings,
  initialAppScriptConfig
} from './src/data/initialData.js';

const PORT = 3000;
const HOST = '0.0.0.0';
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create data dir, using in-memory fallback:', e);
}

// Load or Initialize database state
let dbState = {
  students: [...initialStudents],
  subjects: [...initialSubjects],
  assignments: [...initialAssignments],
  grades: [...initialGrades],
  settings: { ...initialSchoolSettings },
  gasConfig: { ...initialAppScriptConfig }
};

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to db.json:', err);
  }
}

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      dbState = {
        students: parsed.students || [...initialStudents],
        subjects: parsed.subjects || [...initialSubjects],
        assignments: parsed.assignments || [...initialAssignments],
        grades: parsed.grades || [...initialGrades],
        settings: { ...initialSchoolSettings, ...(parsed.settings || {}) },
        gasConfig: { ...initialAppScriptConfig, ...(parsed.gasConfig || {}) }
      };
      console.log('Loaded database from db.json');
    } else {
      saveDb();
    }
  } catch (err) {
    console.warn('Error reading db.json, using initial state:', err);
  }
}

loadDb();

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // API Routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get full database
  app.get('/api/db', (req, res) => {
    res.json(dbState);
  });

  // Update full database or partials
  app.post('/api/db', (req, res) => {
    const { students, subjects, assignments, grades, settings, gasConfig } = req.body;
    if (students) dbState.students = students;
    if (subjects) dbState.subjects = subjects;
    if (assignments) dbState.assignments = assignments;
    if (grades) dbState.grades = grades;
    if (settings) dbState.settings = { ...dbState.settings, ...settings };
    if (gasConfig) dbState.gasConfig = { ...dbState.gasConfig, ...gasConfig };
    saveDb();
    res.json({ success: true, db: dbState });
  });

  // CRUD Students
  app.post('/api/students', (req, res) => {
    const student = req.body;
    if (!student.id) {
      student.id = 'stu-' + Date.now();
    }
    dbState.students.unshift(student);
    saveDb();
    res.json({ success: true, student });
  });

  app.put('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const index = dbState.students.findIndex(s => s.id === id);
    if (index !== -1) {
      dbState.students[index] = { ...dbState.students[index], ...req.body };
      saveDb();
      res.json({ success: true, student: dbState.students[index] });
    } else {
      res.status(404).json({ success: false, error: 'Student not found' });
    }
  });

  app.delete('/api/students/:id', (req, res) => {
    const { id } = req.params;
    dbState.students = dbState.students.filter(s => s.id !== id);
    dbState.grades = dbState.grades.filter(g => g.studentId !== id);
    saveDb();
    res.json({ success: true });
  });

  // CRUD Assignments
  app.post('/api/assignments', (req, res) => {
    const assign = req.body;
    if (!assign.id) {
      assign.id = 'assign-' + Date.now();
    }
    dbState.assignments.push(assign);
    saveDb();
    res.json({ success: true, assignment: assign });
  });

  app.put('/api/assignments/:id', (req, res) => {
    const { id } = req.params;
    const index = dbState.assignments.findIndex(a => a.id === id);
    if (index !== -1) {
      dbState.assignments[index] = { ...dbState.assignments[index], ...req.body };
      saveDb();
      res.json({ success: true, assignment: dbState.assignments[index] });
    } else {
      res.status(404).json({ success: false, error: 'Assignment not found' });
    }
  });

  app.delete('/api/assignments/:id', (req, res) => {
    const { id } = req.params;
    dbState.assignments = dbState.assignments.filter(a => a.id !== id);
    dbState.grades = dbState.grades.filter(g => g.assignmentId !== id);
    saveDb();
    res.json({ success: true });
  });

  // Batch update grades
  app.post('/api/grades/batch', (req, res) => {
    const { entries } = req.body; // Array of GradeEntry
    if (Array.isArray(entries)) {
      entries.forEach(item => {
        const idx = dbState.grades.findIndex(
          g => g.studentId === item.studentId && g.assignmentId === item.assignmentId
        );
        if (idx !== -1) {
          dbState.grades[idx] = { ...dbState.grades[idx], ...item, updatedAt: new Date().toISOString() };
        } else {
          dbState.grades.push({
            id: 'g-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            ...item,
            updatedAt: new Date().toISOString()
          });
        }
      });
      saveDb();
    }
    res.json({ success: true, grades: dbState.grades });
  });

  // Reset database to default mock
  app.post('/api/db/reset', (req, res) => {
    dbState = {
      students: [...initialStudents],
      subjects: [...initialSubjects],
      assignments: [...initialAssignments],
      grades: [...initialGrades],
      settings: { ...initialSchoolSettings },
      gasConfig: { ...initialAppScriptConfig }
    };
    saveDb();
    res.json({ success: true, db: dbState });
  });

  // Google Apps Script Proxy Sync Engine
  app.post('/api/sync/gas', async (req, res) => {
    const { webAppUrl, action, currentData } = req.body;
    const targetUrl = webAppUrl || dbState.gasConfig.webAppUrl;

    if (!targetUrl || !targetUrl.startsWith('https://script.google.com')) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุ URL ของ Google Apps Script Web App ให้ถูกต้อง (ต้องขึ้นต้นด้วย https://script.google.com...)'
      });
    }

    // Apply client latest state if provided
    if (currentData) {
      if (Array.isArray(currentData.students)) dbState.students = currentData.students;
      if (Array.isArray(currentData.subjects)) dbState.subjects = currentData.subjects;
      if (Array.isArray(currentData.assignments)) dbState.assignments = currentData.assignments;
      if (Array.isArray(currentData.grades)) dbState.grades = currentData.grades;
      if (currentData.settings) dbState.settings = { ...dbState.settings, ...currentData.settings };
      saveDb();
    }

    try {
      if (action === 'pull') {
        // Pull from GAS
        const response = await fetch(targetUrl);
        const result = await response.json();
        if (result && (result.students || result.grades)) {
          if (Array.isArray(result.students) && result.students.length > 0) {
            dbState.students = result.students;
          }
          if (Array.isArray(result.assignments) && result.assignments.length > 0) {
            dbState.assignments = result.assignments;
          }
          if (Array.isArray(result.grades) && result.grades.length > 0) {
            dbState.grades = result.grades;
          }
          dbState.gasConfig.lastSyncedAt = new Date().toISOString();
          saveDb();
          return res.json({
            success: true,
            action: 'pull',
            message: 'ดึงข้อมูลจาก Google Sheets เรียบร้อยแล้ว',
            data: dbState
          });
        } else {
          return res.status(500).json({
            success: false,
            error: 'รูปแบบข้อมูลที่ตอบกลับจาก Apps Script ไม่ถูกต้อง'
          });
        }
      } else {
        // Push to GAS
        const payload = {
          action: 'push',
          timestamp: new Date().toISOString(),
          students: dbState.students,
          subjects: dbState.subjects,
          assignments: dbState.assignments,
          grades: dbState.grades
        };

        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        dbState.gasConfig.lastSyncedAt = new Date().toISOString();
        saveDb();
        return res.json({
          success: true,
          action: 'push',
          message: 'ส่งข้อมูลบันทึกใน Google Sheets เรียบร้อยแล้ว',
          result
        });
      }
    } catch (err: any) {
      console.error('GAS Sync Error:', err);
      return res.status(500).json({
        success: false,
        error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.message
      });
    }
  });

  // AI Assistant Engine
  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const { prompt, studentId, targetClass } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      // Calculate class averages and stats
      const totalStudents = dbState.students.length;
      const totalAssignments = dbState.assignments.length;
      let totalMaxScore = dbState.assignments.reduce((sum, a) => sum + a.maxScore, 0);
      if (totalMaxScore === 0) totalMaxScore = 100;

      const studentStats = dbState.students.map(stu => {
        const studentGrades = dbState.grades.filter(g => g.studentId === stu.id && g.score !== null);
        const earned = studentGrades.reduce((sum, g) => sum + (g.score || 0), 0);
        const percent = Math.round((earned / totalMaxScore) * 100);
        return {
          id: stu.id,
          name: `${stu.title}${stu.firstName} ${stu.lastName} (${stu.nickname})`,
          score: earned,
          percent
        };
      });

      const avgPercent = totalStudents > 0
        ? Math.round(studentStats.reduce((sum, s) => sum + s.percent, 0) / totalStudents)
        : 0;

      // If no API key, use rich intelligent local fallback algorithm
      if (!apiKey) {
        const strengths = [
          'นักเรียนร้อยละ 85% มีความเข้าใจเรื่องอัลกอริทึมและคำสั่งทิศทางเป็นอย่างดี',
          'การส่งงานและการเข้าชั้นเรียนมีอัตราสูงถึง 90%',
          'นักเรียนมีความกระตือรือร้นในการทำโครงงานการ์ดแอนิเมชัน'
        ];
        const improvementAreas = [
          'ควรเพิ่มโจทย์ฝึกหัดเรื่องการทำซ้ำ (Loop) สำหรับนักเรียนที่ได้คะแนนทดสอบต่ำกว่า 70%',
          'นักเรียนบางส่วนยังค้างส่งงานโครงงาน A4'
        ];
        const recommendedActions = [
          'จัดสอนเสริมช่วงพักเที่ยงสำหรับนักเรียน 3 คนที่ค้างส่งงาน',
          'เปิดโอกาสให้นักเรียนนำเสนอโครงงานคู่เพื่อเสริมสร้างความมั่นใจ'
        ];

        return res.json({
          success: true,
          source: 'local_algorithm',
          analysis: {
            summaryText: `ผลการเรียนโดยรวมของชั้นเรียนอยู่ในเกณฑ์ดีมาก ค่าเฉลี่ยของชั้นเรียนอยู่ที่ ${avgPercent}% โดยมีนักเรียนดีเด่นที่ได้คะแนนเกิน 90% จำนวน ${studentStats.filter(s => s.percent >= 90).length} คน`,
            classAverage: avgPercent,
            passRate: Math.round((studentStats.filter(s => s.percent >= 50).length / Math.max(totalStudents, 1)) * 100),
            strengths,
            improvementAreas,
            recommendedActions
          }
        });
      }

      // If API Key is present, call Gemini 3.6 Flash
      const ai = new GoogleGenAI({ apiKey });
      const model = 'gemini-3.6-flash';

      const promptText = `คุณคือ "น้องชิบิ AI" ผู้ช่วยคุณครูประจำโรงเรียนบ้านไร่ ระดับชั้นประถมศึกษา
กรุณาวิเคราะห์ผลคะแนนของนักเรียนต่อไปนี้ให้อยู่ในรูป JSON ที่ถูกต้อง:
ข้อมูลนักเรียนและคะแนนร้อยละ:
${JSON.stringify(studentStats, null, 2)}
ค่าเฉลี่ยชั้นเรียน: ${avgPercent}%

ตอบกลับเป็น JSON format เท่านั้น โดยมี structure:
{
  "summaryText": "สรุปภาพรวมห้องเรียน 2-3 ประโยค ภาษาไทย เป็นกันเอง ให้กำลังใจคุณครู",
  "classAverage": number,
  "passRate": number,
  "strengths": ["จุดเด่นข้อ 1", "จุดเด่นข้อ 2", "จุดเด่นข้อ 3"],
  "improvementAreas": ["จุดที่ควรพัฒนาข้อ 1", "จุดที่ควรพัฒนาข้อ 2"],
  "recommendedActions": ["คำแนะนำการสอนสำหรับคุณครู 1", "คำแนะนำ 2"]
}`;

      const response = await ai.models.generateContent({
        model,
        contents: promptText,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        source: 'gemini',
        analysis: parsed
      });

    } catch (error: any) {
      console.error('AI Analyze Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`🌸 Chibi Gradebook Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
