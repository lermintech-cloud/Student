import React, { useState } from 'react';
import {
  Student,
  Subject,
  Assignment,
  GradeEntry
} from '../types.js';

interface GradingTabProps {
  students: Student[];
  subjects: Subject[];
  assignments: Assignment[];
  grades: GradeEntry[];
  selectedAssignmentId: string;
  setSelectedAssignmentId: (id: string) => void;
  onSaveGrades: (grades: GradeEntry[]) => void;
  onSaveAssignment: (assign: Partial<Assignment>) => void;
  onDeleteAssignment: (id: string) => void;
  onOpenNewAssignment: () => void;
}

export const GradingTab: React.FC<GradingTabProps> = ({
  students,
  subjects,
  assignments,
  grades,
  selectedAssignmentId,
  setSelectedAssignmentId,
  onSaveGrades,
  onSaveAssignment,
  onDeleteAssignment,
  onOpenNewAssignment
}) => {
  const activeStudents = students.filter(s => s.status === 'active');
  const currentAssign =
    assignments.find(a => a.id === selectedAssignmentId) || assignments[0] || null;
  const currentSubject = currentAssign
    ? subjects.find(s => s.id === currentAssign.subjectId) || subjects[0]
    : null;

  const [editingAssignModal, setEditingAssignModal] = useState<Partial<Assignment> | null>(null);
  const [saveStatusText, setSaveStatusText] = useState('บันทึกอัตโนมัติเมื่อสักครู่');
  const [localGrades, setLocalGrades] = useState<GradeEntry[]>(grades);

  // Sync state when parent grades change
  React.useEffect(() => {
    setLocalGrades(grades);
  }, [grades]);

  const handleScoreChange = (studentId: string, value: string) => {
    if (!currentAssign) return;
    const numericScore = value === '' ? null : Math.min(Math.max(Number(value), 0), currentAssign.maxScore);

    const existingIndex = localGrades.findIndex(
      g => g.studentId === studentId && g.assignmentId === currentAssign.id
    );

    let updatedList: GradeEntry[];
    if (existingIndex !== -1) {
      updatedList = [...localGrades];
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        score: numericScore,
        isCompleted: numericScore !== null,
        updatedAt: new Date().toISOString()
      };
    } else {
      const newEntry: GradeEntry = {
        id: 'g-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        studentId,
        assignmentId: currentAssign.id,
        score: numericScore,
        isCompleted: numericScore !== null,
        updatedAt: new Date().toISOString()
      };
      updatedList = [...localGrades, newEntry];
    }

    setLocalGrades(updatedList);
    setSaveStatusText('กำลังบันทึก...');
    onSaveGrades(updatedList);
    setTimeout(() => {
      setSaveStatusText('บันทึกอัตโนมัติเรียบร้อยแล้ว');
    }, 500);
  };

  const handleNoteChange = (studentId: string, noteText: string) => {
    if (!currentAssign) return;
    const existingIndex = localGrades.findIndex(
      g => g.studentId === studentId && g.assignmentId === currentAssign.id
    );

    let updatedList: GradeEntry[];
    if (existingIndex !== -1) {
      updatedList = [...localGrades];
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        note: noteText,
        updatedAt: new Date().toISOString()
      };
    } else {
      const newEntry: GradeEntry = {
        id: 'g-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        studentId,
        assignmentId: currentAssign.id,
        score: null,
        isCompleted: false,
        note: noteText,
        updatedAt: new Date().toISOString()
      };
      updatedList = [...localGrades, newEntry];
    }
    setLocalGrades(updatedList);
    onSaveGrades(updatedList);
  };

  const handleGiveAllFullScore = () => {
    if (!currentAssign) return;
    const updatedList = [...localGrades];
    activeStudents.forEach(stu => {
      const idx = updatedList.findIndex(
        g => g.studentId === stu.id && g.assignmentId === currentAssign.id
      );
      if (idx !== -1) {
        updatedList[idx] = {
          ...updatedList[idx],
          score: currentAssign.maxScore,
          isCompleted: true,
          updatedAt: new Date().toISOString()
        };
      } else {
        updatedList.push({
          id: 'g-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          studentId: stu.id,
          assignmentId: currentAssign.id,
          score: currentAssign.maxScore,
          isCompleted: true,
          updatedAt: new Date().toISOString()
        });
      }
    });
    setLocalGrades(updatedList);
    onSaveGrades(updatedList);
    setSaveStatusText('ให้คะแนนเต็มทุกคนเรียบร้อยแล้ว');
  };

  const handleSaveAssignModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAssignModal && editingAssignModal.title && editingAssignModal.maxScore) {
      onSaveAssignment(editingAssignModal);
      setEditingAssignModal(null);
    }
  };

  if (!currentAssign) {
    return (
      <div className="p-12 text-center bg-[#ffffff] rounded-3xl chibi-shadow">
        <h3 className="font-display text-xl font-bold text-[#306385]">
          ยังไม่มีงานที่มอบหมาย
        </h3>
        <button
          onClick={onOpenNewAssignment}
          className="mt-4 px-6 py-2.5 rounded-full bg-[#306385] text-white font-bold text-sm chibi-button"
        >
          + สร้างงานที่มอบหมายแรก
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Quick Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2">
            <select
              value={currentAssign.id}
              onChange={e => setSelectedAssignmentId(e.target.value)}
              className="font-display text-2xl md:text-3xl font-extrabold text-[#306385] bg-transparent border-b-2 border-dashed border-[#a7d8ff] pb-1 pr-6 focus:outline-none cursor-pointer"
            >
              {assignments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.maxScore} คะแนน)
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 bg-[#e2e8f8] text-[#41474d] px-3 py-1 rounded-full text-xs font-bold">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>{saveStatusText}</span>
            </span>
            {currentSubject && (
              <span className="bg-[#a7d8ff] text-[#001e2f] px-3 py-1 rounded-full text-xs font-bold">
                {currentSubject.name} ({currentAssign.classLevel})
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleGiveAllFullScore}
            className="bg-[#aef2c2] text-[#00210f] text-xs md:text-sm font-bold py-2 px-4 rounded-full chibi-button flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">auto_fix_high</span>
            <span>ให้คะแนนเต็มทุกคน ({currentAssign.maxScore})</span>
          </button>
          <button
            onClick={() => setEditingAssignModal({ ...currentAssign })}
            className="bg-[#ffffff] text-[#306385] border-2 border-[#306385] text-xs md:text-sm font-bold py-2 px-4 rounded-full chibi-button flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            <span>แก้ไขงานนี้</span>
          </button>
          <button
            onClick={onOpenNewAssignment}
            className="bg-[#306385] text-white text-xs md:text-sm font-bold py-2 px-5 rounded-full chibi-button flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>มอบหมายงานใหม่</span>
          </button>
        </div>
      </div>

      {/* Assignment Info Details Accordion Card */}
      <div className="bg-[#ffffff] rounded-3xl chibi-shadow border-t-4 border-[#a7d8ff] overflow-hidden">
        <div className="p-5 bg-[#f0f3ff]/50 border-b border-[#e2e8f8] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#306385] text-2xl">
              assignment
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-[#306385]">
                {currentAssign.title}
              </h3>
              <p className="text-xs text-[#41474d]">{currentAssign.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-[#41474d]">
            <div>
              <span className="text-[#71787e]">คะแนนเต็ม: </span>
              <span className="text-[#306385] text-sm">{currentAssign.maxScore} คะแนน</span>
            </div>
            <div>
              <span className="text-[#71787e]">วันที่มอบหมาย: </span>
              <span>{currentAssign.dueDate}</span>
            </div>
          </div>
        </div>

        {/* Students Grading Table */}
        <div className="p-4 bg-[#f0f3ff] border-b border-[#e2e8f8] flex justify-between items-center">
          <h4 className="font-display text-base font-bold text-[#151c27]">
            รายชื่อนักเรียนในชั้นเรียน ({activeStudents.length} คน)
          </h4>
          <span className="text-xs text-[#41474d] font-semibold">
            พิมพ์คะแนนหรือกดเครื่องหมายถูกเพื่อผ่าน
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#a7d8ff] text-[#001e2f] text-xs font-extrabold">
                <th className="p-4">นักเรียน</th>
                <th className="p-4 w-32 text-center">ผ่าน ({currentAssign.maxScore})</th>
                <th className="p-4 w-32 text-center">คะแนน (/{currentAssign.maxScore})</th>
                <th className="p-4">หมายเหตุ / ความเห็นครู</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3ff] text-sm font-medium">
              {activeStudents.map((stu, index) => {
                const gradeEntry = localGrades.find(
                  g => g.studentId === stu.id && g.assignmentId === currentAssign.id
                );
                const scoreVal = gradeEntry && gradeEntry.score !== null ? gradeEntry.score : '';
                const noteVal = gradeEntry?.note || '';
                const isPassed =
                  gradeEntry && gradeEntry.score !== null && gradeEntry.score >= currentAssign.maxScore * 0.7;
                const isEven = index % 2 === 0;

                return (
                  <tr
                    key={stu.id}
                    className={`transition-colors hover:bg-[#e7eefe]/50 ${
                      isEven ? 'bg-[#ffffff]' : 'bg-[#f0f3ff]/40'
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={stu.avatar}
                          alt={stu.nickname}
                          className="w-9 h-9 rounded-full border-2 border-[#c9e6ff] object-cover"
                        />
                        <div>
                          <div className="font-bold text-[#151c27]">
                            {stu.title}{stu.firstName} {stu.lastName}
                          </div>
                          <div className="text-xs text-[#41474d]">
                            รหัส: <span className="font-bold">{stu.code}</span> ({stu.nickname})
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleScoreChange(stu.id, currentAssign.maxScore.toString())
                        }
                        className={`p-1.5 rounded-full transition-transform hover:scale-110 ${
                          isPassed
                            ? 'bg-[#aef2c2] text-[#00210f] shadow-xs'
                            : 'bg-[#e2e8f8] text-[#71787e]'
                        }`}
                        title="คลิกเพื่อเกรดเต็มทันที"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">
                          check
                        </span>
                      </button>
                    </td>

                    <td className="p-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max={currentAssign.maxScore}
                        value={scoreVal}
                        onChange={e => handleScoreChange(stu.id, e.target.value)}
                        placeholder="-"
                        className="w-20 bg-[#e2e8f8]/60 border border-[#dce2f3] rounded-full p-2 text-center font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#306385] focus:outline-none transition-colors"
                      />
                    </td>

                    <td className="p-4">
                      <input
                        type="text"
                        value={noteVal}
                        onChange={e => handleNoteChange(stu.id, e.target.value)}
                        placeholder="เพิ่มหมายเหตุ..."
                        className="w-full bg-transparent border-b border-dashed border-[#c1c7ce] p-2 text-sm focus:bg-white focus:border-solid focus:border-[#306385] focus:outline-none rounded-t-sm transition-all"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* List of All Assignments */}
      <section className="bg-[#ffffff] rounded-3xl chibi-shadow border-t-4 border-[#fdbec9] overflow-hidden">
        <div className="p-5 bg-[#f0f3ff] border-b border-[#e2e8f8] flex justify-between items-center">
          <h3 className="font-display text-lg font-bold text-[#151c27]">
            รายการงานทั้งหมด ({assignments.length} งาน)
          </h3>
          <button
            onClick={onOpenNewAssignment}
            className="bg-[#306385] text-white text-xs font-bold py-2 px-4 rounded-full chibi-button flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>สร้างงานใหม่</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fdbec9] text-[#330f19] text-xs font-extrabold">
                <th className="p-4">ชื่องาน / รหัส</th>
                <th className="p-4">วันที่กำหนด</th>
                <th className="p-4 text-center">คะแนนเต็ม</th>
                <th className="p-4">จำนวนการส่ง</th>
                <th className="p-4">สถานะ</th>
                <th className="p-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3ff] text-sm">
              {assignments.map(assign => {
                const checkedCount = localGrades.filter(
                  g => g.assignmentId === assign.id && g.score !== null
                ).length;
                const unsubmitted = activeStudents.length - checkedCount;
                const isAllDone = checkedCount >= activeStudents.length && activeStudents.length > 0;

                return (
                  <tr
                    key={assign.id}
                    className={`transition-colors hover:bg-[#f0f3ff] ${
                      selectedAssignmentId === assign.id ? 'bg-[#e7eefe]' : ''
                    }`}
                  >
                    <td className="p-4 font-bold text-[#151c27]">
                      <button
                        onClick={() => setSelectedAssignmentId(assign.id)}
                        className="text-left hover:text-[#306385] hover:underline"
                      >
                        {assign.title}
                      </button>
                    </td>
                    <td className="p-4 text-[#41474d] text-xs font-medium">{assign.dueDate}</td>
                    <td className="p-4 text-center font-bold text-[#151c27]">{assign.maxScore}</td>
                    <td className="p-4 text-xs font-medium text-[#41474d]">
                      ส่งแล้ว: {checkedCount} คน / ยังไม่ส่ง: {unsubmitted} คน
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          isAllDone
                            ? 'bg-[#aef2c2] text-[#00210f]'
                            : 'bg-[#e2e8f8] text-[#41474d]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isAllDone ? 'check_circle' : 'pending'}
                        </span>
                        <span>{isAllDone ? 'เสร็จสิ้น' : 'กำลังตรวจ'}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => setEditingAssignModal({ ...assign })}
                        className="p-2 text-[#306385] hover:bg-[#c9e6ff]/40 rounded-full transition-colors"
                        title="แก้ไขข้อมูลงาน"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการลบงาน ${assign.title} หรือไม่?`)) {
                            onDeleteAssignment(assign.id);
                          }
                        }}
                        className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-full transition-colors"
                        title="ลบงานนี้"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Assignment Modal */}
      {editingAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151c27]/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#ffffff] rounded-3xl chibi-shadow-lg w-full max-w-md p-6 border-t-4 border-[#fdbec9]">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-xl font-extrabold text-[#306385]">
                แก้ไขรายละเอียดงาน
              </h3>
              <button
                onClick={() => setEditingAssignModal(null)}
                className="p-1 rounded-full hover:bg-[#f0f3ff] text-[#41474d]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAssignModal} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-[#41474d] mb-1">ชื่องานที่มอบหมาย</label>
                <input
                  type="text"
                  required
                  value={editingAssignModal.title || ''}
                  onChange={e =>
                    setEditingAssignModal({ ...editingAssignModal, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#41474d] mb-1">คะแนนเต็ม</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingAssignModal.maxScore || 10}
                    onChange={e =>
                      setEditingAssignModal({
                        ...editingAssignModal,
                        maxScore: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#41474d] mb-1">วันที่กำหนดส่ง</label>
                  <input
                    type="date"
                    value={editingAssignModal.dueDate || ''}
                    onChange={e =>
                      setEditingAssignModal({ ...editingAssignModal, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#41474d] mb-1">คำอธิบายงาน</label>
                <textarea
                  rows={3}
                  value={editingAssignModal.description || ''}
                  onChange={e =>
                    setEditingAssignModal({
                      ...editingAssignModal,
                      description: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#f0f3ff]">
                <button
                  type="button"
                  onClick={() => setEditingAssignModal(null)}
                  className="px-5 py-2.5 rounded-full bg-[#f0f3ff] text-[#41474d] font-bold text-xs chibi-button"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#306385] text-white font-bold text-xs shadow-sm chibi-button"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
