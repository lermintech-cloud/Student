import React, { useState, useMemo } from 'react';
import { Student, Assignment, GradeEntry, AppScriptConfig, Subject } from '../types.js';
import { exportToCSV } from '../services/api.js';
import { StudentAvatar } from './StudentAvatar.js';

interface StudentsTabProps {
  students: Student[];
  subjects?: Subject[];
  assignments: Assignment[];
  grades: GradeEntry[];
  onSaveStudent: (student: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onBatchAddStudents?: (students: Partial<Student>[]) => void;
  onBatchUpdateStudents?: (students: Student[], message?: string) => void;
  gasConfig?: AppScriptConfig;
  onOpenGasSync?: () => void;
}

function parseStudentLines(
  text: string,
  defaultClassLevel: string,
  defaultRoom: string,
  existingCount: number
): Partial<Student>[] {
  const lines = text.split(/\r?\n/);
  const results: Partial<Student>[] = [];

  const TITLE_MAP: { [key: string]: { title: string; gender: 'male' | 'female' } } = {
    'เด็กชาย': { title: 'ด.ช.', gender: 'male' },
    'เด็กหญิง': { title: 'ด.ญ.', gender: 'female' },
    'ด.ช.': { title: 'ด.ช.', gender: 'male' },
    'ด.ญ.': { title: 'ด.ญ.', gender: 'female' },
    'ด.ช': { title: 'ด.ช.', gender: 'male' },
    'ด.ญ': { title: 'ด.ญ.', gender: 'female' },
    'นาย': { title: 'นาย', gender: 'male' },
    'นางสาว': { title: 'นางสาว', gender: 'female' },
    'น.ส.': { title: 'น.ส.', gender: 'female' },
    'น.ส': { title: 'น.ส.', gender: 'female' },
    'Master': { title: 'Master', gender: 'male' },
    'Miss': { title: 'Miss', gender: 'female' },
    'Mr.': { title: 'Mr.', gender: 'male' },
  };

  const titleKeys = Object.keys(TITLE_MAP).sort((a, b) => b.length - a.length);

  let idxNumber = 1;
  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (
      !trimmed ||
      trimmed.startsWith('#') ||
      trimmed.includes('คำนำหน้า') ||
      trimmed.includes('ชื่อ-สกุล') ||
      trimmed.includes('ชื่อจริง') ||
      trimmed.includes('นามสกุล') ||
      trimmed.startsWith('รหัส') ||
      trimmed.startsWith('Code') ||
      trimmed.startsWith('ลำดับ') ||
      trimmed.startsWith('เลขที่')
    ) {
      continue;
    }

    let parts: string[];
    if (trimmed.includes('\t')) {
      parts = trimmed.split('\t').map(p => p.replace(/^["']|["']$/g, '').trim()).filter(Boolean);
    } else if (trimmed.includes(',')) {
      parts = trimmed.split(',').map(p => p.replace(/^["']|["']$/g, '').trim()).filter(Boolean);
    } else {
      parts = trimmed.split(/\s+/).map(p => p.replace(/^["']|["']$/g, '').trim()).filter(Boolean);
    }

    if (parts.length === 0) continue;

    let code = '';
    let title = 'ด.ช.';
    let gender: 'male' | 'female' = 'male';
    let firstName = '';
    let lastName = '';
    let nickname = '';
    let classLevel = defaultClassLevel;
    let room = defaultRoom;

    const nameTokens: string[] = [];
    let foundTitle = false;
    let foundClass = false;
    let foundNumeric = false;

    for (let i = 0; i < parts.length; i++) {
      let token = parts[i];

      // 1. Check if token is a Class Level (e.g. "ป.1", "ป.1/1", "ม.3/2", "อ.2")
      if (/^(ป|ม|อ|อนุบาล|ประถม|มัธยม)\.?\s*([1-6])(\/[0-9]+)?$/i.test(token)) {
        classLevel = token.replace(/\s+/g, '');
        foundClass = true;
        continue;
      }

      // 2. Check if token is a Room token (e.g. "ห้อง 101", "ห้อง1", "Room 1")
      if (token.startsWith('ห้อง') || token.startsWith('Room')) {
        room = token;
        continue;
      }

      // 3. Check if token is Title or starts with Title (e.g. "เด็กชาย", "เด็กหญิง")
      if (!foundTitle) {
        let matchedTitleKey: string | null = null;
        for (const k of titleKeys) {
          if (token === k) {
            matchedTitleKey = k;
            token = '';
            break;
          } else if (token.startsWith(k)) {
            matchedTitleKey = k;
            token = token.slice(k.length).trim();
            break;
          }
        }
        if (matchedTitleKey) {
          title = TITLE_MAP[matchedTitleKey].title;
          gender = TITLE_MAP[matchedTitleKey].gender;
          foundTitle = true;
          if (!token) continue;
        }
      }

      // 4. Check if token is numeric (student number / code / room number)
      if (/^[0-9]+$/.test(token)) {
        if (!foundNumeric && !code) {
          code = token.padStart(3, '0');
          foundNumeric = true;
          // If we already saw "ป.1" and this token is e.g. "1" or "2", make classLevel "ป.1/1"
          if (foundClass && !classLevel.includes('/') && token.length <= 2) {
            classLevel = `${classLevel}/${token}`;
          }
          continue;
        } else if (token.length === 3 || token.length === 4) {
          room = `ห้อง ${token}`;
          continue;
        }
      }

      // 5. Remaining tokens are names / nicknames
      if (token.includes(' ')) {
        nameTokens.push(...token.split(/\s+/).filter(Boolean));
      } else if (token) {
        nameTokens.push(token);
      }
    }

    if (nameTokens.length === 0) continue;
    firstName = nameTokens[0] || '';
    lastName = nameTokens[1] || '';
    if (nameTokens.length >= 3) {
      nickname = nameTokens[2];
    } else {
      nickname = 'น้อง' + firstName;
    }

    if (!code) {
      code = (existingCount + idxNumber).toString().padStart(3, '0');
    }

    const avatar = '';

    results.push({
      code,
      title,
      firstName,
      lastName,
      nickname,
      gender,
      classLevel,
      room,
      avatar,
      status: 'active',
      note: ''
    });
    idxNumber++;
  }

  return results;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  subjects = [],
  assignments,
  grades,
  onSaveStudent,
  onDeleteStudent,
  onBatchAddStudents,
  onBatchUpdateStudents,
  gasConfig,
  onOpenGasSync
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'classrooms' | 'subjects'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);

  // Batch import states
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [defaultClassLevel, setDefaultClassLevel] = useState('ป.1/1');
  const [defaultRoom, setDefaultRoom] = useState('ห้อง 101');
  const [parsedStudents, setParsedStudents] = useState<Partial<Student>[]>([]);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState('');

  // Batch Promote/Transfer states
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferSourceClass, setTransferSourceClass] = useState('');
  const [transferSourceRoom, setTransferSourceRoom] = useState('');
  const [transferTargetClass, setTransferTargetClass] = useState('ป.2/1');
  const [transferTargetRoom, setTransferTargetRoom] = useState('ห้อง 201');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [transferNote, setTransferNote] = useState('เลื่อนชั้นเรียน/ย้ายห้องประจำปีการศึกษา');
  const [transferSuccessMsg, setTransferSuccessMsg] = useState('');

  const allClassLevels = useMemo(() => {
    const set = new Set<string>();
    ['ป.1/1', 'ป.1/2', 'ป.2/1', 'ป.2/2', 'ป.3/1', 'ป.3/2', 'ป.4/1', 'ป.5/1', 'ป.6/1'].forEach(c => set.add(c));
    students.forEach(s => {
      if (s.classLevel) set.add(s.classLevel);
    });
    return Array.from(set).sort();
  }, [students]);

  const allRooms = useMemo(() => {
    const set = new Set<string>();
    ['ห้อง 101', 'ห้อง 102', 'ห้อง 201', 'ห้อง 202', 'ห้อง 301', 'ห้อง 302'].forEach(r => set.add(r));
    students.forEach(s => {
      if (s.room) set.add(s.room);
    });
    return Array.from(set).sort();
  }, [students]);

  const classroomGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        classLevel: string;
        room: string;
        students: Student[];
        maleCount: number;
        femaleCount: number;
        avgScore: number;
      }
    >();

    students.forEach(s => {
      const classLevel = s.classLevel || 'ไม่ระบุชั้นเรียน';
      const room = s.room || 'ไม่ระบุห้อง';
      const key = `${classLevel}||${room}`;
      if (!map.has(key)) {
        map.set(key, {
          classLevel,
          room,
          students: [],
          maleCount: 0,
          femaleCount: 0,
          avgScore: 0,
        });
      }
      const item = map.get(key)!;
      item.students.push(s);
      if (s.gender === 'male') item.maleCount++;
      else item.femaleCount++;
    });

    map.forEach(item => {
      let totalPts = 0;
      let count = 0;
      item.students.forEach(s => {
        const sGrades = grades.filter(g => g.studentId === s.id && g.score !== undefined);
        sGrades.forEach(g => {
          const asgn = assignments.find(a => a.id === g.assignmentId);
          if (asgn && asgn.maxScore > 0) {
            totalPts += (g.score! / asgn.maxScore) * 100;
            count++;
          }
        });
      });
      item.avgScore = count > 0 ? Math.round(totalPts / count) : 0;
    });

    return Array.from(map.values()).sort((a, b) =>
      a.classLevel.localeCompare(b.classLevel, 'th') || a.room.localeCompare(b.room, 'th')
    );
  }, [students, grades, assignments]);

  const subjectGroups = useMemo(() => {
    const defaultList: Subject[] = [
      {
        id: 'sub-th1',
        code: 'TH101',
        name: 'ภาษาไทยพื้นฐาน',
        category: 'core',
        gradeLevel: 'ป.1/1',
        credits: 1.5,
        color: '#ff6b6b'
      },
      {
        id: 'sub-math1',
        code: 'MATH101',
        name: 'คณิตศาสตร์พื้นฐาน',
        category: 'core',
        gradeLevel: 'ป.1/1',
        credits: 2.0,
        color: '#4ecdc4'
      },
      {
        id: 'sub-sci1',
        code: 'SCI101',
        name: 'วิทยาศาสตร์และเทคโนโลยี',
        category: 'core',
        gradeLevel: 'ป.1/1',
        credits: 1.5,
        color: '#45b7d1'
      },
      {
        id: 'sub-eng1',
        code: 'ENG101',
        name: 'ภาษาอังกฤษเพื่อการสื่อสาร',
        category: 'core',
        gradeLevel: 'ป.1/1',
        credits: 1.5,
        color: '#9b59b6'
      }
    ];

    const list = (subjects && subjects.length > 0) ? subjects : defaultList;

    return list.map(sub => {
      const matchingStudents = students.filter(
        s => !sub.gradeLevel || sub.gradeLevel === 'ทุกระดับชั้น' || s.classLevel.includes(sub.gradeLevel) || sub.gradeLevel.includes(s.classLevel)
      );
      const subAssignments = assignments.filter(a => a.subjectId === sub.id || a.title.includes(sub.name) || (a as any).subject?.includes(sub.name));

      let totalPts = 0;
      let count = 0;
      subAssignments.forEach(asgn => {
        grades.filter(g => g.assignmentId === asgn.id && g.score !== undefined).forEach(g => {
          if (asgn.maxScore > 0) {
            totalPts += (g.score! / asgn.maxScore) * 100;
            count++;
          }
        });
      });
      const avgScore = count > 0 ? Math.round(totalPts / count) : 0;

      return {
        ...sub,
        studentCount: matchingStudents.length,
        assignmentCount: subAssignments.length,
        avgScore,
        students: matchingStudents
      };
    });
  }, [subjects, students, assignments, grades]);

  const transferCandidateStudents = useMemo(() => {
    return students.filter(s => {
      const matchClass = !transferSourceClass || s.classLevel === transferSourceClass;
      const matchRoom = !transferSourceRoom || s.room === transferSourceRoom;
      return matchClass && matchRoom;
    });
  }, [students, transferSourceClass, transferSourceRoom]);

  const handleOpenTransferModal = (initialClass = '', initialRoom = '') => {
    setTransferSourceClass(initialClass);
    setTransferSourceRoom(initialRoom);
    setSelectedStudentIds([]);
    setTransferSuccessMsg('');
    setIsTransferModalOpen(true);
  };

  const handleSelectAllForTransfer = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(transferCandidateStudents.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmBatchTransfer = () => {
    if (selectedStudentIds.length === 0) return;
    const targets = students.filter(s => selectedStudentIds.includes(s.id));
    const updated = targets.map(s => ({
      ...s,
      classLevel: transferTargetClass || s.classLevel,
      room: transferTargetRoom || s.room,
      note: s.note ? `${s.note} (${transferNote})` : transferNote
    }));

    if (onBatchUpdateStudents) {
      onBatchUpdateStudents(
        updated,
        `✅ เลื่อนชั้น/ย้ายห้องนักเรียนจำนวน ${updated.length} คน ไปยัง ${transferTargetClass} (${transferTargetRoom}) เรียบร้อยแล้วค่ะ`
      );
    }
    setTransferSuccessMsg(`ย้าย/เลื่อนชั้นนักเรียน ${updated.length} คน เรียบร้อยแล้วค่ะ`);
    setTimeout(() => {
      setIsTransferModalOpen(false);
      setSelectedStudentIds([]);
      setTransferSuccessMsg('');
    }, 1500);
  };

  const handleTextChange = (text: string) => {
    setBatchText(text);
    const parsed = parseStudentLines(text, defaultClassLevel, defaultRoom, students.length);
    setParsedStudents(parsed);
  };

  const handleLoadSample = () => {
    const sample = `ป.1	1	เด็กชาย	จักรกรี	สุริยะ
ป.1	2	เด็กชาย	เจษฎา	แวงวรรณ
ป.1	3	เด็กชาย	สุทธิพงษ์	มาคา
ป.1	4	เด็กหญิง	นลินทิพย์	สดใส
ป.1	5	เด็กหญิง	ปวิตรา	รักษ์ดี`;
    setBatchText(sample);
    const parsed = parseStudentLines(sample, defaultClassLevel, defaultRoom, students.length);
    setParsedStudents(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const readWithEncoding = (encoding: string, fallback?: string) => {
      const reader = new FileReader();
      reader.onload = event => {
        const content = event.target?.result as string;
        if (content && content.includes('') && fallback) {
          readWithEncoding(fallback);
        } else if (content) {
          setBatchText(content);
          const parsed = parseStudentLines(content, defaultClassLevel, defaultRoom, students.length);
          setParsedStudents(parsed);
        }
      };
      reader.readAsText(file, encoding);
    };

    readWithEncoding('utf-8', 'windows-874');
  };

  const handleRemoveParsedRow = (index: number) => {
    setParsedStudents(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleConfirmBatch = () => {
    if (parsedStudents.length === 0) return;
    if (onBatchAddStudents) {
      onBatchAddStudents(parsedStudents);
    } else {
      parsedStudents.forEach(stu => onSaveStudent(stu));
    }
    setBatchSuccessMsg(`🎉 นำเข้านักเรียนสำเร็จทั้งหมด ${parsedStudents.length} คน! เรียบร้อยแล้วค่ะ`);
    setTimeout(() => {
      setIsBatchModalOpen(false);
      setBatchText('');
      setParsedStudents([]);
      setBatchSuccessMsg('');
    }, 1500);
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      s.code.toLowerCase().includes(term) ||
      s.firstName.toLowerCase().includes(term) ||
      s.lastName.toLowerCase().includes(term) ||
      s.nickname.toLowerCase().includes(term);
    const matchesClass = !classFilter || s.classLevel === classFilter;
    const matchesRoom = !roomFilter || s.room === roomFilter;
    const matchesSubject =
      !subjectFilter ||
      s.classLevel.includes(subjectFilter) ||
      subjectFilter === 'ทุกระดับชั้น';
    return matchesSearch && matchesClass && matchesRoom && matchesSubject;
  });

  const handleOpenNewModal = () => {
    const nextCode = (students.length + 1).toString().padStart(3, '0');
    setEditingStudent({
      code: nextCode,
      title: 'ด.ช.',
      firstName: '',
      lastName: '',
      nickname: '',
      gender: 'male',
      classLevel: 'ป.1/1',
      room: 'ห้อง 101',
      avatar: '',
      status: 'active',
      note: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (stu: Student) => {
    setEditingStudent({ ...stu });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent && editingStudent.firstName && editingStudent.lastName) {
      onSaveStudent(editingStudent);
      setIsModalOpen(false);
      setEditingStudent(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#306385]">
            รายชื่อนักเรียน
          </h1>
          <p className="text-[#41474d] mt-1 text-sm md:text-base">
            จัดการและดูรายชื่อนักเรียนทั้งหมดในชั้นเรียนของคุณ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => exportToCSV(students, assignments, grades)}
            className="flex items-center gap-2 bg-[#ffffff] text-[#306385] border-2 border-[#a7d8ff] hover:border-[#306385] text-sm font-bold px-4 py-2 rounded-full shadow-sm chibi-button"
            title="ดาวน์โหลดไฟล์ CSV สำหรับ Excel"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>ส่งออก CSV (Excel)</span>
          </button>
          <button
            onClick={() => {
              setBatchText('');
              setParsedStudents([]);
              setBatchSuccessMsg('');
              setIsBatchModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#ebf7f0] text-[#0a522f] border border-[#93d5a7] hover:bg-[#d8f0e3] text-sm font-extrabold px-5 py-2.5 rounded-full shadow-sm chibi-button"
            title="นำเข้าจาก Excel / Word หรือวางรายชื่อทีละมากๆ"
          >
            <span className="material-symbols-outlined text-base">post_add</span>
            <span>+ นำเข้าทีละมากๆ (Excel/CSV)</span>
          </button>
          <button
            onClick={handleOpenNewModal}
            className="flex items-center gap-2 bg-[#a7d8ff] text-[#001e2f] text-sm font-extrabold px-6 py-2.5 rounded-full shadow-sm chibi-button"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>+ เพิ่มนักเรียน</span>
          </button>
        </div>
      </div>

      {/* Multi-device & Google Sheets Auto-Sync Status Banner */}
      <div className="w-full">
        {gasConfig?.webAppUrl && gasConfig?.autoSync ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-[#ebf7f0] border border-[#93d5a7] text-[#00210f] text-xs font-medium shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-lg text-[#0a522f]">cloud_sync</span>
              <div>
                <span className="font-extrabold text-[#0a522f]">ซิงค์ข้อมูลกับ Google Sheets อัตโนมัติ (เปิดใช้งานหลายอุปกรณ์ได้)</span>
                <p className="text-[#335544] mt-0.5">ทุกครั้งที่เพิ่มนักเรียนหรือให้คะแนน ระบบจะอัปเดตลงตาราง Google Sheets เพื่อให้มือถือ แท็บเล็ต และคอมพิวเตอร์เห็นข้อมูลตรงกันค่ะ</p>
              </div>
            </div>
            {onOpenGasSync && (
              <button
                type="button"
                onClick={onOpenGasSync}
                className="shrink-0 font-bold text-[#0a522f] hover:underline flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#93d5a7]"
              >
                <span>ตั้งค่า Sheet</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-[#fff9e6] border border-[#fce39e] text-[#4d3a00] text-xs font-medium shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-lg text-[#996300]">devices</span>
              <div>
                <span className="font-extrabold text-[#996300]">ต้องการเปิดใช้งานพร้อมกันหลายอุปกรณ์ (มือถือ / แท็บเล็ต / โน้ตบุ๊ก)?</span>
                <p className="text-[#664d00] mt-0.5">คุณครูสามารถเชื่อมต่อกับ Google Sheets ฟรี เพื่อให้รายชื่อนักเรียนและคะแนนซิงค์ถึงกันทุกอุปกรณ์อัตโนมัติค่ะ</p>
              </div>
            </div>
            {onOpenGasSync && (
              <button
                type="button"
                onClick={onOpenGasSync}
                className="shrink-0 font-extrabold text-white bg-[#306385] hover:bg-[#234b65] px-4 py-2 rounded-xl transition-colors flex items-center gap-1 shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">link</span>
                <span>เชื่อมต่อ Google Sheets ฟรี</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sub-Tab Navigation for Complete Management (All / Classrooms / Subjects) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-[#dce2f3] shadow-xs">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all ${
              activeSubTab === 'all'
                ? 'bg-[#306385] text-white shadow-sm'
                : 'bg-[#f0f3ff] text-[#41474d] hover:bg-[#e4ebff]'
            }`}
          >
            <span className="material-symbols-outlined text-base">group</span>
            <span>รายชื่อทั้งหมด (รายคน)</span>
            <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-bold">
              {students.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('classrooms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all ${
              activeSubTab === 'classrooms'
                ? 'bg-[#306385] text-white shadow-sm'
                : 'bg-[#f0f3ff] text-[#41474d] hover:bg-[#e4ebff]'
            }`}
          >
            <span className="material-symbols-outlined text-base">meeting_room</span>
            <span>ระบบจัดการรายห้องเรียน ({classroomGroups.length} ห้อง)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('subjects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all ${
              activeSubTab === 'subjects'
                ? 'bg-[#306385] text-white shadow-sm'
                : 'bg-[#f0f3ff] text-[#41474d] hover:bg-[#e4ebff]'
            }`}
          >
            <span className="material-symbols-outlined text-base">menu_book</span>
            <span>ระบบจัดการรายวิชา ({subjectGroups.length} วิชา)</span>
          </button>
        </div>

        {activeSubTab === 'classrooms' && (
          <button
            type="button"
            onClick={() => handleOpenTransferModal('', '')}
            className="flex items-center gap-1.5 bg-[#ebf7f0] text-[#0a522f] border border-[#93d5a7] hover:bg-[#d8f0e3] px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-base">move_up</span>
            <span>+ เลื่อนชั้น / ย้ายห้องประจำปี</span>
          </button>
        )}
      </div>

      {/* Classroom Management View */}
      {activeSubTab === 'classrooms' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classroomGroups.map(group => (
              <div
                key={`${group.classLevel}-${group.room}`}
                className="bg-white rounded-3xl p-6 border-2 border-[#e2e8f8] hover:border-[#a7d8ff] transition-all chibi-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#306385] bg-[#c9e6ff] p-2.5 rounded-2xl">
                        school
                      </span>
                      <div>
                        <h3 className="font-display font-extrabold text-lg text-[#151c27]">
                          {group.classLevel}
                        </h3>
                        <p className="text-xs font-bold text-[#71787e]">{group.room}</p>
                      </div>
                    </div>
                    <span className="bg-[#f0f3ff] text-[#306385] px-3 py-1 rounded-full text-xs font-extrabold">
                      {group.students.length} คน
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#f0f3ff] text-center">
                    <div className="bg-[#f9f9ff] p-2 rounded-xl">
                      <div className="text-[10px] text-[#71787e] font-bold">👦 ชาย</div>
                      <div className="text-sm font-extrabold text-[#306385]">
                        {group.maleCount}
                      </div>
                    </div>
                    <div className="bg-[#f9f9ff] p-2 rounded-xl">
                      <div className="text-[10px] text-[#71787e] font-bold">👧 หญิง</div>
                      <div className="text-sm font-extrabold text-[#9b59b6]">
                        {group.femaleCount}
                      </div>
                    </div>
                    <div className="bg-[#f9f9ff] p-2 rounded-xl">
                      <div className="text-[10px] text-[#71787e] font-bold">📈 คะแนนเฉลี่ย</div>
                      <div className="text-sm font-extrabold text-[#0a522f]">
                        {group.avgScore}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 overflow-hidden">
                    {group.students.slice(0, 5).map(s => (
                      <StudentAvatar
                        key={s.id}
                        student={s}
                        size="sm"
                        className="border-2 border-white shadow-xs"
                      />
                    ))}
                    {group.students.length > 5 && (
                      <span className="text-xs font-extrabold text-[#71787e] bg-[#f0f3ff] px-2 py-1 rounded-full">
                        +{group.students.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#f0f3ff]">
                  <button
                    type="button"
                    onClick={() => {
                      setClassFilter(group.classLevel);
                      setRoomFilter(group.room);
                      setSubjectFilter('');
                      setActiveSubTab('all');
                    }}
                    className="flex-1 bg-[#f0f3ff] hover:bg-[#c9e6ff] text-[#306385] text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>ดูรายชื่อในห้อง</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenTransferModal(group.classLevel, group.room)}
                    className="bg-[#ebf7f0] hover:bg-[#d8f0e3] text-[#0a522f] text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
                    title="เลื่อนชั้นเรียนหรือย้ายห้องนักเรียนกลุ่มนี้"
                  >
                    <span className="material-symbols-outlined text-sm">move_up</span>
                    <span>เลื่อนชั้น/ย้ายห้อง</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject Management View */}
      {activeSubTab === 'subjects' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjectGroups.map(sub => (
              <div
                key={sub.id}
                className="bg-white rounded-3xl p-6 border-2 border-[#e2e8f8] hover:border-[#a7d8ff] transition-all chibi-shadow flex flex-col justify-between space-y-4"
                style={{ borderTopColor: sub.color || '#306385', borderTopWidth: '4px' }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#f0f3ff] text-[#306385]">
                        {sub.code}
                      </span>
                      <h3 className="font-display font-extrabold text-lg text-[#151c27] mt-1.5">
                        {sub.name}
                      </h3>
                      <p className="text-xs font-bold text-[#71787e] mt-0.5">
                        ระดับชั้น: {sub.gradeLevel || 'ทุกระดับชั้น'} | {sub.credits} หน่วยกิต
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#f0f3ff] text-center">
                    <div className="bg-[#f9f9ff] p-2 rounded-xl">
                      <div className="text-[10px] text-[#71787e] font-bold">👥 นักเรียน</div>
                      <div className="text-sm font-extrabold text-[#306385]">
                        {sub.studentCount} คน
                      </div>
                    </div>
                    <div className="bg-[#f9f9ff] p-2 rounded-xl">
                      <div className="text-[10px] text-[#71787e] font-bold">📝 ชิ้นงาน/ทดสอบ</div>
                      <div className="text-sm font-extrabold text-[#9b59b6]">
                        {sub.assignmentCount} รายการ
                      </div>
                    </div>
                    <div className="bg-[#f9f9ff] p-2 rounded-xl">
                      <div className="text-[10px] text-[#71787e] font-bold">📊 คะแนนเฉลี่ย</div>
                      <div className="text-sm font-extrabold text-[#0a522f]">
                        {sub.avgScore}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#f0f3ff]">
                  <button
                    type="button"
                    onClick={() => {
                      setSubjectFilter(sub.gradeLevel || 'ทุกระดับชั้น');
                      setClassFilter('');
                      setRoomFilter('');
                      setActiveSubTab('all');
                    }}
                    className="w-full bg-[#f0f3ff] hover:bg-[#c9e6ff] text-[#306385] text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">groups</span>
                    <span>ดูรายชื่อนักเรียนที่เรียนวิชานี้</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Students (Individual List Table) */}
      {activeSubTab === 'all' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Search & Filter Bar */}
          <div className="bg-[#ffffff] p-5 rounded-3xl chibi-shadow border-t-4 border-[#fdbec9] flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-72">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#71787e]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="ค้นหาด้วยชื่อ รหัส หรือชื่อเล่น..."
                className="w-full pl-11 pr-4 py-2.5 bg-[#f0f3ff] rounded-full border border-[#dce2f3] focus:border-[#306385] focus:outline-none focus:bg-white text-sm font-medium transition-all"
              />
            </div>

            <div className="flex flex-wrap w-full lg:w-auto gap-3">
              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                className="flex-1 sm:w-36 appearance-none bg-[#f0f3ff] border border-[#dce2f3] py-2.5 px-4 rounded-full text-sm font-medium text-[#151c27] cursor-pointer focus:outline-none focus:border-[#306385]"
              >
                <option value="">ทุกชั้นเรียน</option>
                {allClassLevels.map(cls => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>

              <select
                value={roomFilter}
                onChange={e => setRoomFilter(e.target.value)}
                className="flex-1 sm:w-36 appearance-none bg-[#f0f3ff] border border-[#dce2f3] py-2.5 px-4 rounded-full text-sm font-medium text-[#151c27] cursor-pointer focus:outline-none focus:border-[#306385]"
              >
                <option value="">ทุกห้อง</option>
                {allRooms.map(rm => (
                  <option key={rm} value={rm}>
                    {rm}
                  </option>
                ))}
              </select>

              <select
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                className="flex-1 sm:w-44 appearance-none bg-[#f0f3ff] border border-[#dce2f3] py-2.5 px-4 rounded-full text-sm font-medium text-[#151c27] cursor-pointer focus:outline-none focus:border-[#306385]"
              >
                <option value="">ทุกวิชา</option>
                {subjectGroups.map(sub => (
                  <option key={sub.id} value={sub.gradeLevel || 'ทุกระดับชั้น'}>
                    {sub.code}: {sub.name}
                  </option>
                ))}
              </select>

              {(searchTerm || classFilter || roomFilter || subjectFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setClassFilter('');
                    setRoomFilter('');
                    setSubjectFilter('');
                  }}
                  className="px-4 py-2 bg-[#f0f3ff] hover:bg-red-50 text-[#71787e] hover:text-red-500 rounded-full text-xs font-bold transition-colors"
                >
                  ล้างตัวกรอง
                </button>
              )}
            </div>
          </div>

      {/* Student List Table */}
      <div className="bg-[#ffffff] rounded-3xl chibi-shadow overflow-hidden border border-[#e2e8f8]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#f0f3ff] text-[#41474d] text-xs font-bold border-b border-[#e2e8f8]">
                <th className="py-4 px-6">นักเรียน</th>
                <th className="py-4 px-6 text-center">รหัสประจำตัว</th>
                <th className="py-4 px-6 text-center">ชั้นเรียน</th>
                <th className="py-4 px-6 text-center">ห้อง</th>
                <th className="py-4 px-6 text-center">สถานะ</th>
                <th className="py-4 px-6">หมายเหตุ</th>
                <th className="py-4 px-6 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3ff] text-sm">
              {filteredStudents.map((stu, index) => {
                const isEven = index % 2 === 0;
                return (
                  <tr
                    key={stu.id}
                    className={`transition-colors group hover:bg-[#f0f3ff] ${
                      isEven ? 'bg-[#ffffff]' : 'bg-[#f9f9ff]'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <StudentAvatar student={stu} size="md" />
                        <div>
                          <div className="font-bold text-[#151c27] group-hover:text-[#306385] transition-colors">
                            {stu.title}{stu.firstName} {stu.lastName}
                          </div>
                          <div className="text-xs text-[#41474d]">
                            ชื่อเล่น: <span className="font-bold text-[#306385]">{stu.nickname}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-[#41474d]">
                      {stu.code}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="bg-[#c9e6ff] text-[#001e2f] px-3 py-1 rounded-full text-xs font-bold">
                        {stu.classLevel}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-[#41474d] font-medium">
                      {stu.room}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          stu.status === 'active'
                            ? 'bg-[#ebf7f0] text-[#0a522f] border-[#93d5a7]'
                            : 'bg-[#ffdad6] text-[#93000a] border-[#ffdad6]'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            stu.status === 'active' ? 'bg-[#2a6a45]' : 'bg-[#ba1a1a]'
                          }`}
                        />
                        <span>{stu.status === 'active' ? 'ใช้งานปกติ' : 'ขาดเรียน'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#41474d] text-xs italic max-w-xs truncate">
                      {stu.note || '-'}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(stu)}
                        className="p-2 text-[#306385] hover:bg-[#c9e6ff]/40 rounded-full transition-colors"
                        title="แก้ไขข้อมูลนักเรียน"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการลบข้อมูลของ ${stu.firstName} หรือไม่?`)) {
                            onDeleteStudent(stu.id);
                          }
                        }}
                        className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-full transition-colors"
                        title="ลบรายชื่อนักเรียน"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#71787e] font-medium">
                    ไม่พบรายชื่อนักเรียนที่ตรงกับการค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151c27]/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#ffffff] rounded-3xl chibi-shadow-lg w-full max-w-md p-6 border-t-4 border-[#306385]">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-xl font-extrabold text-[#306385]">
                {editingStudent.id ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#f0f3ff] text-[#41474d]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-sm font-medium">
              <div className="flex items-center gap-4 p-3 bg-[#f0f3ff] rounded-2xl border border-[#dce2f3]">
                <StudentAvatar student={editingStudent} size="lg" />
                <div>
                  <div className="text-sm font-extrabold text-[#306385]">
                    ไอค่อนประจำตัวนักเรียน ({editingStudent.gender === 'female' || editingStudent.title === 'ด.ญ.' || editingStudent.title === 'นางสาว' ? 'นักเรียนหญิง' : 'นักเรียนชาย'})
                  </div>
                  <div className="text-xs text-[#71787e]">
                    ไอค่อนพรีเมี่ยมแบบเวกเตอร์ โหลดทันที ไม่ใช้เน็ต
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#41474d] mb-1">คำนำหน้า</label>
                  <select
                    value={editingStudent.title || 'ด.ช.'}
                    onChange={e => setEditingStudent({ ...editingStudent, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none"
                  >
                    <option value="ด.ช.">ด.ช.</option>
                    <option value="ด.ญ.">ด.ญ.</option>
                    <option value="นาย">นาย</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#41474d] mb-1">รหัสประจำตัว</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.code || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, code: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#41474d] mb-1">เพศ</label>
                  <select
                    value={editingStudent.gender || 'male'}
                    onChange={e =>
                      setEditingStudent({
                        ...editingStudent,
                        gender: e.target.value as 'male' | 'female'
                      })
                    }
                    className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none"
                  >
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#41474d] mb-1">ชื่อจริง</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.firstName || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#41474d] mb-1">นามสกุล</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.lastName || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#41474d] mb-1">ชื่อเล่น</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.nickname || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, nickname: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#41474d] mb-1">ชั้นเรียน</label>
                  <input
                    type="text"
                    value={editingStudent.classLevel || 'ป.1/1'}
                    onChange={e => setEditingStudent({ ...editingStudent, classLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#41474d] mb-1">ห้อง</label>
                  <input
                    type="text"
                    value={editingStudent.room || 'ห้อง 101'}
                    onChange={e => setEditingStudent({ ...editingStudent, room: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#41474d] mb-1">สถานะเรียน</label>
                <select
                  value={editingStudent.status || 'active'}
                  onChange={e =>
                    setEditingStudent({
                      ...editingStudent,
                      status: e.target.value as 'active' | 'absent'
                    })
                  }
                  className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none"
                >
                  <option value="active">ใช้งานปกติ (Active)</option>
                  <option value="absent">ขาดเรียน / สังเกตพิเศษ (Absent)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#41474d] mb-1">หมายเหตุ / ความสามารถพิเศษ</label>
                <input
                  type="text"
                  value={editingStudent.note || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, note: e.target.value })}
                  placeholder="เช่น เก่งคิดเลขเร็ว, หัวหน้าห้อง"
                  className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#f0f3ff]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-[#f0f3ff] text-[#41474d] font-bold text-xs chibi-button"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#306385] text-white font-bold text-xs shadow-sm chibi-button"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH IMPORT MODAL */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto chibi-shadow space-y-6">
            <div className="flex items-center justify-between border-b border-[#f0f3ff] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-2xl text-[#0a522f]">
                  post_add
                </span>
                <h3 className="font-display text-xl font-bold text-[#306385]">
                  นำเข้านักเรียนทีละมากๆ (Excel / CSV / วางรายชื่อ)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="text-[#71787e] hover:text-[#151c27] transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Instruction Banner */}
            <div className="p-4 rounded-2xl bg-[#ebf7f0] border border-[#93d5a7] text-xs text-[#00210f] space-y-2">
              <div className="font-extrabold flex items-center gap-1.5 text-sm text-[#0a522f]">
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                <span>ระบบ AI วิเคราะห์ตาราง Excel / CSV ให้อัตโนมัติ (ไม่ต้องเรียงคอลัมน์ตายตัว)!</span>
              </div>
              <p className="leading-relaxed">
                ไม่ว่าจะก๊อปปี้จาก Excel แบบในภาพ (เช่น <span className="font-bold text-[#0a522f]">ป.1 | 1 | เด็กชาย | จักรกรี | สุริยะ</span>) หรืออัปโหลดไฟล์ <span className="font-bold text-[#0a522f]">.csv / .xlsx</span> <br />
                ระบบสามารถแยกแยะ <span className="font-bold underline">คำนำหน้า</span> (เด็กชาย, เด็กหญิง, ด.ช., ด.ญ.), <span className="font-bold underline">ชื่อจริง</span>, <span className="font-bold underline">นามสกุล</span>, และ <span className="font-bold underline">ชั้นเรียน</span> ให้อัตโนมัติค่ะ!
              </p>
            </div>

            {/* Control Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-[#f9f9ff] p-4 rounded-2xl border border-[#e2e8f8]">
              <div>
                <label className="block text-xs font-bold text-[#306385] mb-1">
                  ชั้นเรียนเริ่มต้น
                </label>
                <input
                  type="text"
                  value={defaultClassLevel}
                  onChange={e => {
                    setDefaultClassLevel(e.target.value);
                    handleTextChange(batchText);
                  }}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#dce2f3] text-xs font-bold focus:outline-none focus:border-[#306385]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#306385] mb-1">
                  ห้องเรียนเริ่มต้น
                </label>
                <input
                  type="text"
                  value={defaultRoom}
                  onChange={e => {
                    setDefaultRoom(e.target.value);
                    handleTextChange(batchText);
                  }}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#dce2f3] text-xs font-bold focus:outline-none focus:border-[#306385]"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="w-full py-2 bg-[#fff9e6] hover:bg-[#ffeec2] text-[#996300] border border-[#fce39e] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 chibi-button transition-all"
                  title="คลิกเพื่อโหลดตัวอย่างตามภาพ Excel"
                >
                  <span className="material-symbols-outlined text-sm">magic_button</span>
                  <span>ตัวอย่างแบบในภาพ Excel</span>
                </button>
              </div>

              <div>
                <label className="w-full py-2 bg-[#e2e8f8] hover:bg-[#d1dcfa] text-[#306385] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer chibi-button transition-all">
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span>อัปโหลดไฟล์ .CSV</span>
                  <input
                    type="file"
                    accept=".csv,.txt,.tsv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Textarea for typing / pasting */}
            <div>
              <label className="block text-xs font-bold text-[#151c27] mb-1">
                วางรายชื่อหรือตารางตรงนี้ (Copy & Paste จาก Excel / Google Sheets):
              </label>
              <textarea
                value={batchText}
                onChange={e => handleTextChange(e.target.value)}
                rows={5}
                placeholder="ตัวอย่างแบบในภาพ Excel:&#10;ป.1	1	เด็กชาย	จักรกรี	สุริยะ&#10;ป.1	2	เด็กชาย	เจษฎา	แวงวรรณ&#10;ป.1	3	เด็กหญิง	นลินทิพย์	สดใส"
                className="w-full p-3 bg-[#f0f3ff] rounded-2xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none text-xs font-mono"
              />
            </div>

            {/* Preview Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#306385] flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">table_chart</span>
                  <span>ตัวอย่างรายชื่อที่วิเคราะห์ได้ ({parsedStudents.length} คน)</span>
                </span>
                {parsedStudents.length > 0 && (
                  <span className="bg-[#ebf7f0] text-[#0a522f] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#93d5a7]">
                    พร้อมนำเข้า ✅
                  </span>
                )}
              </div>

              {parsedStudents.length === 0 ? (
                <div className="text-center py-8 bg-[#f9f9ff] rounded-2xl border border-dashed border-[#c1c7ce] text-xs text-[#71787e]">
                  ยังไม่มีรายชื่อ วางตารางจาก Excel หรือกดปุ่ม "ลองใส่ตัวอย่าง 5 คน" ด้านบนได้เลยค่ะ
                </div>
              ) : (
                <div className="border border-[#e2e8f8] rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#f0f3ff] text-[#41474d] font-bold sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">ลำดับ</th>
                        <th className="py-2.5 px-3">รหัส</th>
                        <th className="py-2.5 px-3">ชื่อ-นามสกุล</th>
                        <th className="py-2.5 px-3">ชื่อเล่น</th>
                        <th className="py-2.5 px-3">เพศ</th>
                        <th className="py-2.5 px-3">ชั้น/ห้อง</th>
                        <th className="py-2.5 px-3 text-right">ลบ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f3ff]">
                      {parsedStudents.map((stu, i) => (
                        <tr key={i} className="hover:bg-[#f9f9ff]">
                          <td className="py-2 px-3 text-[#71787e] font-semibold">{i + 1}</td>
                          <td className="py-2 px-3 font-bold text-[#306385]">{stu.code}</td>
                          <td className="py-2 px-3 font-bold text-[#151c27]">
                            {stu.title}{stu.firstName} {stu.lastName}
                          </td>
                          <td className="py-2 px-3">{stu.nickname}</td>
                          <td className="py-2 px-3">
                            {stu.gender === 'female' ? '👧 หญิง' : '👦 ชาย'}
                          </td>
                          <td className="py-2 px-3 text-[#41474d]">
                            {stu.classLevel} ({stu.room})
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveParsedRow(i)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                              title="ลบรายการนี้"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Success message banner */}
            {batchSuccessMsg && (
              <div className="p-3 rounded-xl bg-[#ebf7f0] border border-[#93d5a7] text-[#0a522f] text-xs font-bold text-center animate-bounce">
                {batchSuccessMsg}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#f0f3ff]">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="px-5 py-2 rounded-full bg-[#f0f3ff] text-[#41474d] font-bold text-xs chibi-button"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={parsedStudents.length === 0}
                onClick={handleConfirmBatch}
                className={`px-6 py-2.5 rounded-full font-bold text-xs shadow-sm chibi-button flex items-center gap-1.5 ${
                  parsedStudents.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#0a522f] hover:bg-[#156e45] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>
                  ยืนยันนำเข้านักเรียนทั้งหมด ({parsedStudents.length} คน)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Transfer/Promotion Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151c27]/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#ffffff] rounded-3xl chibi-shadow-lg w-full max-w-3xl p-6 border-t-4 border-[#306385] max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-display text-xl font-extrabold text-[#306385] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#306385]">move_up</span>
                  <span>ระบบเลื่อนชั้นเรียน / ย้ายห้องประจำปีการศึกษา</span>
                </h3>
                <p className="text-xs font-bold text-[#71787e]">
                  เลือกนักเรียนที่ต้องการเลื่อนระดับชั้น หรือย้ายไปห้องเรียนใหม่พร้อมกันทั้งกลุ่ม
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#f0f3ff] text-[#41474d]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Target Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#f0f3ff] border border-[#dce2f3] mb-4">
              <div>
                <label className="block text-xs font-bold text-[#41474d] mb-1">
                  เลื่อนไปยังชั้นเรียนใหม่
                </label>
                <select
                  value={transferTargetClass}
                  onChange={e => setTransferTargetClass(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#dce2f3] font-extrabold text-sm text-[#151c27] focus:outline-none focus:border-[#306385]"
                >
                  <option value="ป.1/1">ป.1/1</option>
                  <option value="ป.1/2">ป.1/2</option>
                  <option value="ป.2/1">ป.2/1</option>
                  <option value="ป.2/2">ป.2/2</option>
                  <option value="ป.3/1">ป.3/1</option>
                  <option value="ป.3/2">ป.3/2</option>
                  <option value="ป.4/1">ป.4/1</option>
                  <option value="ป.5/1">ป.5/1</option>
                  <option value="ป.6/1">ป.6/1</option>
                  <option value="ม.1/1">ม.1/1</option>
                  <option value="จบการศึกษา">จบการศึกษา</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#41474d] mb-1">
                  ย้ายไปยังห้องเรียนใหม่
                </label>
                <select
                  value={transferTargetRoom}
                  onChange={e => setTransferTargetRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#dce2f3] font-extrabold text-sm text-[#151c27] focus:outline-none focus:border-[#306385]"
                >
                  <option value="ห้อง 101">ห้อง 101</option>
                  <option value="ห้อง 102">ห้อง 102</option>
                  <option value="ห้อง 201">ห้อง 201</option>
                  <option value="ห้อง 202">ห้อง 202</option>
                  <option value="ห้อง 301">ห้อง 301</option>
                  <option value="ห้อง 302">ห้อง 302</option>
                </select>
              </div>
            </div>

            {/* Select Candidates */}
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    transferCandidateStudents.length > 0 &&
                    selectedStudentIds.length === transferCandidateStudents.length
                  }
                  onChange={e => handleSelectAllForTransfer(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-[#306385]"
                />
                <span className="text-xs font-extrabold text-[#151c27]">
                  เลือกนักเรียนทั้งหมดในรายการ ({selectedStudentIds.length} /{' '}
                  {transferCandidateStudents.length} คน)
                </span>
              </label>

              <div className="flex gap-2 text-xs">
                <select
                  value={transferSourceClass}
                  onChange={e => setTransferSourceClass(e.target.value)}
                  className="px-2 py-1 bg-[#f0f3ff] rounded-lg border border-[#dce2f3] font-bold"
                >
                  <option value="">ทุกชั้นต้นทาง</option>
                  {allClassLevels.map(cls => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                <select
                  value={transferSourceRoom}
                  onChange={e => setTransferSourceRoom(e.target.value)}
                  className="px-2 py-1 bg-[#f0f3ff] rounded-lg border border-[#dce2f3] font-bold"
                >
                  <option value="">ทุกห้องต้นทาง</option>
                  {allRooms.map(rm => (
                    <option key={rm} value={rm}>
                      {rm}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Candidate list table */}
            <div className="flex-1 overflow-y-auto border border-[#dce2f3] rounded-2xl p-2 mb-4 bg-[#f9f9ff]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {transferCandidateStudents.map(s => {
                  const isSelected = selectedStudentIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleToggleSelectStudent(s.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#c9e6ff]/40 border-[#306385] shadow-xs'
                          : 'bg-white border-[#e2e8f8] hover:border-[#a7d8ff]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded accent-[#306385]"
                        />
                        <StudentAvatar student={s} size="sm" />
                        <div>
                          <div className="text-xs font-extrabold text-[#151c27]">
                            {s.title}{s.firstName} {s.lastName} ({s.nickname})
                          </div>
                          <div className="text-[10px] text-[#71787e]">
                            รหัส: {s.code} | {s.classLevel} ({s.room})
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {transferCandidateStudents.length === 0 && (
                <div className="py-8 text-center text-xs font-bold text-[#71787e]">
                  ไม่มีนักเรียนในระดับชั้นหรือห้องเรียนต้นทางที่เลือก
                </div>
              )}
            </div>

            {transferSuccessMsg && (
              <div className="p-3 mb-3 rounded-xl bg-[#ebf7f0] border border-[#93d5a7] text-[#0a522f] text-xs font-bold text-center animate-bounce">
                {transferSuccessMsg}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-[#f0f3ff]">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-5 py-2 rounded-full bg-[#f0f3ff] text-[#41474d] font-bold text-xs chibi-button"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={selectedStudentIds.length === 0}
                onClick={handleConfirmBatchTransfer}
                className={`px-6 py-2.5 rounded-full font-bold text-xs shadow-sm chibi-button flex items-center gap-1.5 ${
                  selectedStudentIds.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#306385] hover:bg-[#234b65] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>
                  ยืนยันย้าย / เลื่อนชั้นเรียน ({selectedStudentIds.length} คน)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
