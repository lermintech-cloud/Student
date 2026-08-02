import React, { useState } from 'react';
import { Student, Assignment, GradeEntry } from '../types.js';
import { exportToCSV } from '../services/api.js';

interface StudentsTabProps {
  students: Student[];
  assignments: Assignment[];
  grades: GradeEntry[];
  onSaveStudent: (student: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onBatchAddStudents?: (students: Partial<Student>[]) => void;
}

function parseStudentLines(
  text: string,
  defaultClassLevel: string,
  defaultRoom: string,
  existingCount: number
): Partial<Student>[] {
  const lines = text.split('\n');
  const results: Partial<Student>[] = [];
  const titles = ['ด.ช.', 'ด.ญ.', 'ด.ช', 'ด.ญ', 'นาย', 'นางสาว', 'น.ส.', 'น.ส'];

  let idxNumber = 1;
  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (
      !trimmed ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('รหัส') ||
      trimmed.startsWith('Code') ||
      trimmed.startsWith('ลำดับ')
    ) {
      continue;
    }

    let parts: string[];
    if (trimmed.includes('\t')) {
      parts = trimmed.split('\t').map(p => p.trim()).filter(Boolean);
    } else if (trimmed.includes(',')) {
      parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
    } else {
      parts = trimmed.split(/\s+/).map(p => p.trim()).filter(Boolean);
    }

    if (parts.length < 2) continue;

    let code = '';
    let title = 'ด.ช.';
    let firstName = '';
    let lastName = '';
    let nickname = '';
    let classLevel = defaultClassLevel;
    let room = defaultRoom;

    let startIndex = 0;
    if (
      (/^[0-9]+$/.test(parts[0]) ||
        (/^[A-Za-z0-9-_]+$/.test(parts[0]) && parts[0].length <= 6)) &&
      !titles.includes(parts[0])
    ) {
      code = parts[0];
      startIndex = 1;
    } else {
      code = (existingCount + idxNumber).toString().padStart(3, '0');
    }

    if (startIndex >= parts.length) continue;

    if (titles.includes(parts[startIndex])) {
      title = parts[startIndex];
      if (title === 'ด.ช') title = 'ด.ช.';
      if (title === 'ด.ญ') title = 'ด.ญ.';
      if (title === 'น.ส') title = 'น.ส.';
      startIndex++;
    } else {
      for (const t of titles) {
        if (parts[startIndex].startsWith(t)) {
          title = t;
          parts[startIndex] = parts[startIndex].slice(t.length).trim();
          break;
        }
      }
    }

    firstName = parts[startIndex] || '';
    lastName = parts[startIndex + 1] || '';
    nickname = parts[startIndex + 2] || '';

    for (let i = startIndex + 3; i < parts.length; i++) {
      const token = parts[i];
      if (token.startsWith('ป.') || token.startsWith('ม.') || token.includes('/')) {
        classLevel = token;
      } else if (token.startsWith('ห้อง') || token.startsWith('Room') || /^[0-9]{3}$/.test(token)) {
        room = token.startsWith('ห้อง') ? token : `ห้อง ${token}`;
      } else if (!nickname) {
        nickname = token;
      }
    }

    if (!firstName) continue;

    const gender = title === 'ด.ญ.' || title === 'นางสาว' || title === 'น.ส.' ? 'female' : 'male';
    const avatar =
      gender === 'female'
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAL5t_MWvFniyYyAgPM7lL7RtqInuWSeTJZVqgChQ5YaPMsKWxH2Az8gcdATP51fZgMNvD4Tzx-ynYWFP0D2u4HSCqiUn_dAgRmSFusmq56qf39j7fYZHvuYVzWZG0f-LmMx4UYLky8Wm6NGFfLRej_sOHb-oaN0_gCMJbJjQOUTU6P6YbUuM7H6cGeHF7CEONozlIeC-kTjGEW1dLI2G6jVMVSOzpV69HLyP4DOO-sXxrgByy-ZpvH'
        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1zrbR5LJ132IT7GHNZ6XJHu81UNgH7_kYAfB8291kvt62_NfAJMZX9jL4aSEHBLZE3OYbqLu5PHHnf6cRJAEt7VvOTyMZqTQA_t0OIHWhxqfph3kgrpx2s9bpfa4Z6Ja1DZ5MgL0D6YpBzqLXyt621PJJrWg9pybZQvwd8Ft6ofEg3lHK8hQYsb8jNSOk9SuIqQlyHy5GueIu1Wkpt2GEzXQjuJ5V7X-gtUBBFG0ShbcUz55CxW5B';

    results.push({
      code,
      title,
      firstName,
      lastName,
      nickname: nickname || 'น้อง' + firstName,
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
  assignments,
  grades,
  onSaveStudent,
  onDeleteStudent,
  onBatchAddStudents
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);

  // Batch import states
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [defaultClassLevel, setDefaultClassLevel] = useState('ป.1/1');
  const [defaultRoom, setDefaultRoom] = useState('ห้อง 101');
  const [parsedStudents, setParsedStudents] = useState<Partial<Student>[]>([]);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState('');

  const handleTextChange = (text: string) => {
    setBatchText(text);
    const parsed = parseStudentLines(text, defaultClassLevel, defaultRoom, students.length);
    setParsedStudents(parsed);
  };

  const handleLoadSample = () => {
    const sample = `101\tด.ช.\tก้องเกียรติ\tยอดเยี่ยม\tก้อง\tป.1/1\tห้อง 101
102\tด.ญ.\tนลินทิพย์\tสดใส\tน้ำหนึ่ง\tป.1/1\tห้อง 101
103\tด.ช.\tธนกร\tตั้งใจเรียน\tกร\tป.1/1\tห้อง 101
104\tด.ญ.\tปวิตรา\tรักษ์ดี\tปาล์ม\tป.1/1\tห้อง 101
105\tด.ช.\tสิรวิชญ์\tฉลาดคิด\tวิน\tป.1/1\tห้อง 101`;
    setBatchText(sample);
    const parsed = parseStudentLines(sample, defaultClassLevel, defaultRoom, students.length);
    setParsedStudents(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        setBatchText(content);
        const parsed = parseStudentLines(content, defaultClassLevel, defaultRoom, students.length);
        setParsedStudents(parsed);
      }
    };
    reader.readAsText(file, 'utf-8');
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
    return matchesSearch && matchesClass && matchesRoom;
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
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1zrbR5LJ132IT7GHNZ6XJHu81UNgH7_kYAfB8291kvt62_NfAJMZX9jL4aSEHBLZE3OYbqLu5PHHnf6cRJAEt7VvOTyMZqTQA_t0OIHWhxqfph3kgrpx2s9bpfa4Z6Ja1DZ5MgL0D6YpBzqLXyt621PJJrWg9pybZQvwd8Ft6ofEg3lHK8hQYsb8jNSOk9SuIqQlyHy5GueIu1Wkpt2GEzXQjuJ5V7X-gtUBBFG0ShbcUz55CxW5B',
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

      {/* Search & Filter Bar */}
      <div className="bg-[#ffffff] p-5 rounded-3xl chibi-shadow border-t-4 border-[#fdbec9] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
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

        <div className="flex w-full md:w-auto gap-3">
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="flex-1 md:w-40 appearance-none bg-[#f0f3ff] border border-[#dce2f3] py-2.5 px-4 rounded-full text-sm font-medium text-[#151c27] cursor-pointer focus:outline-none focus:border-[#306385]"
          >
            <option value="">ทุกชั้นเรียน</option>
            <option value="ป.1/1">ป.1/1</option>
            <option value="ป.1/2">ป.1/2</option>
            <option value="ป.2/1">ป.2/1</option>
          </select>

          <select
            value={roomFilter}
            onChange={e => setRoomFilter(e.target.value)}
            className="flex-1 md:w-36 appearance-none bg-[#f0f3ff] border border-[#dce2f3] py-2.5 px-4 rounded-full text-sm font-medium text-[#151c27] cursor-pointer focus:outline-none focus:border-[#306385]"
          >
            <option value="">ทุกห้อง</option>
            <option value="ห้อง 101">ห้อง 101</option>
            <option value="ห้อง 102">ห้อง 102</option>
            <option value="ห้อง 201">ห้อง 201</option>
          </select>
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
                        <img
                          src={stu.avatar}
                          alt={stu.nickname}
                          className="w-10 h-10 rounded-full border-2 border-[#c9e6ff] object-cover"
                        />
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
                <span className="material-symbols-outlined text-base">lightbulb</span>
                <span>วิธีใช้งานง่ายที่สุด: ก๊อปปี้ตารางจาก Excel หรือ Google Sheets มาวางได้เลย!</span>
              </div>
              <p className="leading-relaxed">
                รองรับการคั่นด้วยแถบ (Tab), เครื่องหมายจุลภาค (,), หรือช่องว่าง แนะนำเรียงคอลัมน์: <br />
                <span className="font-bold text-[#0a522f]">
                  รหัส | คำนำหน้า | ชื่อ | นามสกุล | ชื่อเล่น | ชั้นเรียน | ห้อง
                </span> <br />
                (หากไม่มีรหัส หรือชั้นเรียน ระบบจะรันลำดับต่อจากเดิม และใช้ค่าเริ่มต้นด้านล่างให้อัตโนมัติค่ะ)
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
                >
                  <span className="material-symbols-outlined text-sm">magic_button</span>
                  <span>ลองใส่ตัวอย่าง 5 คน</span>
                </button>
              </div>

              <div>
                <label className="w-full py-2 bg-[#e2e8f8] hover:bg-[#d1dcfa] text-[#306385] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer chibi-button transition-all">
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span>อัปโหลดไฟล์ CSV</span>
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
                วางรายชื่อหรือตารางตรงนี้ (Copy & Paste):
              </label>
              <textarea
                value={batchText}
                onChange={e => handleTextChange(e.target.value)}
                rows={5}
                placeholder="ตัวอย่าง:&#10;101  ด.ช.  สมชาย  ใจดี  ต้น  ป.1/1&#10;102  ด.ญ.  สมหญิง  น่ารัก  มิ้นท์  ป.1/1"
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
    </div>
  );
};
