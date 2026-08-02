import React, { useState } from 'react';
import {
  Student,
  Subject,
  Assignment,
  GradeEntry
} from '../types.js';
import { exportToCSV } from '../services/api.js';

interface SummaryTabProps {
  students: Student[];
  subjects: Subject[];
  assignments: Assignment[];
  grades: GradeEntry[];
  onOpenAiAssistant: () => void;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  students,
  subjects,
  assignments,
  grades,
  onOpenAiAssistant
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'low' | 'missing' | 'top'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedClass, setSelectedClass] = useState('ป.1/1');

  // Calculate student totals & percentages & ranks
  const totalMaxScore = assignments.reduce((sum, a) => sum + a.maxScore, 0);

  const studentSummaries = students
    .map(stu => {
      let earnedScore = 0;
      let hasMissing = false;

      const scoresByAssign: Record<string, { score: number | null; isCompleted: boolean }> = {};
      assignments.forEach(a => {
        const g = grades.find(x => x.studentId === stu.id && x.assignmentId === a.id);
        if (g && g.score !== null) {
          earnedScore += g.score;
          scoresByAssign[a.id] = { score: g.score, isCompleted: true };
        } else {
          hasMissing = true;
          scoresByAssign[a.id] = { score: null, isCompleted: false };
        }
      });

      const percentage =
        totalMaxScore > 0 ? Number(((earnedScore / totalMaxScore) * 100).toFixed(1)) : 0;

      return {
        student: stu,
        earnedScore,
        percentage,
        hasMissing,
        scoresByAssign
      };
    })
    .sort((a, b) => b.percentage - a.percentage); // sort descending by score

  // Assign ranks
  const rankedStudents = studentSummaries.map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));

  // Apply filters
  const filteredList = rankedStudents.filter(item => {
    // Search
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      item.student.code.toLowerCase().includes(term) ||
      item.student.firstName.toLowerCase().includes(term) ||
      item.student.lastName.toLowerCase().includes(term) ||
      item.student.nickname.toLowerCase().includes(term);

    // Class level
    const matchesClass = !selectedClass || item.student.classLevel === selectedClass;

    // Quick button filters
    let matchesQuickFilter = true;
    if (activeFilter === 'low') {
      matchesQuickFilter = item.percentage < 70;
    } else if (activeFilter === 'missing') {
      matchesQuickFilter = item.hasMissing;
    } else if (activeFilter === 'top') {
      matchesQuickFilter = item.percentage >= 95;
    }

    return matchesSearch && matchesClass && matchesQuickFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn relative pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#306385]">
            สรุปผลคะแนนรายวิชา - โรงเรียนบ้านไร่
          </h1>
          <p className="text-sm md:text-base text-[#41474d] mt-1">
            ตารางสรุปเกรดและอันดับคะแนนของนักเรียนทุกคนในชั้นเรียน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportToCSV(students, assignments, grades)}
            className="bg-[#ffffff] text-[#306385] border-2 border-[#a7d8ff] hover:border-[#306385] px-4 py-2 rounded-full text-sm font-bold chibi-button flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>ส่งออก Excel / CSV</span>
          </button>
          <button
            onClick={onOpenAiAssistant}
            className="bg-[#306385] text-white px-5 py-2 rounded-full text-sm font-bold shadow-sm chibi-button flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">summarize</span>
            <span>สร้างรายงานสรุป AI</span>
          </button>
        </div>
      </div>

      {/* Filter & Toolbar Box */}
      <div className="bg-[#ffffff] p-4 rounded-3xl chibi-shadow border border-[#e2e8f8] flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#41474d] mr-1">ตัวกรองด่วน:</span>
          <button
            onClick={() => setActiveFilter(activeFilter === 'low' ? 'all' : 'low')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all chibi-button ${
              activeFilter === 'low'
                ? 'bg-[#ba1a1a] text-white shadow-sm'
                : 'bg-[#ffdad6] text-[#93000a] hover:bg-[#ffdad6]/80'
            }`}
          >
            คะแนนต่ำ (&lt; 70%)
          </button>
          <button
            onClick={() => setActiveFilter(activeFilter === 'missing' ? 'all' : 'missing')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all chibi-button ${
              activeFilter === 'missing'
                ? 'bg-[#81515a] text-white shadow-sm'
                : 'bg-[#ffd9df] text-[#330f19] hover:bg-[#ffd9df]/80'
            }`}
          >
            ค้างส่งงาน
          </button>
          <button
            onClick={() => setActiveFilter(activeFilter === 'top' ? 'all' : 'top')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all chibi-button ${
              activeFilter === 'top'
                ? 'bg-[#2a6a45] text-white shadow-sm'
                : 'bg-[#aef2c2] text-[#00210f] hover:bg-[#aef2c2]/80'
            }`}
          >
            นักเรียนดีเด่น (95%+)
          </button>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="px-3 py-1.5 rounded-full bg-[#e2e8f8] text-[#41474d] text-xs font-bold hover:underline"
            >
              แสดงทั้งหมด
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f0f3ff] px-3.5 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[#71787e] text-base">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ค้นหานักเรียน..."
              className="bg-transparent border-none focus:outline-none text-xs font-medium w-36"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#f0f3ff] px-3.5 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[#71787e] text-base">book</span>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-medium text-[#151c27] cursor-pointer"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#f0f3ff] px-3.5 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[#71787e] text-base">school</span>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-medium text-[#151c27] cursor-pointer"
            >
              <option value="ป.1/1">ป.1/1</option>
              <option value="ป.1/2">ป.1/2</option>
              <option value="ป.2/1">ป.2/1</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Gradebook Table */}
      <div className="bg-[#ffffff] rounded-3xl chibi-shadow overflow-hidden border-t-4 border-[#306385]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[850px]">
            <thead>
              <tr className="bg-[#f0f3ff] text-[#41474d] text-xs font-extrabold border-b border-[#e2e8f8]">
                <th className="py-4 px-4 text-center w-16">รหัส</th>
                <th className="py-4 px-4 min-w-[180px] bg-[#f0f3ff] sticky left-0 z-10 border-r border-[#e2e8f8]">
                  ชื่อนักเรียน
                </th>
                {assignments.map(a => (
                  <th key={a.id} className="py-4 px-3 text-center">
                    {a.title.split(' - ')[0] || a.title}
                  </th>
                ))}
                <th className="py-4 px-4 text-center bg-[#dce2f3]">รวม ({totalMaxScore})</th>
                <th className="py-4 px-4 text-center bg-[#dce2f3]">ร้อยละ</th>
                <th className="py-4 px-4 text-center bg-[#dce2f3] rounded-tr-3xl">อันดับ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3ff] text-sm">
              {filteredList.map((row, index) => {
                const { student, earnedScore, percentage, scoresByAssign, rank } = row;
                const isEven = index % 2 === 0;

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors group hover:bg-[#e7eefe]/50 ${
                      isEven ? 'bg-[#ffffff]' : 'bg-[#f9f9ff]'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-bold text-[#71787e]">
                      {student.code}
                    </td>

                    <td
                      className={`py-3.5 px-4 font-bold sticky left-0 z-10 border-r border-[#e2e8f8] flex items-center gap-3 ${
                        isEven ? 'bg-[#ffffff]' : 'bg-[#f9f9ff]'
                      }`}
                    >
                      <img
                        src={student.avatar}
                        alt={student.nickname}
                        className="w-8 h-8 rounded-full border-2 border-[#a7d8ff] object-cover"
                      />
                      <span>
                        {student.firstName} {student.lastName} ({student.nickname})
                      </span>
                    </td>

                    {assignments.map(a => {
                      const entry = scoresByAssign[a.id];
                      let cellClass = 'bg-[#ebf7f0] text-[#0a522f]'; // completed green
                      let cellText = entry?.score !== null && entry?.score !== undefined ? entry.score.toString() : '--';

                      if (!entry?.isCompleted || entry.score === null) {
                        cellClass = 'bg-[#fff9e6] text-[#996300] italic font-semibold';
                      } else if (entry.score === 0) {
                        cellClass = 'bg-[#ffdad6] text-[#93000a]';
                      }

                      return (
                        <td key={a.id} className="py-3.5 px-3 text-center">
                          <span className={`inline-block w-11 py-1.5 rounded-xl font-bold text-xs ${cellClass}`}>
                            {cellText}
                          </span>
                        </td>
                      );
                    })}

                    <td className="py-3.5 px-4 text-center font-extrabold bg-[#f0f3ff] text-[#306385]">
                      {earnedScore}
                    </td>

                    <td
                      className={`py-3.5 px-4 text-center font-extrabold bg-[#f0f3ff] ${
                        percentage >= 90
                          ? 'text-[#2a6a45]'
                          : percentage < 70
                          ? 'text-[#ba1a1a]'
                          : 'text-[#306385]'
                      }`}
                    >
                      {percentage}%
                    </td>

                    <td className="py-3.5 px-4 text-center font-extrabold bg-[#f0f3ff]">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          rank === 1
                            ? 'bg-[#fdbec9] text-[#330f19] shadow-xs'
                            : rank <= 3
                            ? 'bg-[#aef2c2] text-[#00210f]'
                            : 'bg-[#e2e8f8] text-[#41474d]'
                        }`}
                      >
                        {rank}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={assignments.length + 5} className="py-12 text-center text-[#71787e] font-medium">
                    ไม่พบข้อมูลนักเรียนที่ตรงตามเงื่อนไขตัวกรอง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Summary Report Button */}
      <button
        onClick={onOpenAiAssistant}
        className="fixed bottom-8 right-8 z-40 bg-[#81515a] text-white rounded-full px-6 py-4 flex items-center gap-3 shadow-[0px_8px_30px_rgba(129,81,90,0.4)] hover:-translate-y-1 transition-transform duration-200 chibi-button font-bold text-sm"
      >
        <span className="material-symbols-outlined text-xl">summarize</span>
        <span>สร้างรายงานสรุป</span>
      </button>
    </div>
  );
};
