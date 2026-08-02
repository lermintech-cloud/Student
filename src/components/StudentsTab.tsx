import React, { useState } from 'react';
import { Student, Assignment, GradeEntry } from '../types.js';
import { exportToCSV } from '../services/api.js';

interface StudentsTabProps {
  students: Student[];
  assignments: Assignment[];
  grades: GradeEntry[];
  onSaveStudent: (student: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  assignments,
  grades,
  onSaveStudent,
  onDeleteStudent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);

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
    </div>
  );
};
