import React, { useState, useEffect } from 'react';
import {
  Student,
  Subject,
  Assignment,
  GradeEntry,
  SchoolSettings,
  AppScriptConfig,
  ActiveTab
} from './types.js';
import {
  initialStudents,
  initialSubjects,
  initialAssignments,
  initialGrades,
  initialSchoolSettings,
  initialAppScriptConfig
} from './data/initialData.js';
import {
  fetchDatabase,
  saveDatabase,
  resetDatabase,
  syncWithAppsScript,
  FullDbState
} from './services/api.js';

import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { DashboardTab } from './components/DashboardTab.js';
import { StudentsTab } from './components/StudentsTab.js';
import { GradingTab } from './components/GradingTab.js';
import { SummaryTab } from './components/SummaryTab.js';
import { AppScriptSyncTab } from './components/AppScriptSyncTab.js';
import { GitHubExportTab } from './components/GitHubExportTab.js';
import { NewAssignmentModal } from './components/NewAssignmentModal.js';
import { AIAssistantModal } from './components/AIAssistantModal.js';
import { SettingsTab } from './components/SettingsTab.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [grades, setGrades] = useState<GradeEntry[]>(initialGrades);
  const [settings, setSettings] = useState<SchoolSettings>(initialSchoolSettings);
  const [gasConfig, setGasConfig] = useState<AppScriptConfig>(initialAppScriptConfig);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('assign-3');
  const [isNewAssignModalOpen, setIsNewAssignModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type?: 'success' | 'info' | 'warning';
  } | null>(null);

  const showToast = (
    text: string,
    type: 'success' | 'info' | 'warning' = 'success'
  ) => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 3200);
  };

  // Load database on mount
  useEffect(() => {
    fetchDatabase().then((data: FullDbState) => {
      if (data) {
        if (data.students) setStudents(data.students);
        if (data.subjects) setSubjects(data.subjects);
        if (data.assignments) {
          setAssignments(data.assignments);
          if (data.assignments.length > 0 && !data.assignments.find(a => a.id === selectedAssignmentId)) {
            setSelectedAssignmentId(data.assignments[0].id);
          }
        }
        if (data.grades) setGrades(data.grades);
        if (data.settings) setSettings(data.settings);
        if (data.gasConfig) {
          setGasConfig(data.gasConfig);
          // Auto-pull from Google Sheets if autoSync is ON and webAppUrl is set (Multi-Device Sync)
          if (data.gasConfig.webAppUrl && data.gasConfig.autoSync) {
            syncWithAppsScript(data.gasConfig.webAppUrl, 'pull', data)
              .then(res => {
                if (res.success && res.data) {
                  if (res.data.students) setStudents(res.data.students);
                  if (res.data.subjects) setSubjects(res.data.subjects);
                  if (res.data.assignments) setAssignments(res.data.assignments);
                  if (res.data.grades) setGrades(res.data.grades);
                  showToast('☁️ โหลดและซิงค์ข้อมูลล่าสุดจาก Google Sheets (ใช้งานข้ามอุปกรณ์) เรียบร้อยแล้วค่ะ!', 'success');
                }
              })
              .catch(err => console.warn('Auto-pull from Google Sheets failed:', err));
          }
        }
      }
    });
  }, []);

  // Save changes helper
  const persistChanges = (
    newStudents?: Student[],
    newSubjects?: Subject[],
    newAssignments?: Assignment[],
    newGrades?: GradeEntry[],
    newSettings?: SchoolSettings,
    newGasConfig?: AppScriptConfig,
    toastText?: string,
    toastType: 'success' | 'info' | 'warning' = 'success'
  ) => {
    const updatedDb: FullDbState = {
      students: newStudents || students,
      subjects: newSubjects || subjects,
      assignments: newAssignments || assignments,
      grades: newGrades || grades,
      settings: newSettings || settings,
      gasConfig: newGasConfig || gasConfig
    };
    saveDatabase(updatedDb);

    // Auto-sync to Google Sheets if configured and autoSync is enabled
    const targetGas = updatedDb.gasConfig;
    if (targetGas?.webAppUrl && targetGas?.autoSync) {
      syncWithAppsScript(targetGas.webAppUrl, 'push', updatedDb)
        .then(res => {
          if (res.success) {
            setGasConfig(prev => ({
              ...prev,
              lastSyncedAt: new Date().toISOString()
            }));
            if (toastText) {
              showToast(`${toastText} (☁️ ซิงค์ Google Sheets อัตโนมัติแล้ว)`, toastType);
            } else {
              showToast('☁️ บันทึกและซิงค์ข้อมูลขึ้น Google Sheets อัตโนมัติแล้วค่ะ', 'success');
            }
          } else {
            if (toastText) {
              showToast(`${toastText} (⚠️ ยังไม่ได้ซิงค์ Sheet: ${res.error || 'ตรวจสอบ URL'})`, 'warning');
            }
          }
        })
        .catch(err => {
          console.warn('Auto-sync to Google Sheets failed:', err);
          if (toastText) {
            showToast(toastText, toastType);
          }
        });
    } else {
      if (toastText) {
        showToast(toastText, toastType);
      }
    }
  };

  const handleSaveStudent = (stu: Partial<Student>) => {
    let updatedList: Student[];
    const isEdit = Boolean(stu.id);
    if (stu.id) {
      updatedList = students.map(s => (s.id === stu.id ? { ...s, ...stu } : s));
    } else {
      const newStu: Student = {
        id: 'stu-' + Date.now(),
        code: stu.code || (students.length + 1).toString().padStart(3, '0'),
        title: stu.title || 'ด.ช.',
        firstName: stu.firstName || '',
        lastName: stu.lastName || '',
        nickname: stu.nickname || '',
        gender: stu.gender || 'male',
        classLevel: stu.classLevel || 'ป.1/1',
        room: stu.room || 'ห้อง 101',
        avatar: stu.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1zrbR5LJ132IT7GHNZ6XJHu81UNgH7_kYAfB8291kvt62_NfAJMZX9jL4aSEHBLZE3OYbqLu5PHHnf6cRJAEt7VvOTyMZqTQA_t0OIHWhxqfph3kgrpx2s9bpfa4Z6Ja1DZ5MgL0D6YpBzqLXyt621PJJrWg9pybZQvwd8Ft6ofEg3lHK8hQYsb8jNSOk9SuIqQlyHy5GueIu1Wkpt2GEzXQjuJ5V7X-gtUBBFG0ShbcUz55CxW5B',
        status: stu.status || 'active',
        note: stu.note || '',
        createdAt: new Date().toISOString().slice(0, 10)
      };
      updatedList = [newStu, ...students];
    }
    setStudents(updatedList);
    persistChanges(
      updatedList,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      isEdit ? `✏️ อัปเดตข้อมูลคุณครู/นักเรียน "${stu.firstName || ''}" เรียบร้อยแล้วค่ะ` : `🎉 เพิ่มนักเรียนใหม่ "${stu.firstName || ''}" เรียบร้อยแล้วค่ะ`,
      'success'
    );
  };

  const handleDeleteStudent = (id: string) => {
    const updatedStudents = students.filter(s => s.id !== id);
    const updatedGrades = grades.filter(g => g.studentId !== id);
    setStudents(updatedStudents);
    setGrades(updatedGrades);
    persistChanges(
      updatedStudents,
      undefined,
      undefined,
      updatedGrades,
      undefined,
      undefined,
      '🗑️ ลบข้อมูลนักเรียนออกจากระบบแล้วค่ะ',
      'info'
    );
  };

  const handleBatchAddStudents = (newStudentsList: Partial<Student>[]) => {
    const defaultAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1zrbR5LJ132IT7GHNZ6XJHu81UNgH7_kYAfB8291kvt62_NfAJMZX9jL4aSEHBLZE3OYbqLu5PHHnf6cRJAEt7VvOTyMZqTQA_t0OIHWhxqfph3kgrpx2s9bpfa4Z6Ja1DZ5MgL0D6YpBzqLXyt621PJJrWg9pybZQvwd8Ft6ofEg3lHK8hQYsb8jNSOk9SuIqQlyHy5GueIu1Wkpt2GEzXQjuJ5V7X-gtUBBFG0ShbcUz55CxW5B';
    const currentCount = students.length;
    const createdList: Student[] = newStudentsList.map((stu, idx) => ({
      ...stu,
      id: 'stu-batch-' + Date.now() + '-' + idx,
      code: stu.code || (currentCount + idx + 1).toString().padStart(3, '0'),
      title: stu.title || 'ด.ช.',
      firstName: stu.firstName || '',
      lastName: stu.lastName || '',
      nickname: stu.nickname || 'น้อง' + (stu.firstName || ''),
      gender: stu.gender || 'male',
      classLevel: stu.classLevel || 'ป.1/1',
      room: stu.room || 'ห้อง 101',
      avatar: stu.avatar || defaultAvatar,
      status: stu.status || 'active',
      note: stu.note || '',
      createdAt: new Date().toISOString().slice(0, 10)
    }));
    const updatedList = [...createdList, ...students];
    setStudents(updatedList);
    persistChanges(
      updatedList,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      `✨ นำเข้ารายชื่อนักเรียนใหม่ ${createdList.length} คน เรียบร้อยแล้วค่ะ!`,
      'success'
    );
  };

  const handleSaveAssignment = (assign: Partial<Assignment>) => {
    let updatedList: Assignment[];
    const isEdit = Boolean(assign.id);
    if (assign.id) {
      updatedList = assignments.map(a => (a.id === assign.id ? { ...a, ...assign } : a));
    } else {
      const newAssign: Assignment = {
        id: 'assign-' + Date.now(),
        subjectId: assign.subjectId || 'sub-1',
        classLevel: assign.classLevel || 'ป.1/1',
        title: assign.title || 'งานใหม่',
        description: assign.description || '',
        maxScore: assign.maxScore || 10,
        dueDate: assign.dueDate || new Date().toISOString().slice(0, 10),
        category: assign.category || 'homework',
        createdAt: new Date().toISOString().slice(0, 10)
      };
      updatedList = [...assignments, newAssign];
      setSelectedAssignmentId(newAssign.id);
      setActiveTab('grading');
    }
    setAssignments(updatedList);
    persistChanges(
      undefined,
      undefined,
      updatedList,
      undefined,
      undefined,
      undefined,
      isEdit ? `📝 บันทึกการแก้ไขงาน "${assign.title || ''}" แล้วค่ะ` : `📌 มอบหมายงานใหม่ "${assign.title || 'งานใหม่'}" เรียบร้อยแล้วค่ะ`,
      'success'
    );
  };

  const handleDeleteAssignment = (id: string) => {
    const updatedAssign = assignments.filter(a => a.id !== id);
    const updatedGrades = grades.filter(g => g.assignmentId !== id);
    setAssignments(updatedAssign);
    setGrades(updatedGrades);
    if (selectedAssignmentId === id && updatedAssign.length > 0) {
      setSelectedAssignmentId(updatedAssign[0].id);
    }
    persistChanges(
      undefined,
      undefined,
      updatedAssign,
      updatedGrades,
      undefined,
      undefined,
      '🗑️ ลบชิ้นงานและคะแนนที่เกี่ยวข้องแล้วค่ะ',
      'info'
    );
  };

  const handleSaveGrades = (newGrades: GradeEntry[]) => {
    setGrades(newGrades);
    persistChanges(
      undefined,
      undefined,
      undefined,
      newGrades,
      undefined,
      undefined,
      '💾 บันทึกคะแนนเรียบร้อยแล้วค่ะ (บันทึกอัตโนมัติ)',
      'success'
    );
  };

  const handleGiveAllFullScore = () => {
    const targetAssign =
      assignments.find(a => a.id === selectedAssignmentId) || assignments[0];
    if (!targetAssign) return;

    const activeStudents = students.filter(s => s.status === 'active');
    const updatedGrades = [...grades];

    activeStudents.forEach(stu => {
      const idx = updatedGrades.findIndex(
        g => g.studentId === stu.id && g.assignmentId === targetAssign.id
      );
      if (idx !== -1) {
        updatedGrades[idx] = {
          ...updatedGrades[idx],
          score: targetAssign.maxScore,
          isCompleted: true,
          updatedAt: new Date().toISOString()
        };
      } else {
        updatedGrades.push({
          id: 'g-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          studentId: stu.id,
          assignmentId: targetAssign.id,
          score: targetAssign.maxScore,
          isCompleted: true,
          updatedAt: new Date().toISOString()
        });
      }
    });

    setGrades(updatedGrades);
    persistChanges(
      undefined,
      undefined,
      undefined,
      updatedGrades,
      undefined,
      undefined,
      '⭐ ให้คะแนนเต็มทุกคนเรียบร้อยแล้วค่ะ!',
      'success'
    );
  };

  const handleUpdateGasConfig = (config: Partial<AppScriptConfig>) => {
    const updated = { ...gasConfig, ...config };
    setGasConfig(updated);
    persistChanges(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      updated,
      '🔗 บันทึกการเชื่อมต่อ Google Sheets / Apps Script แล้วค่ะ',
      'success'
    );
  };

  const handleDataPulledFromGas = (db: FullDbState) => {
    if (db.students) setStudents(db.students);
    if (db.subjects) setSubjects(db.subjects);
    if (db.assignments) setAssignments(db.assignments);
    if (db.grades) setGrades(db.grades);
    if (db.settings) setSettings(db.settings);
    if (db.gasConfig) setGasConfig(db.gasConfig);
    showToast('📥 ซิงค์ข้อมูลและอัปเดตตารางคะแนนเรียบร้อยแล้วค่ะ!', 'success');
  };

  const handleSaveSubject = (sub: Partial<Subject>) => {
    let updatedList: Subject[];
    const isEdit = Boolean(sub.id);
    if (sub.id) {
      updatedList = subjects.map(s => (s.id === sub.id ? { ...s, ...sub } : s));
    } else {
      const newSub: Subject = {
        id: 'sub-' + Date.now(),
        code: sub.code || 'SUB-101',
        name: sub.name || 'รายวิชาใหม่',
        classLevel: sub.classLevel || 'ป.1/1',
        defaultMaxScore: sub.defaultMaxScore || 10,
        icon: sub.icon || 'menu_book',
        color: sub.color || 'bg-[#a7d8ff] text-[#001e2f] border-[#306385]'
      };
      updatedList = [...subjects, newSub];
    }
    setSubjects(updatedList);
    persistChanges(
      undefined,
      updatedList,
      undefined,
      undefined,
      undefined,
      undefined,
      isEdit ? `✏️ อัปเดตรายวิชา "${sub.name || ''}" เรียบร้อยแล้วค่ะ` : `🎉 เพิ่มรายวิชา "${sub.name || ''}" เรียบร้อยแล้วค่ะ`,
      'success'
    );
  };

  const handleDeleteSubject = (id: string) => {
    const updatedSubjects = subjects.filter(s => s.id !== id);
    setSubjects(updatedSubjects);
    persistChanges(
      undefined,
      updatedSubjects,
      undefined,
      undefined,
      undefined,
      undefined,
      '🗑️ ลบรายวิชาออกจากระบบแล้วค่ะ',
      'info'
    );
  };

  const handleUpdateSettings = (newSettings: Partial<SchoolSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    persistChanges(
      undefined,
      undefined,
      undefined,
      undefined,
      updated,
      undefined,
      '⚙️ บันทึกการตั้งค่าระบบเรียบร้อยแล้วค่ะ',
      'success'
    );
  };

  const handleClearAllData = () => {
    if (
      confirm(
        'คำเตือน: คุณต้องการล้างข้อมูลนักเรียน งาน และคะแนนทั้งหมด เพื่อเตรียมรับห้องเรียนใหม่หรือปีการศึกษาใหม่ใช่หรือไม่?\n\n(ชื่อโรงเรียน และรายวิชาที่สอนจะยังอยู่ครบเหมือนเดิม)'
      )
    ) {
      const emptyStudents: Student[] = [];
      const emptyAssignments: Assignment[] = [];
      const emptyGrades: GradeEntry[] = [];
      setStudents(emptyStudents);
      setAssignments(emptyAssignments);
      setGrades(emptyGrades);
      persistChanges(
        emptyStudents,
        undefined,
        emptyAssignments,
        emptyGrades,
        undefined,
        undefined,
        '✨ ล้างข้อมูลนักเรียนและคะแนนเรียบร้อยแล้ว พร้อมสำหรับห้องเรียนใหม่ค่ะ',
        'success'
      );
    }
  };

  const handleResetData = async () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลกลับไปใช้ข้อมูลตัวอย่างเริ่มต้นหรือไม่?')) {
      const data = await resetDatabase();
      if (data) {
        setStudents(data.students);
        setSubjects(data.subjects);
        setAssignments(data.assignments);
        setGrades(data.grades);
        setSettings(data.settings);
        setGasConfig(data.gasConfig);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9ff] text-[#151c27] font-body">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        gasConfig={gasConfig}
        onOpenNewAssignment={() => setIsNewAssignModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onOpenNewAssignment={() => setIsNewAssignModalOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 lg:ml-72 pt-24 pb-16 px-4 md:px-8 max-w-[1600px] w-full mx-auto">
        {activeTab === 'dashboard' && (
          <DashboardTab
            students={students}
            subjects={subjects}
            assignments={assignments}
            grades={grades}
            gasConfig={gasConfig}
            setActiveTab={setActiveTab}
            onOpenNewAssignment={() => setIsNewAssignModalOpen(true)}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            onGiveAllFullScore={handleGiveAllFullScore}
          />
        )}

        {activeTab === 'students' && (
          <StudentsTab
            students={students}
            assignments={assignments}
            grades={grades}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onBatchAddStudents={handleBatchAddStudents}
            gasConfig={gasConfig}
            onOpenGasSync={() => setActiveTab('appScriptSync')}
          />
        )}

        {activeTab === 'grading' && (
          <GradingTab
            students={students}
            subjects={subjects}
            assignments={assignments}
            grades={grades}
            selectedAssignmentId={selectedAssignmentId}
            setSelectedAssignmentId={setSelectedAssignmentId}
            onSaveGrades={handleSaveGrades}
            onSaveAssignment={handleSaveAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onOpenNewAssignment={() => setIsNewAssignModalOpen(true)}
          />
        )}

        {activeTab === 'summary' && (
          <SummaryTab
            students={students}
            subjects={subjects}
            assignments={assignments}
            grades={grades}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          />
        )}

        {activeTab === 'appScriptSync' && (
          <AppScriptSyncTab
            gasConfig={gasConfig}
            onUpdateGasConfig={handleUpdateGasConfig}
            onDataPulledFromGas={handleDataPulledFromGas}
          />
        )}

        {activeTab === 'githubExport' && (
          <GitHubExportTab
            settings={settings}
            fullDb={{
              students,
              subjects,
              assignments,
              grades,
              settings,
              gasConfig
            }}
            onRestoreDb={handleDataPulledFromGas}
          />
        )}

        {activeTab === 'aiAssistant' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div className="bg-[#ffffff] rounded-3xl p-8 chibi-shadow text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#fdbec9] text-[#330f19] flex items-center justify-center font-bold text-3xl mx-auto shadow-sm">
                🤖
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#306385]">
                น้องชิบิ AI ผู้ช่วยครู - วิเคราะห์คะแนนและคำแนะนำ
              </h2>
              <p className="text-[#41474d] text-sm max-w-lg mx-auto">
                คลิกปุ่มด้านล่างเพื่อให้น้องชิบิวิเคราะห์จุดเด่น จุดที่ควรเสริม และสร้างคำแนะนำรายบุคคลสำหรับนักเรียนทุกคน
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setIsAiAssistantOpen(true)}
                  className="px-8 py-3.5 rounded-full bg-[#306385] text-white font-bold text-sm shadow-md chibi-button flex items-center gap-2 mx-auto"
                >
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <span>เริ่มวิเคราะห์คะแนนนักเรียนทันที</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            subjects={subjects}
            onSaveSubject={handleSaveSubject}
            onDeleteSubject={handleDeleteSubject}
            gasConfig={gasConfig}
            setActiveTab={setActiveTab}
            onResetData={handleResetData}
            onClearAllData={handleClearAllData}
            fullDb={{
              students,
              subjects,
              assignments,
              grades,
              settings,
              gasConfig
            }}
            onRestoreDb={handleDataPulledFromGas}
          />
        )}
      </main>

      {/* CENTRAL FLOATING STATUS / TOAST NOTIFICATION (TOP-CENTER OF SCREEN) */}
      {toastMessage && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3.5 rounded-full bg-white border-2 shadow-[0_12px_36px_rgba(0,0,0,0.18)] animate-slide-down text-sm font-extrabold max-w-lg w-auto pointer-events-auto ${
            toastMessage.type === 'info'
              ? 'border-[#306385] text-[#001e2f]'
              : toastMessage.type === 'warning'
              ? 'border-[#996300] text-[#4d3a00]'
              : 'border-[#0a522f] text-[#0a522f]'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
              toastMessage.type === 'info'
                ? 'bg-[#e2e8f8] border-[#a7d8ff]'
                : toastMessage.type === 'warning'
                ? 'bg-[#fff0cb] border-[#ffe299]'
                : 'bg-[#ebf7f0] border-[#93d5a7]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {toastMessage.type === 'info'
                ? 'info'
                : toastMessage.type === 'warning'
                ? 'warning'
                : 'check_circle'}
            </span>
          </div>
          <span className="truncate">{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#71787e] hover:text-[#151c27] transition-colors flex items-center shrink-0"
            title="ปิดหน้าต่างแจ้งเตือน"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* New Assignment Modal */}
      <NewAssignmentModal
        isOpen={isNewAssignModalOpen}
        onClose={() => setIsNewAssignModalOpen(false)}
        subjects={subjects}
        onSave={handleSaveAssignment}
      />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        students={students}
        assignments={assignments}
        grades={grades}
      />
    </div>
  );
}
