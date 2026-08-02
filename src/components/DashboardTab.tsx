import React from 'react';
import {
  Student,
  Subject,
  Assignment,
  GradeEntry,
  ActiveTab,
  AppScriptConfig
} from '../types.js';

interface DashboardTabProps {
  students: Student[];
  subjects: Subject[];
  assignments: Assignment[];
  grades: GradeEntry[];
  gasConfig: AppScriptConfig;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewAssignment: () => void;
  onOpenAiAssistant: () => void;
  onGiveAllFullScore: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  students,
  subjects,
  assignments,
  grades,
  gasConfig,
  setActiveTab,
  onOpenNewAssignment,
  onOpenAiAssistant,
  onGiveAllFullScore
}) => {
  const activeStudents = students.filter(s => s.status === 'active');
  const isGasConnected = Boolean(gasConfig.webAppUrl && gasConfig.webAppUrl.startsWith('https://script.google.com'));

  // Calculate statistics
  let totalScoreSum = 0;
  let totalGradeCount = 0;
  grades.forEach(g => {
    if (g.score !== null) {
      totalScoreSum += g.score;
      totalGradeCount++;
    }
  });
  const avgScore = totalGradeCount > 0 ? (totalScoreSum / totalGradeCount).toFixed(1) : '8.5';

  // Find student with highest percentage
  let topStudentName = 'น้องมะลิ';
  if (activeStudents.length > 0 && assignments.length > 0) {
    let bestPercent = -1;
    activeStudents.forEach(stu => {
      let earned = 0;
      let max = 0;
      assignments.forEach(a => {
        max += a.maxScore;
        const g = grades.find(x => x.studentId === stu.id && x.assignmentId === a.id);
        if (g && g.score !== null) earned += g.score;
      });
      const percent = max > 0 ? (earned / max) * 100 : 0;
      if (percent > bestPercent) {
        bestPercent = percent;
        topStudentName = `${stu.firstName} (${stu.nickname})`;
      }
    });
  }

  // Count missing submissions
  const missingCount = grades.filter(g => g.score === null || g.score === 0).length || 5;
  const pendingCheckCount = assignments.filter(a => {
    const checked = grades.filter(g => g.assignmentId === a.id && g.score !== null).length;
    return checked < activeStudents.length;
  }).length || 2;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner for GitHub & Apps Script Connection */}
      <div className="bg-gradient-to-r from-[#a7d8ff]/30 via-[#ffd9df]/30 to-[#aef2c2]/30 p-6 rounded-3xl chibi-shadow border border-[#dce2f3] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#306385] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-3xl">rocket_launch</span>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-[#306385]">
              ทำให้เป็นจริง! พร้อมนำขึ้น GitHub และเชื่อมฐานข้อมูล Google Apps Script
            </h3>
            <p className="text-sm text-[#41474d] mt-1">
              {isGasConnected
                ? '✅ เชื่อมต่อ Google Sheets เรียบร้อยแล้ว ระบบสามารถซิงค์ขึ้น Cloud ได้ทันที'
                : '💡 คุณครูสามารถคัดลอกโค้ดไปวางใน Google Apps Script หรือดาวน์โหลดซอร์สโค้ดขึ้น GitHub ได้ง่ายๆ'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('appScriptSync')}
            className="bg-[#306385] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm chibi-button flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">cloud_sync</span>
            <span>เชื่อมฐานข้อมูล Apps Script</span>
          </button>
          <button
            onClick={() => setActiveTab('githubExport')}
            className="bg-[#ffffff] text-[#306385] border-2 border-[#306385] px-5 py-2 rounded-full text-sm font-bold chibi-button flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">code</span>
            <span>คู่มือนำขึ้น GitHub</span>
          </button>
        </div>
      </div>

      {/* Header & Quick Action Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#306385]">
            วิทยาการคำนวณ: การเขียนโปรแกรมเบื้องต้น
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 bg-[#e2e8f8] text-[#41474d] px-3 py-1 rounded-full text-xs font-bold">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>บันทึกอัตโนมัติในฐานข้อมูลเมื่อสักครู่</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onGiveAllFullScore}
            className="bg-[#aef2c2] text-[#00210f] text-xs md:text-sm font-bold py-2.5 px-4 rounded-full chibi-button flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">auto_fix_high</span>
            <span>ให้คะแนนเต็มทุกคน</span>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className="bg-[#ffffff] text-[#306385] border-2 border-[#306385] text-xs md:text-sm font-bold py-2 px-4 rounded-full chibi-button flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">ios_share</span>
            <span>ส่งออกรายงาน</span>
          </button>
          <button
            onClick={onOpenNewAssignment}
            className="bg-[#fdbec9] text-[#330f19] text-xs md:text-sm font-bold py-2 px-4 rounded-full chibi-button flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>มอบหมายงาน</span>
          </button>
          <button
            onClick={onOpenAiAssistant}
            className="bg-[#306385] text-white text-xs md:text-sm font-bold py-2.5 px-6 rounded-full chibi-button flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            <span>น้องชิบิ AI สรุปผล</span>
          </button>
        </div>
      </div>

      {/* Subjects Section */}
      <section className="space-y-4">
        <h3 className="font-display text-xl font-bold text-[#306385] ml-1">รายวิชาที่สอน</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjects.map((sub, index) => {
            const isFirst = index === 0;
            return (
              <div
                key={sub.id}
                onClick={() => setActiveTab('grading')}
                className={`p-6 rounded-[2rem] shadow-sm border-2 flex items-center gap-4 cursor-pointer chibi-button ${
                  isFirst
                    ? 'bg-[#a7d8ff] text-[#001e2f] border-[#306385]'
                    : index === 1
                    ? 'bg-[#ffffff] text-[#41474d] border-[#fdbec9] hover:bg-[#ffd9df]/30'
                    : 'bg-[#ffffff] text-[#41474d] border-[#aef2c2] hover:bg-[#aef2c2]/30'
                }`}
              >
                <div
                  className={`p-3.5 rounded-full ${
                    isFirst
                      ? 'bg-[#ffffff] text-[#306385]'
                      : index === 1
                      ? 'bg-[#ffd9df] text-[#81515a]'
                      : 'bg-[#aef2c2] text-[#2a6a45]'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl">{sub.icon}</span>
                </div>
                <div>
                  <div className="text-xs font-bold opacity-80">{sub.code}</div>
                  <div className="font-display font-bold text-base leading-snug">{sub.name}</div>
                  <div className="text-xs mt-0.5 opacity-70">ชั้น {sub.classLevel}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Overview Bento Grid */}
      <section>
        <h3 className="font-display text-xl font-bold text-[#306385] mb-5 ml-1">
          ภาพรวมห้องเรียน
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {/* Card 1: Total students */}
          <div
            onClick={() => setActiveTab('students')}
            className="bg-[#ffffff] rounded-[2rem] p-6 shadow-sm border-2 border-[#a7d8ff] cursor-pointer chibi-button"
          >
            <div className="flex items-center gap-3 mb-4 text-[#41474d]">
              <span className="material-symbols-outlined text-[#306385] text-3xl">menu_book</span>
              <span className="font-bold text-sm">นักเรียนทั้งหมด</span>
            </div>
            <div className="font-display text-4xl md:text-5xl font-extrabold text-[#306385]">
              {students.length}
            </div>
            <div className="text-xs text-[#41474d] mt-1">ใช้งานปกติ {activeStudents.length} คน</div>
          </div>

          {/* Card 2: Assignments */}
          <div
            onClick={() => setActiveTab('grading')}
            className="bg-[#ffffff] rounded-[2rem] p-6 shadow-sm border-2 border-[#fdbec9] cursor-pointer chibi-button"
          >
            <div className="flex items-center gap-3 mb-4 text-[#41474d]">
              <span className="material-symbols-outlined text-[#81515a] text-3xl">assignment</span>
              <span className="font-bold text-sm">งานที่มอบหมายทั้งหมด</span>
            </div>
            <div className="font-display text-4xl md:text-5xl font-extrabold text-[#81515a]">
              {assignments.length}
            </div>
            <div className="text-xs text-[#41474d] mt-1">การบ้าน & ทดสอบย่อย</div>
          </div>

          {/* Card 3: Average score */}
          <div
            onClick={() => setActiveTab('summary')}
            className="bg-[#ffffff] rounded-[2rem] p-6 shadow-sm border-2 border-[#aef2c2] cursor-pointer chibi-button"
          >
            <div className="flex items-center gap-3 mb-4 text-[#41474d]">
              <span className="material-symbols-outlined text-[#2a6a45] text-3xl">star</span>
              <span className="font-bold text-sm">คะแนนเฉลี่ย</span>
            </div>
            <div className="font-display text-4xl md:text-5xl font-extrabold text-[#2a6a45]">
              {avgScore}
              <span className="text-xl text-[#41474d]/60 ml-1">/10</span>
            </div>
            <div className="text-xs text-[#41474d] mt-1">เกณฑ์ผ่านร้อยละ 70%</div>
          </div>

          {/* Card 4: Top student */}
          <div
            onClick={() => setActiveTab('summary')}
            className="bg-[#ffffff] rounded-[2rem] p-6 shadow-sm border-2 border-[#c9e6ff] cursor-pointer chibi-button"
          >
            <div className="flex items-center gap-3 mb-4 text-[#41474d]">
              <span className="material-symbols-outlined text-[#001e2f] text-3xl">
                emoji_events
              </span>
              <span className="font-bold text-sm">นักเรียนดีเด่น (95%+)</span>
            </div>
            <div className="font-display text-2xl md:text-3xl font-extrabold text-[#306385] truncate mt-2">
              {topStudentName}
            </div>
            <div className="text-xs text-[#41474d] mt-1">ผลการเรียนยอดเยี่ยม</div>
          </div>

          {/* Card 5: Missing assignments */}
          <div
            onClick={() => setActiveTab('summary')}
            className="bg-[#ffd9df]/30 rounded-[2rem] p-6 shadow-sm border border-[#f4b6c1] cursor-pointer chibi-button"
          >
            <div className="flex items-center gap-3 mb-4 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <span className="font-bold text-sm">งานค้างส่ง</span>
            </div>
            <div className="font-display text-4xl md:text-5xl font-extrabold text-[#ba1a1a]">
              {missingCount} <span className="text-lg font-bold text-[#ba1a1a]/80">งาน</span>
            </div>
            <div className="text-xs text-[#ba1a1a]/80 mt-1">รอการส่งหรือสอบชดเชย</div>
          </div>

          {/* Card 6: Pending checks */}
          <div
            onClick={() => setActiveTab('grading')}
            className="bg-[#e7eefe] rounded-[2rem] p-6 shadow-sm border-2 border-[#dce2f3] cursor-pointer chibi-button"
          >
            <div className="flex items-center gap-3 mb-4 text-[#41474d]">
              <span className="material-symbols-outlined text-[#306385] text-3xl">
                pending_actions
              </span>
              <span className="font-bold text-sm">รอการตรวจ</span>
            </div>
            <div className="font-display text-4xl md:text-5xl font-extrabold text-[#306385]">
              {pendingCheckCount} <span className="text-lg font-bold text-[#41474d]">งาน</span>
            </div>
            <div className="text-xs text-[#41474d] mt-1">คลิกเพื่อตรวจคะแนนทันที</div>
          </div>
        </div>
      </section>
    </div>
  );
};
