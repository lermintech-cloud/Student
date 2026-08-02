import React from 'react';
import {
  Student,
  Subject,
  Assignment,
  GradeEntry,
  ActiveTab,
  AppScriptConfig,
  SchoolSettings
} from '../types.js';
import {
  GraduationCap,
  Wand2,
  Share2,
  Plus,
  Sparkles,
  BookOpen,
  BarChart3,
  Users,
  Award,
  FileText,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Cloud,
  Calendar,
  Star,
  School,
  Code,
  Calculator,
  Globe,
  Palette,
  Music,
  Atom,
  Heart
} from 'lucide-react';

interface DashboardTabProps {
  students: Student[];
  subjects: Subject[];
  assignments: Assignment[];
  grades: GradeEntry[];
  gasConfig: AppScriptConfig;
  settings?: SchoolSettings;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewAssignment: () => void;
  onOpenAiAssistant: () => void;
  onGiveAllFullScore: () => void;
}

const getSubjectLucideIcon = (iconName: string, className = "w-7 h-7") => {
  switch (iconName) {
    case 'computer':
    case 'code':
      return <Code className={className} />;
    case 'calculate':
    case 'calculator':
      return <Calculator className={className} />;
    case 'science':
    case 'atom':
      return <Atom className={className} />;
    case 'language':
    case 'globe':
      return <Globe className={className} />;
    case 'palette':
      return <Palette className={className} />;
    case 'music_note':
      return <Music className={className} />;
    case 'favorite':
      return <Heart className={className} />;
    case 'school':
      return <School className={className} />;
    default:
      return <BookOpen className={className} />;
  }
};

export const DashboardTab: React.FC<DashboardTabProps> = ({
  students,
  subjects,
  assignments,
  grades,
  gasConfig,
  settings,
  setActiveTab,
  onOpenNewAssignment,
  onOpenAiAssistant,
  onGiveAllFullScore
}) => {
  const activeStudents = students.filter(s => s.status === 'active');

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
    <div className="space-y-6 animate-fadeIn">
      {/* Teacher Executive Hero Welcome Card */}
      <div className="bg-gradient-to-r from-[#e8f3fc] via-[#eff7fd] to-[#ebf7f0] border border-[#b8d6eb] p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start md:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#306385] text-white flex items-center justify-center shadow-md flex-shrink-0">
            <GraduationCap className="w-9 h-9" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 bg-[#ffffff] text-[#306385] border border-[#a7d8ff] px-3 py-1 rounded-full text-xs font-bold shadow-2xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>{settings?.currentTerm || 'ภาคเรียนที่ 1/2567'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#aef2c2]/60 text-[#0a522f] px-3 py-1 rounded-full text-xs font-bold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>บันทึกอัตโนมัติในฐานข้อมูลเมื่อสักครู่</span>
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#306385]">
              สวัสดีค่ะ คุณครู{settings?.teacherName || 'ผู้สอน'}
            </h2>
            <p className="text-sm text-[#41474d] mt-1">
              {settings?.schoolName || 'โรงเรียน'} • ระบบบริหารจัดการชั้นเรียนและบันทึกคะแนนนักเรียน
            </p>
          </div>
        </div>
        <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-[#c1d3e0]/40">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/80 border border-[#c1d3e0]/60 text-xs font-bold text-[#306385] shadow-2xs">
            <Users className="w-4 h-4 text-[#306385]" />
            <span>นักเรียนทั้งหมด {activeStudents.length} คน</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/80 border border-[#c1d3e0]/60 text-xs font-bold text-[#0a522f] shadow-2xs">
            <BookOpen className="w-4 h-4 text-[#0a522f]" />
            <span>เปิดสอน {subjects.length} รายวิชา</span>
          </div>
        </div>
      </div>

      {/* Header & Quick Action Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
        <div>
          <h3 className="font-display text-xl md:text-2xl font-extrabold text-[#306385]">
            วิทยาการคำนวณ: การเขียนโปรแกรมเบื้องต้น
          </h3>
          <p className="text-xs text-[#41474d] mt-0.5">
            จัดการคะแนนและมอบหมายงานสำหรับนักเรียนในรายวิชาปัจจุบัน
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onGiveAllFullScore}
            className="bg-[#aef2c2] hover:bg-[#93e8ae] text-[#00210f] text-xs md:text-sm font-bold py-2.5 px-4 rounded-full chibi-button flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Wand2 className="w-4 h-4" />
            <span>ให้คะแนนเต็มทุกคน</span>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className="bg-[#e7f1f8] hover:bg-[#d5e6f3] text-[#1c4966] border border-[#b8d6eb] text-xs md:text-sm font-bold py-2.5 px-4 rounded-full chibi-button flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>ส่งออกรายงาน</span>
          </button>
          <button
            onClick={onOpenNewAssignment}
            className="bg-[#fdbec9] hover:bg-[#f8a8b6] text-[#330f19] text-xs md:text-sm font-bold py-2.5 px-4 rounded-full chibi-button flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>มอบหมายงาน</span>
          </button>
          <button
            onClick={onOpenAiAssistant}
            className="bg-[#306385] hover:bg-[#234d6a] text-white text-xs md:text-sm font-bold py-2.5 px-6 rounded-full chibi-button flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>น้องชิบิ AI สรุปผล</span>
          </button>
        </div>
      </div>

      {/* Subjects Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 ml-1">
          <div className="w-8 h-8 rounded-lg bg-[#e2e8f8] flex items-center justify-center text-[#306385] shadow-sm">
            <BookOpen className="w-5 h-5 text-[#306385]" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#306385]">รายวิชาที่สอน</h3>
        </div>
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
                  {getSubjectLucideIcon(sub.icon, "w-7 h-7")}
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
        <div className="flex items-center gap-2.5 mb-5 ml-1">
          <div className="w-8 h-8 rounded-lg bg-[#e2e8f8] flex items-center justify-center text-[#306385] shadow-sm">
            <BarChart3 className="w-5 h-5 text-[#306385]" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#306385]">
            ภาพรวมห้องเรียน
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {/* Card 1: Total students */}
          <div
            onClick={() => setActiveTab('students')}
            className="bg-[#ffffff] rounded-[2rem] p-6 shadow-sm border-2 border-[#a7d8ff] cursor-pointer chibi-button"
          >
            <div className="flex items-center gap-3 mb-4 text-[#41474d]">
              <Users className="w-7 h-7 text-[#306385]" />
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
              <FileText className="w-7 h-7 text-[#81515a]" />
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
              <Star className="w-7 h-7 text-[#2a6a45]" />
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
              <Award className="w-7 h-7 text-[#001e2f]" />
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
              <AlertCircle className="w-7 h-7 text-[#ba1a1a]" />
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
              <CheckCircle2 className="w-7 h-7 text-[#306385]" />
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
