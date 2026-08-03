import React, { useState } from 'react';
import {
  Student,
  Subject,
  Assignment,
  GradeEntry,
  SchoolSettings
} from '../types.js';
import { Printer, Copy, Check, X, FileText, UserCheck, Award } from 'lucide-react';

interface P5ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  subjects: Subject[];
  assignments: Assignment[];
  grades: GradeEntry[];
  settings?: SchoolSettings;
  selectedSubjectId?: string;
}

export const P5ReportModal: React.FC<P5ReportModalProps> = ({
  isOpen,
  onClose,
  students,
  subjects,
  assignments,
  grades,
  settings,
  selectedSubjectId = ''
}) => {
  const [activeTab, setActiveTab] = useState<'p5' | 'reportCard'>('p5');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const subjectAssignments = currentSubject
    ? assignments.filter(a => a.subjectId === currentSubject.id)
    : assignments;

  const totalMaxScore = subjectAssignments.reduce((sum, a) => sum + a.maxScore, 0);

  const calculateStudentGrade = (stu: Student) => {
    let earnedScore = 0;
    let completedCount = 0;

    subjectAssignments.forEach(a => {
      const g = grades.find(x => x.studentId === stu.id && x.assignmentId === a.id);
      if (g && g.score !== null) {
        earnedScore += g.score;
        completedCount++;
      }
    });

    const percent = totalMaxScore > 0 ? Number(((earnedScore / totalMaxScore) * 100).toFixed(1)) : 0;
    let grade = '0';
    let label = 'ไม่ผ่านเกณฑ์';
    if (percent >= 80) {
      grade = '4';
      label = 'ดีเยี่ยม';
    } else if (percent >= 75) {
      grade = '3.5';
      label = 'ดีมาก';
    } else if (percent >= 70) {
      grade = '3';
      label = 'ดี';
    } else if (percent >= 65) {
      grade = '2.5';
      label = 'ค่อนข้างดี';
    } else if (percent >= 60) {
      grade = '2';
      label = 'ปานกลาง';
    } else if (percent >= 55) {
      grade = '1.5';
      label = 'พอใช้';
    } else if (percent >= 50) {
      grade = '1';
      label = 'ผ่านเกณฑ์ขั้นต่ำ';
    }

    return {
      earnedScore,
      percent,
      grade,
      label,
      completedCount
    };
  };

  const studentRows = students.map(stu => ({
    student: stu,
    ...calculateStudentGrade(stu)
  }));

  // Statistics
  const gradeCounts: Record<string, number> = {
    '4': 0,
    '3.5': 0,
    '3': 0,
    '2.5': 0,
    '2': 0,
    '1.5': 0,
    '1': 0,
    '0': 0
  };
  studentRows.forEach(r => {
    gradeCounts[r.grade] = (gradeCounts[r.grade] || 0) + 1;
  });

  const averageScore =
    studentRows.length > 0
      ? Number(
          (
            studentRows.reduce((sum, r) => sum + r.earnedScore, 0) /
            studentRows.length
          ).toFixed(1)
        )
      : 0;

  const averagePercent =
    studentRows.length > 0
      ? Number(
          (
            studentRows.reduce((sum, r) => sum + r.percent, 0) /
            studentRows.length
          ).toFixed(1)
        )
      : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      `📊 รายงานผลการเรียน: ${currentSubject?.name || 'สรุปทุกวิชา'}`,
      `โรงเรียน: ${settings?.schoolName || 'โรงเรียนบ้านไร่'} (ปีการศึกษา ${settings?.academicYear || '2568'} / ภาคเรียนที่ ${settings?.semester || '1'})`,
      `ครูผู้สอน: ${settings?.teacherName || 'ครูประจำวิชา'}`,
      `-----------------------------------------`,
      `นักเรียนทั้งหมด: ${studentRows.length} คน | คะแนนเฉลี่ยห้อง: ${averageScore}/${totalMaxScore} (${averagePercent}%)`,
      `-----------------------------------------`,
      ...studentRows.map(
        (r, idx) =>
          `${idx + 1}. ${r.student.code} ${r.student.title}${r.student.firstName} ${r.student.lastName} (${r.student.nickname}): ได้ ${r.earnedScore}/${totalMaxScore} คะแนน (${r.percent}%) => เกรด ${r.grade} [${r.label}]`
      ),
      `-----------------------------------------`,
      `สร้างโดย น้องชิบิ AI Assistant ผู้ช่วยครู`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const selectedStudentRow =
    studentRows.find(r => r.student.id === selectedStudentId) || studentRows[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#151c27]/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-[#e2e8f8] overflow-hidden print:shadow-none print:border-none print:max-w-none print:max-h-none print:rounded-none">
        {/* Header - non-print */}
        <div className="bg-[#f0f3ff] px-6 py-4 border-b border-[#e2e8f8] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#306385] text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#306385]">
                ระบบสร้างเอกสารและพิมพ์รายงานผลการเรียนทางการ
              </h2>
              <p className="text-xs text-[#41474d]">
                พิมพ์รายงาน ปพ.5 ส่งวิชาการ หรือ ใบแจ้งคะแนนรายคนสำหรับแจ้งผู้ปกครอง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#306385] hover:bg-[#204e6c] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสารนี้ (Print / PDF)</span>
            </button>
            <button
              onClick={handleCopyText}
              className="bg-[#e7f1f8] hover:bg-[#d5e6f3] text-[#1c4966] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-[#0a522f]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'คัดลอกข้อความแล้ว!' : 'คัดลอกส่งไลน์ห้องเรียน'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#e2e8f8] text-[#41474d] transition-colors"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher - non-print */}
        <div className="px-6 pt-3 pb-2 border-b border-[#e2e8f8] flex items-center gap-2 bg-[#f9f9ff] print:hidden">
          <button
            onClick={() => setActiveTab('p5')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'p5'
                ? 'bg-[#306385] text-white shadow-sm'
                : 'bg-white text-[#41474d] border border-[#dce2f3] hover:bg-[#f0f3ff]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>รายงาน ปพ.5 (ตารางผลการเรียนประจำวิชา)</span>
          </button>
          <button
            onClick={() => setActiveTab('reportCard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'reportCard'
                ? 'bg-[#306385] text-white shadow-sm'
                : 'bg-white text-[#41474d] border border-[#dce2f3] hover:bg-[#f0f3ff]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>ใบแจ้งคะแนนรายบุคคล (แจ้งผู้ปกครอง / นักเรียน)</span>
          </button>

          {activeTab === 'reportCard' && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs font-bold text-[#41474d]">เลือกนักเรียน:</span>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="text-xs font-bold bg-white border border-[#dce2f3] rounded-full px-3 py-1 text-[#306385] focus:outline-none"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.title}{s.firstName} {s.lastName} ({s.nickname})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Printable Content Area */}
        <div className="p-8 overflow-y-auto flex-1 bg-white print:p-0">
          {activeTab === 'p5' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Formal Thai School Header */}
              <div className="text-center space-y-1 border-b-2 border-[#151c27] pb-4">
                <div className="text-sm font-bold text-[#41474d]">
                  แบบรายงานสรุปผลการประเมินผลการเรียนรายวิชา (ปพ.5)
                </div>
                <h1 className="text-2xl font-extrabold text-[#151c27]">
                  {settings?.schoolName || 'โรงเรียนบ้านไร่'}
                </h1>
                <div className="text-sm font-semibold text-[#41474d] flex flex-wrap justify-center gap-x-6 gap-y-1 pt-1">
                  <span>
                    วิชา: <strong className="text-[#306385]">{currentSubject?.name || 'ทุกรายวิชา'}</strong>
                  </span>
                  <span>
                    รหัสวิชา: <strong>{currentSubject?.code || '-'}</strong>
                  </span>
                  <span>
                    ชั้นเรียน: <strong>{currentSubject?.classLevel || 'ป.1/1'}</strong>
                  </span>
                  <span>
                    ปีการศึกษา: <strong>{settings?.academicYear || '2568'}</strong> (ภาคเรียนที่{' '}
                    <strong>{settings?.semester || '1'}</strong>)
                  </span>
                </div>
                <div className="text-xs font-medium text-[#71787e]">
                  ครูผู้สอน: {settings?.teacherName || 'ครูประจำวิชา'} | คะแนนเต็มรวมทั้งหมด: {totalMaxScore} คะแนน
                </div>
              </div>

              {/* Main Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-[#151c27] text-xs">
                  <thead>
                    <tr className="bg-[#f0f3ff] text-[#151c27] font-bold text-center">
                      <th className="border border-[#151c27] py-2 px-2 w-10">ที่</th>
                      <th className="border border-[#151c27] py-2 px-2 w-20">รหัส</th>
                      <th className="border border-[#151c27] py-2 px-3 text-left">ชื่อ - นามสกุล</th>
                      {subjectAssignments.map((a, idx) => (
                        <th key={a.id} className="border border-[#151c27] py-2 px-1 w-14">
                          ชิ้นที่ {idx + 1}
                          <div className="text-[10px] font-normal text-[#41474d]">
                            ({a.maxScore})
                          </div>
                        </th>
                      ))}
                      <th className="border border-[#151c27] py-2 px-2 w-16 bg-[#e7f1f8]">
                        รวม ({totalMaxScore})
                      </th>
                      <th className="border border-[#151c27] py-2 px-2 w-14 bg-[#e7f1f8]">ร้อยละ</th>
                      <th className="border border-[#151c27] py-2 px-2 w-14 bg-[#ffd5dc] text-[#330f19]">
                        เกรด
                      </th>
                      <th className="border border-[#151c27] py-2 px-2 w-20">ระดับคุณภาพ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentRows.map((row, idx) => (
                      <tr key={row.student.id} className="hover:bg-[#f9f9ff]">
                        <td className="border border-[#151c27] py-2 px-2 text-center font-semibold">
                          {idx + 1}
                        </td>
                        <td className="border border-[#151c27] py-2 px-2 text-center font-mono font-bold">
                          {row.student.code}
                        </td>
                        <td className="border border-[#151c27] py-2 px-3 font-medium">
                          {row.student.title}
                          {row.student.firstName} {row.student.lastName} ({row.student.nickname})
                        </td>
                        {subjectAssignments.map(a => {
                          const g = grades.find(
                            x => x.studentId === row.student.id && x.assignmentId === a.id
                          );
                          return (
                            <td
                              key={a.id}
                              className="border border-[#151c27] py-2 px-1 text-center font-medium"
                            >
                              {g && g.score !== null ? g.score : '-'}
                            </td>
                          );
                        })}
                        <td className="border border-[#151c27] py-2 px-2 text-center font-bold bg-[#f0f6fa]">
                          {row.earnedScore}
                        </td>
                        <td className="border border-[#151c27] py-2 px-2 text-center font-bold bg-[#f0f6fa]">
                          {row.percent}%
                        </td>
                        <td className="border border-[#151c27] py-2 px-2 text-center font-extrabold text-[#93000a] bg-[#fff5f6]">
                          {row.grade}
                        </td>
                        <td className="border border-[#151c27] py-2 px-2 text-center font-semibold">
                          {row.label}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Grade Distribution */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#f9f9ff] p-4 rounded-2xl border border-[#dce2f3]">
                <div className="font-bold text-[#306385]">
                  คะแนนเฉลี่ยห้อง: {averageScore}/{totalMaxScore} ({averagePercent}%)
                </div>
                <div className="font-bold text-[#2a6a45]">
                  เกรด 4 (ดีเยี่ยม): {gradeCounts['4'] || 0} คน
                </div>
                <div className="font-bold text-[#306385]">
                  เกรด 3-3.5 (ดี-ดีมาก): {(gradeCounts['3.5'] || 0) + (gradeCounts['3'] || 0)} คน
                </div>
                <div className="font-bold text-[#93000a]">
                  เกรดต่ำกว่า 2: {(gradeCounts['1.5'] || 0) + (gradeCounts['1'] || 0) + (gradeCounts['0'] || 0)} คน
                </div>
              </div>

              {/* Official 3-signature block */}
              <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-xs text-[#151c27]">
                <div className="space-y-4">
                  <div>ลงชื่อ ..............................................................</div>
                  <div className="font-bold">( {settings?.teacherName || 'คุณครูผู้สอน'} )</div>
                  <div className="text-[#41474d]">ครูประจำวิชา</div>
                </div>
                <div className="space-y-4">
                  <div>ลงชื่อ ..............................................................</div>
                  <div className="font-bold">( ..................................................... )</div>
                  <div className="text-[#41474d]">หัวหน้ากลุ่มสาระการเรียนรู้</div>
                </div>
                <div className="space-y-4">
                  <div>ลงชื่อ ..............................................................</div>
                  <div className="font-bold">( ..................................................... )</div>
                  <div className="text-[#41474d]">ผู้อำนวยการโรงเรียน</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reportCard' && selectedStudentRow && (
            <div className="max-w-2xl mx-auto border-2 border-[#306385] rounded-3xl p-8 space-y-6 bg-white">
              {/* Report Card Header */}
              <div className="flex items-center justify-between border-b border-[#e2e8f8] pb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedStudentRow.student.avatar}
                    alt={selectedStudentRow.student.nickname}
                    className="w-16 h-16 rounded-full border-2 border-[#306385] bg-[#f0f3ff]"
                  />
                  <div>
                    <h3 className="text-xl font-extrabold text-[#306385]">
                      {selectedStudentRow.student.title}
                      {selectedStudentRow.student.firstName} {selectedStudentRow.student.lastName} (
                      {selectedStudentRow.student.nickname})
                    </h3>
                    <p className="text-xs text-[#41474d] font-semibold mt-0.5">
                      รหัสประจำตัว: <span className="font-mono">{selectedStudentRow.student.code}</span> |
                      ชั้นเรียน: {selectedStudentRow.student.classLevel} ({selectedStudentRow.student.room})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#41474d]">ใบแจ้งผลการเรียน</div>
                  <div className="text-sm font-extrabold text-[#151c27]">
                    {settings?.schoolName || 'โรงเรียนบ้านไร่'}
                  </div>
                  <div className="text-[11px] text-[#71787e]">
                    เทอม {settings?.semester || '1'}/{settings?.academicYear || '2568'}
                  </div>
                </div>
              </div>

              {/* Subject badge & grade overview card */}
              <div className="bg-[#f0f3ff] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#41474d] font-bold">วิชาที่ประเมิน</div>
                  <div className="text-base font-extrabold text-[#306385]">
                    {currentSubject?.name || 'ทุกรายวิชา'} ({currentSubject?.code || '-'})
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-[#41474d] font-bold">คะแนนรวม</div>
                    <div className="text-lg font-black text-[#151c27]">
                      {selectedStudentRow.earnedScore} / {totalMaxScore} ({selectedStudentRow.percent}%)
                    </div>
                  </div>
                  <div className="bg-[#306385] text-white px-4 py-2 rounded-2xl text-center">
                    <div className="text-[10px] uppercase font-bold tracking-wide">เกรด</div>
                    <div className="text-2xl font-black">{selectedStudentRow.grade}</div>
                  </div>
                </div>
              </div>

              {/* Assignments Breakdown Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#41474d] uppercase tracking-wider">
                  รายละเอียดคะแนนรายชิ้นงาน
                </h4>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f9f9ff] text-[#41474d] font-bold border-b border-[#dce2f3]">
                      <th className="py-2 px-3 text-left">รายการชิ้นงาน / การประเมิน</th>
                      <th className="py-2 px-3 text-center">คะแนนเต็ม</th>
                      <th className="py-2 px-3 text-center">คะแนนที่ได้</th>
                      <th className="py-2 px-3 text-right">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f3ff]">
                    {subjectAssignments.map(a => {
                      const g = grades.find(
                        x => x.studentId === selectedStudentRow.student.id && x.assignmentId === a.id
                      );
                      const isGraded = g && g.score !== null;
                      return (
                        <tr key={a.id} className="hover:bg-[#f9f9ff]/50">
                          <td className="py-2.5 px-3 font-medium text-[#151c27]">{a.title}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-[#41474d]">
                            {a.maxScore}
                          </td>
                          <td className="py-2.5 px-3 text-center font-extrabold text-[#306385]">
                            {isGraded ? g.score : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {isGraded ? (
                              <span className="text-xs font-bold text-[#0a522f]">
                                🟢 ตรวจแล้ว
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-[#996300]">
                                🟡 ค้างส่ง
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Teacher Recommendation & Encouragement Banner */}
              <div className="bg-[#ebf7f0] border border-[#93d5a7] rounded-2xl p-4 space-y-1">
                <div className="text-xs font-bold text-[#0a522f] flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>ความคิดเห็นจากครูประจำวิชา ({settings?.teacherName || 'คุณครู'}):</span>
                </div>
                <p className="text-xs text-[#0a522f] font-medium leading-relaxed">
                  {selectedStudentRow.grade === '4'
                    ? 'ผลการเรียนอยู่ในเกณฑ์ดีเยี่ยม! มีความรับผิดชอบและส่งงานครบถ้วน ขอให้รักษามาตรฐานการเรียนที่ดีนี้ต่อไปค่ะ'
                    : selectedStudentRow.grade >= '3'
                    ? 'ผลการเรียนอยู่ในเกณฑ์ดีมาก มีความพยายามและตั้งใจเรียนดี ควรทบทวนเนื้อหาเพิ่มเติมเล็กน้อยเพื่อความเป็นเลิศ'
                    : 'ควรเพิ่มความเอาใจใส่ในการส่งงานและทำแบบฝึกหัด หากมีข้อสงสัยในเนื้อหาเรียนสามารถสอบถามคุณครูได้เสมอค่ะ'}
                </p>
              </div>

              {/* Signature section */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-[#151c27]">
                <div className="space-y-3">
                  <div>ลงชื่อ ..............................................................</div>
                  <div className="font-bold">( {settings?.teacherName || 'คุณครูผู้สอน'} )</div>
                  <div className="text-[#71787e]">ครูประจำวิชา</div>
                </div>
                <div className="space-y-3">
                  <div>ลงชื่อ ..............................................................</div>
                  <div className="font-bold">( .............................................................. )</div>
                  <div className="text-[#71787e]">ผู้ปกครองรับทราบผลการเรียน</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
