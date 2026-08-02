import React, { useState, useEffect } from 'react';
import {
  SchoolSettings,
  Subject,
  AppScriptConfig,
  ActiveTab,
  Student,
  Assignment,
  GradeEntry
} from '../types.js';
import { FullDbState } from '../services/api.js';

interface SettingsTabProps {
  settings: SchoolSettings;
  onUpdateSettings: (newSettings: Partial<SchoolSettings>) => void;
  subjects: Subject[];
  onSaveSubject: (subject: Partial<Subject>) => void;
  onDeleteSubject: (subjectId: string) => void;
  gasConfig: AppScriptConfig;
  setActiveTab: (tab: ActiveTab) => void;
  onResetData?: () => void;
  onClearAllData: () => void;
  fullDb: {
    students: Student[];
    subjects: Subject[];
    assignments: Assignment[];
    grades: GradeEntry[];
    settings: SchoolSettings;
    gasConfig: AppScriptConfig;
  };
  onRestoreDb: (db: FullDbState) => void;
}

const PRESET_MASCOTS = [
  {
    name: 'มาสคอตโรงเรียนชิบิ (เริ่มต้น)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDeHsRpHO5LYMxtQsF3EdfPvXmGmxIPoy1yXJs6g9iiyLqCXYK2Xt8q1mAgndGgZsqzcKNF5sC3dVXIX9OXN_BL8oqfrcv8wYVt8PlCzztwQiGgqVjNybc6Z4AedSuKEjO7-_14Fbn5Du4Ln7DcUArkbl4QrsYaNA98_XgOAZOHH1JXGhqMNiyHux-77jNqqDmRqXs3xC27G8hNz2nrQe280JACrRS9gaEu8VdIJJvMDVz_NzzLUTf'
  },
  {
    name: 'นกฮูกนักปราชญ์',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ChibiOwl&backgroundColor=e2e8f8'
  },
  {
    name: 'หมีน้อยน่ารัก',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SchoolBear&backgroundColor=ffd9df'
  },
  {
    name: 'ดาวน้อยแห่งความรู้',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ChibiStar&backgroundColor=fff0cb'
  }
];

const PRESET_TEACHER_AVATARS = [
  {
    name: 'คุณครูชิบิ (เริ่มต้น)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAL5t_MWvFniyYyAgPM7lL7RtqInuWSeTJZVqgChQ5YaPMsKWxH2Az8gcdATP51fZgMNvD4Tzx-ynYWFP0D2u4HSCqiUn_dAgRmSFusmq56qf39j7fYZHvuYVzWZG0f-LmMx4UYLky8Wm6NGFfLRej_sOHb-oaN0_gCMJbJjQOUTU6P6YbUuM7H6cGeHF7CEONozlIeC-kTjGEW1dLI2G6jVMVSOzpV69HLyP4DOO-sXxrgByy-ZpvH'
  },
  {
    name: 'ครูผู้หญิงใจดี',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TeacherF&backgroundColor=ffd9df'
  },
  {
    name: 'ครูผู้ชายไอที',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TeacherM&backgroundColor=a7d8ff'
  },
  {
    name: 'ครูแว่นนักวิชาการ',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TeacherG&backgroundColor=ebf7f0'
  }
];

const PRESET_ICONS = [
  { id: 'computer', label: 'คอมพิวเตอร์' },
  { id: 'handyman', label: 'การงานอาชีพ' },
  { id: 'shield', label: 'จริยธรรม' },
  { id: 'calculate', label: 'คณิตศาสตร์' },
  { id: 'menu_book', label: 'ภาษาไทย/อังกฤษ' },
  { id: 'science', label: 'วิทยาศาสตร์' },
  { id: 'palette', label: 'ศิลปะ' },
  { id: 'sports_soccer', label: 'พลศึกษา' },
  { id: 'music_note', label: 'ดนตรี' }
];

const PRESET_COLORS = [
  { label: 'ฟ้าสดใส', value: 'bg-[#a7d8ff] text-[#001e2f] border-[#306385]' },
  { label: 'ชมพูชิบิ', value: 'bg-[#ffd9df] text-[#330f19] border-[#81515a]' },
  { label: 'เขียวมิ้นท์', value: 'bg-[#aef2c2] text-[#00210f] border-[#2a6a45]' },
  { label: 'เหลืองนวล', value: 'bg-[#fff0cb] text-[#4d3a00] border-[#996300]' },
  { label: 'ม่วงพาสเทล', value: 'bg-[#ebdff9] text-[#2c1448] border-[#5d3f82]' },
  { label: 'ส้มสดใส', value: 'bg-[#ffded2] text-[#3d1a08] border-[#8a4a2b]' }
];

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  subjects,
  onSaveSubject,
  onDeleteSubject,
  gasConfig,
  setActiveTab,
  onResetData,
  onClearAllData,
  fullDb,
  onRestoreDb
}) => {
  // Section switcher
  const [activeSection, setActiveSection] = useState<'profile' | 'subjects' | 'grades' | 'integrations' | 'backup'>('profile');

  // Form states for school & teacher
  const [formSettings, setFormSettings] = useState<SchoolSettings>({ ...settings });
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  useEffect(() => {
    setFormSettings({ ...settings });
  }, [settings]);

  // Subject Modal state
  const [editingSubject, setEditingSubject] = useState<Partial<Subject> | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formSettings);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  const handleOpenNewSubject = () => {
    setEditingSubject({
      code: '',
      name: '',
      classLevel: 'ป.1/1',
      defaultMaxScore: 10,
      icon: 'menu_book',
      color: PRESET_COLORS[0].value
    });
  };

  const handleSaveSubjectForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editingSubject.name || !editingSubject.code) return;
    onSaveSubject(editingSubject);
    setEditingSubject(null);
  };

  // Export JSON backup
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullDb, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('download', `chibi-gradebook-backup-${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON restore
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          if (confirm('คำเตือน: ข้อมูลจากไฟล์ JSON จะถูกนำเข้าแทนที่ข้อมูลในระบบปัจจุบัน คุณต้องการดำเนินการหรือไม่?')) {
            onRestoreDb(parsed);
            alert('นำเข้าข้อมูลสำรองเรียบร้อยแล้ว!');
          }
        }
      } catch (err) {
        alert('ไฟล์ JSON ไม่ถูกต้อง หรือโครงสร้างไม่รองรับ กรุณาตรวจสอบไฟล์');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Title Header */}
      <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#306385]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-2xl text-[#306385]">settings_suggest</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#306385]">
              การตั้งค่าและจัดการระบบทั้งหมด
            </h2>
          </div>
          <p className="text-sm text-[#41474d]">
            จัดการข้อมูลโรงเรียน วิชาที่สอน เกณฑ์การตัดเกรด สำรองข้อมูล และรีเซ็ตระบบ
          </p>
        </div>

        {/* Top Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('appScriptSync')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all chibi-button ${
              gasConfig.webAppUrl
                ? 'bg-[#ebf7f0] text-[#0a522f] border border-[#93d5a7]'
                : 'bg-[#fff9e6] text-[#996300] border border-[#f4b6c1]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {gasConfig.webAppUrl ? 'cloud_done' : 'cloud_off'}
            </span>
            <span>{gasConfig.webAppUrl ? 'Google Sheets เชื่อมต่อแล้ว' : 'ตั้งค่า Google Sheets'}</span>
          </button>
          <button
            onClick={() => setActiveTab('githubExport')}
            className="flex items-center gap-1.5 bg-[#f0f3ff] text-[#306385] hover:bg-[#e2e8f8] px-4 py-2 rounded-full text-xs font-bold chibi-button border border-[#c1c7ce]/50"
          >
            <span className="material-symbols-outlined text-sm">terminal</span>
            <span>นำขึ้น GitHub</span>
          </button>
        </div>
      </div>

      {/* Settings Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-[#f0f3ff] p-2 rounded-2xl border border-[#dce2f3]/80">
        <button
          onClick={() => setActiveSection('profile')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeSection === 'profile'
              ? 'bg-[#306385] text-white shadow-sm'
              : 'text-[#41474d] hover:bg-white/60 hover:text-[#306385]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">school</span>
          <span>ข้อมูลโรงเรียน & คุณครู</span>
        </button>
        <button
          onClick={() => setActiveSection('subjects')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeSection === 'subjects'
              ? 'bg-[#306385] text-white shadow-sm'
              : 'text-[#41474d] hover:bg-white/60 hover:text-[#306385]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">menu_book</span>
          <span>จัดการรายวิชา ({subjects.length})</span>
        </button>
        <button
          onClick={() => setActiveSection('grades')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeSection === 'grades'
              ? 'bg-[#306385] text-white shadow-sm'
              : 'text-[#41474d] hover:bg-white/60 hover:text-[#306385]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">grade</span>
          <span>เกณฑ์คะแนน & ตัดเกรด</span>
        </button>
        <button
          onClick={() => setActiveSection('integrations')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeSection === 'integrations'
              ? 'bg-[#306385] text-white shadow-sm'
              : 'text-[#41474d] hover:bg-white/60 hover:text-[#306385]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">extension</span>
          <span>จัดการหน้าเว็บ & เชื่อมต่อระบบ</span>
        </button>
        <button
          onClick={() => setActiveSection('backup')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeSection === 'backup'
              ? 'bg-[#306385] text-white shadow-sm'
              : 'text-[#41474d] hover:bg-white/60 hover:text-[#306385]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">storage</span>
          <span>สำรองข้อมูล & รีเซ็ตระบบ</span>
        </button>
      </div>

      {/* SECTION 1: SCHOOL & TEACHER PROFILE */}
      {activeSection === 'profile' && (
        <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow space-y-6">
          <div className="flex items-center justify-between border-b border-[#dce2f3] pb-4">
            <div>
              <h3 className="font-display text-xl font-bold text-[#306385]">
                🏫 ข้อมูลทั่วไปของโรงเรียนและคุณครูผู้สอน
              </h3>
              <p className="text-xs text-[#41474d]">
                ข้อมูลนี้จะแสดงในส่วนหัวเว็บ รายงานสรุปผล และไฟล์ที่ส่งออกทั้งหมด
              </p>
            </div>
            {isSavedAlert && (
              <span className="bg-[#ebf7f0] text-[#0a522f] px-4 py-1.5 rounded-full text-xs font-bold border border-[#aef2c2] animate-bounce">
                ✓ บันทึกการตั้งค่าเรียบร้อยแล้ว
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* School Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#306385]">
                  ชื่อโรงเรียน <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  value={formSettings.schoolName}
                  onChange={e => setFormSettings({ ...formSettings, schoolName: e.target.value })}
                  className="w-full bg-[#f9f9ff] border border-[#dce2f3] rounded-2xl px-4 py-3 text-sm font-semibold text-[#151c27] focus:outline-none focus:border-[#306385]"
                  placeholder="เช่น โรงเรียนบ้านไร่"
                  required
                />
              </div>

              {/* Teacher Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#306385]">
                  ชื่อคุณครูผู้สอน / ครูประจำชั้น <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  value={formSettings.teacherName}
                  onChange={e => setFormSettings({ ...formSettings, teacherName: e.target.value })}
                  className="w-full bg-[#f9f9ff] border border-[#dce2f3] rounded-2xl px-4 py-3 text-sm font-semibold text-[#151c27] focus:outline-none focus:border-[#306385]"
                  placeholder="เช่น ครูน้ำฝน ใจดี"
                  required
                />
              </div>

              {/* Teacher Role / Position */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#306385]">
                  ตำแหน่ง / ชั้นที่ปรึกษา (แสดงใต้ชื่อคุณครู)
                </label>
                <input
                  type="text"
                  value={formSettings.teacherRole || ''}
                  onChange={e => setFormSettings({ ...formSettings, teacherRole: e.target.value })}
                  className="w-full bg-[#f9f9ff] border border-[#dce2f3] rounded-2xl px-4 py-3 text-sm font-semibold text-[#151c27] focus:outline-none focus:border-[#306385]"
                  placeholder="เช่น ครูประจำชั้น ป.1/1 หรือ ครูหัวหน้าสายชั้น"
                />
              </div>

              {/* Teacher Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#306385]">
                  อีเมลคุณครู (บันทึกเพื่อใช้เชื่อมต่อ Sheets / ส่งออก)
                </label>
                <input
                  type="email"
                  value={formSettings.teacherEmail || ''}
                  onChange={e => setFormSettings({ ...formSettings, teacherEmail: e.target.value })}
                  className="w-full bg-[#f9f9ff] border border-[#dce2f3] rounded-2xl px-4 py-3 text-sm font-semibold text-[#151c27] focus:outline-none focus:border-[#306385]"
                  placeholder="เช่น teacher@school.ac.th"
                />
              </div>

              {/* Academic Year */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#306385]">ปีการศึกษา (พ.ศ.)</label>
                <input
                  type="text"
                  value={formSettings.academicYear}
                  onChange={e => setFormSettings({ ...formSettings, academicYear: e.target.value })}
                  className="w-full bg-[#f9f9ff] border border-[#dce2f3] rounded-2xl px-4 py-3 text-sm font-semibold text-[#151c27] focus:outline-none focus:border-[#306385]"
                  placeholder="เช่น 2568"
                />
              </div>

              {/* Semester */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#306385]">ภาคเรียนที่</label>
                <select
                  value={formSettings.semester}
                  onChange={e => setFormSettings({ ...formSettings, semester: e.target.value })}
                  className="w-full bg-[#f9f9ff] border border-[#dce2f3] rounded-2xl px-4 py-3 text-sm font-semibold text-[#151c27] focus:outline-none focus:border-[#306385]"
                >
                  <option value="1">ภาคเรียนที่ 1</option>
                  <option value="2">ภาคเรียนที่ 2</option>
                  <option value="3">ภาคเรียนฤดูร้อน</option>
                </select>
              </div>
            </div>

            {/* Mascot URL and Presets */}
            <div className="space-y-3 pt-2 border-t border-[#f0f3ff]">
              <label className="block text-xs font-bold text-[#306385]">
                รูปมาสคอตโรงเรียน (URL หรือเลือกจากรูปน่ารักด้านล่าง)
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-[#e2e8f8] bg-[#e7eefe] shadow-sm shrink-0">
                  <img
                    src={formSettings.mascotUrl}
                    alt="Mascot Preview"
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src = PRESET_MASCOTS[0].url;
                    }}
                  />
                </div>
                <input
                  type="text"
                  value={formSettings.mascotUrl}
                  onChange={e => setFormSettings({ ...formSettings, mascotUrl: e.target.value })}
                  className="flex-1 bg-[#f9f9ff] border border-[#dce2f3] rounded-2xl px-4 py-3 text-xs font-mono text-[#41474d] focus:outline-none focus:border-[#306385]"
                  placeholder="วาง URL รูปมาสคอต"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#41474d] font-semibold">เลือกมาสคอตน่ารัก:</span>
                {PRESET_MASCOTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormSettings({ ...formSettings, mascotUrl: item.url })}
                    className="px-3 py-1 rounded-full bg-[#f0f3ff] hover:bg-[#e2e8f8] text-xs font-bold text-[#306385] border border-[#dce2f3] transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Teacher Avatar URL and Presets */}
            <div className="space-y-3 pt-2 border-t border-[#f0f3ff]">
              <label className="block text-xs font-bold text-[#306385]">
                รูปประจำตัวคุณครู (URL หรือเลือกจากตัวอย่างด้านล่าง)
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-[#e2e8f8] bg-[#e7eefe] shadow-sm shrink-0">
                  <img
                    src={formSettings.teacherAvatarUrl}
                    alt="Teacher Avatar Preview"
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src = PRESET_TEACHER_AVATARS[0].url;
                    }}
                  />
                </div>
                <input
                  type="text"
                  value={formSettings.teacherAvatarUrl}
                  onChange={e => setFormSettings({ ...formSettings, teacherAvatarUrl: e.target.value })}
                  className="flex-1 bg-[#f9f9ff] border border-[#dce2f3] rounded-2xl px-4 py-3 text-xs font-mono text-[#41474d] focus:outline-none focus:border-[#306385]"
                  placeholder="วาง URL รูปประจำตัวคุณครู"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#41474d] font-semibold">เลือกรูปครูน่ารัก:</span>
                {PRESET_TEACHER_AVATARS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormSettings({ ...formSettings, teacherAvatarUrl: item.url })}
                    className="px-3 py-1 rounded-full bg-[#f0f3ff] hover:bg-[#e2e8f8] text-xs font-bold text-[#306385] border border-[#dce2f3] transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="bg-[#306385] text-white hover:bg-[#204e6c] px-8 py-3.5 rounded-full text-sm font-bold shadow-md transition-all chibi-button flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                <span>บันทึกการตั้งค่าโรงเรียน</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: SUBJECTS MANAGEMENT */}
      {activeSection === 'subjects' && (
        <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dce2f3] pb-4">
            <div>
              <h3 className="font-display text-xl font-bold text-[#306385]">
                📚 จัดการรายวิชาและชั้นเรียนทั้งหมด ({subjects.length} วิชา)
              </h3>
              <p className="text-xs text-[#41474d]">
                เพิ่ม ลบ หรือแก้ไขชื่อวิชา รหัสวิชา ไอคอน และธีมสีที่ใช้ในระบบให้คะแนน
              </p>
            </div>
            <button
              onClick={handleOpenNewSubject}
              className="bg-[#fdbec9] text-[#330f19] hover:bg-[#f4b6c1] px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all chibi-button flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>เพิ่มรายวิชาใหม่</span>
            </button>
          </div>

          {/* Subject Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(sub => (
              <div
                key={sub.id}
                className="bg-[#f9f9ff] border border-[#dce2f3] rounded-2xl p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-bold ${sub.color}`}>
                      <span className="material-symbols-outlined text-2xl">{sub.icon}</span>
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-[#306385] bg-[#e2e8f8] px-2 py-0.5 rounded-full">
                        {sub.code}
                      </span>
                      <h4 className="font-bold text-[#151c27] text-base mt-1 leading-snug">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-[#41474d]">ระดับชั้น: {sub.classLevel}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#e2e8f8] flex items-center justify-between text-xs">
                  <span className="text-[#41474d] font-semibold">
                    คะแนนเต็มเริ่มต้น: <strong className="text-[#306385]">{sub.defaultMaxScore}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingSubject({ ...sub })}
                      className="text-[#306385] hover:text-[#204e6c] font-bold px-2 py-1 rounded-lg hover:bg-[#e2e8f8]/50 transition-colors"
                    >
                      แก้ไข
                    </button>
                    {subjects.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการลบรายวิชา "${sub.name}" ใช่หรือไม่?`)) {
                            onDeleteSubject(sub.id);
                          }
                        }}
                        className="text-[#81515a] hover:text-[#ba1a1a] font-bold px-2 py-1 rounded-lg hover:bg-[#ffd9df]/50 transition-colors"
                      >
                        ลบ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit / New Subject Modal */}
          {editingSubject && (
            <div className="fixed inset-0 bg-[#151c27]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 max-w-lg w-full chibi-shadow border-4 border-[#a7d8ff] space-y-6 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-[#dce2f3] pb-3">
                  <h4 className="font-display text-xl font-bold text-[#306385]">
                    {editingSubject.id ? '✏️ แก้ไขรายวิชา' : '✨ เพิ่มรายวิชาใหม่'}
                  </h4>
                  <button
                    onClick={() => setEditingSubject(null)}
                    className="p-1 rounded-full text-[#41474d] hover:bg-[#f0f3ff]"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={handleSaveSubjectForm} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#306385] mb-1">
                        รหัสวิชา (เช่น COM-101) <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingSubject.code || ''}
                        onChange={e => setEditingSubject({ ...editingSubject, code: e.target.value })}
                        className="w-full bg-[#f9f9ff] border border-[#dce2f3] rounded-2xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#306385]"
                        placeholder="COM-101"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#306385] mb-1">ระดับชั้น</label>
                      <input
                        type="text"
                        value={editingSubject.classLevel || 'ป.1/1'}
                        onChange={e => setEditingSubject({ ...editingSubject, classLevel: e.target.value })}
                        className="w-full bg-[#f9f9ff] border border-[#dce2f3] rounded-2xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#306385]"
                        placeholder="ป.1/1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#306385] mb-1">
                      ชื่อรายวิชา <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingSubject.name || ''}
                      onChange={e => setEditingSubject({ ...editingSubject, name: e.target.value })}
                      className="w-full bg-[#f9f9ff] border border-[#dce2f3] rounded-2xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#306385]"
                      placeholder="เช่น วิทยาการคำนวณ (คอมพิวเตอร์)"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#306385] mb-1">คะแนนเต็มเริ่มต้นต่อชิ้นงาน</label>
                    <input
                      type="number"
                      value={editingSubject.defaultMaxScore || 10}
                      onChange={e => setEditingSubject({ ...editingSubject, defaultMaxScore: Number(e.target.value) })}
                      className="w-full bg-[#f9f9ff] border border-[#dce2f3] rounded-2xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#306385]"
                      min="1"
                    />
                  </div>

                  {/* Icon selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#306385] mb-1">เลือกไอคอนสัญลักษณ์</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_ICONS.map(ic => (
                        <button
                          key={ic.id}
                          type="button"
                          onClick={() => setEditingSubject({ ...editingSubject, icon: ic.id })}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold border transition-all ${
                            editingSubject.icon === ic.id
                              ? 'bg-[#a7d8ff] text-[#001e2f] border-[#306385]'
                              : 'bg-[#f0f3ff] text-[#41474d] border-transparent hover:bg-[#e2e8f8]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">{ic.id}</span>
                          <span>{ic.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#306385] mb-1">เลือกสีธีมประจำวิชา</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_COLORS.map((col, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditingSubject({ ...editingSubject, color: col.value })}
                          className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between ${col.value} ${
                            editingSubject.color === col.value ? 'ring-2 ring-[#306385] font-extrabold' : 'opacity-80'
                          }`}
                        >
                          <span>{col.label}</span>
                          {editingSubject.color === col.value && (
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t border-[#dce2f3]">
                    <button
                      type="button"
                      onClick={() => setEditingSubject(null)}
                      className="px-5 py-2.5 rounded-full text-xs font-bold text-[#41474d] hover:bg-[#f0f3ff]"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="bg-[#306385] text-white hover:bg-[#204e6c] px-6 py-2.5 rounded-full text-xs font-bold shadow-sm chibi-button"
                    >
                      {editingSubject.id ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างรายวิชา'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: GRADE THRESHOLDS */}
      {activeSection === 'grades' && (
        <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow space-y-6">
          <div className="border-b border-[#dce2f3] pb-4">
            <h3 className="font-display text-xl font-bold text-[#306385]">
              📊 เกณฑ์การตัดเกรดและระดับคะแนน (Grade Thresholds)
            </h3>
            <p className="text-xs text-[#41474d]">
              ระบบใช้เกณฑ์เปอร์เซ็นต์มาตรฐานระดับการศึกษาขั้นพื้นฐานในการคำนวณผลเกรดอัตโนมัติในหน้ารายงานสรุปผล
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { grade: '4', letter: 'A', percent: '80% - 100%', label: 'ดีเยี่ยม (Excellent)', color: 'bg-[#ebf7f0] text-[#0a522f] border-[#2a6a45]' },
              { grade: '3.5', letter: 'B+', percent: '75% - 79%', label: 'ดีมาก (Very Good)', color: 'bg-[#ebf7f0] text-[#0a522f] border-[#2a6a45]' },
              { grade: '3', letter: 'B', percent: '70% - 74%', label: 'ดี (Good)', color: 'bg-[#e7eefe] text-[#306385] border-[#306385]' },
              { grade: '2.5', letter: 'C+', percent: '65% - 69%', label: 'ค่อนข้างดี (Fairly Good)', color: 'bg-[#e7eefe] text-[#306385] border-[#306385]' },
              { grade: '2', letter: 'C', percent: '60% - 64%', label: 'ปานกลาง (Fair)', color: 'bg-[#fff9e6] text-[#996300] border-[#f4b6c1]' },
              { grade: '1.5', letter: 'D+', percent: '55% - 59%', label: 'พอใช้ (Poor)', color: 'bg-[#fff9e6] text-[#996300] border-[#f4b6c1]' },
              { grade: '1', letter: 'D', percent: '50% - 54%', label: 'ผ่านเกณฑ์ขั้นต่ำ (Pass)', color: 'bg-[#ffd9df] text-[#81515a] border-[#81515a]' },
              { grade: '0', letter: 'F / ร', percent: '0% - 49%', label: 'ไม่ผ่านเกณฑ์ (Fail)', color: 'bg-[#ffd9df] text-[#ba1a1a] border-[#ba1a1a]' }
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl border bg-[#f9f9ff] border-[#dce2f3]"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border ${item.color}`}>
                    {item.grade}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#151c27]">
                      เกรด {item.grade} (เกรด {item.letter})
                    </div>
                    <div className="text-xs text-[#41474d]">{item.label}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-extrabold text-[#306385] bg-[#e2e8f8] px-3 py-1 rounded-full">
                    {item.percent}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[#e7eefe] border border-[#a7d8ff] flex items-start gap-3">
            <span className="material-symbols-outlined text-[#306385] text-2xl">lightbulb</span>
            <p className="text-xs text-[#151c27] leading-relaxed">
              <strong>คำแนะนำ:</strong> เมื่อคุณครูบันทึกคะแนนงานในแต่ละวิชา ระบบจะคำนวณเปอร์เซ็นต์รวมของนักเรียนแต่ละคน และแปลงเป็นเกรด 4, 3.5, 3 ... โดยอัตโนมัติที่หน้า <strong className="text-[#306385]">"สรุปผล"</strong> และสามารถเชื่อมต่อส่งออกไปยัง <strong className="text-[#0a522f]">Google Sheets</strong> ได้อีกด้วย!
            </p>
          </div>
        </div>
      )}

      {/* SECTION 4: DATABASE BACKUP, RESTORE & RESET */}
      {activeSection === 'backup' && (
        <div className="space-y-6">
          {/* Backup & Restore Card */}
          <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow space-y-6">
            <div className="border-b border-[#dce2f3] pb-4">
              <h3 className="font-display text-xl font-bold text-[#306385]">
                💾 สำรองข้อมูลและนำเข้าข้อมูลระบบ (Backup & Restore JSON)
              </h3>
              <p className="text-xs text-[#41474d]">
                ข้อมูลนักเรียน งาน และคะแนนทั้งหมดในโปรเจกต์นี้ สามารถดาวน์โหลดเป็นไฟล์ .json เก็บไว้ในคอมพิวเตอร์ของคุณครูได้ตลอดเวลา
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Backup Box */}
              <div className="p-6 rounded-2xl bg-[#f0f3ff] border border-[#a7d8ff] space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#306385] font-bold text-base mb-1">
                    <span className="material-symbols-outlined text-xl">download</span>
                    <span>ดาวน์โหลดไฟล์สำรองข้อมูล (Export Backup)</span>
                  </div>
                  <p className="text-xs text-[#41474d] leading-relaxed">
                    สร้างไฟล์ .json ที่รวมข้อมูลนักเรียนทั้ง {fullDb.students.length} คน, งาน {fullDb.assignments.length} ชิ้น และคะแนนทั้งหมด เหมาะสำหรับย้ายเครื่องหรือเก็บเป็นหลักฐาน
                  </p>
                </div>
                <button
                  onClick={handleExportJson}
                  className="w-full bg-[#306385] text-white hover:bg-[#204e6c] py-3 rounded-full text-xs font-bold shadow-sm transition-all chibi-button flex justify-center items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">download_for_offline</span>
                  <span>ดาวน์โหลดไฟล์ Backup JSON</span>
                </button>
              </div>

              {/* Import Restore Box */}
              <div className="p-6 rounded-2xl bg-[#ebf7f0] border border-[#93d5a7] space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#0a522f] font-bold text-base mb-1">
                    <span className="material-symbols-outlined text-xl">upload_file</span>
                    <span>นำเข้าข้อมูลจากไฟล์สำรอง (Import Restore)</span>
                  </div>
                  <p className="text-xs text-[#41474d] leading-relaxed">
                    เลือกไฟล์ .json ที่เคยดาวน์โหลดไว้ เพื่อกู้คืนข้อมูลนักเรียน งาน และการตั้งค่ากลับมาใช้งานทันที
                  </p>
                </div>
                <label className="w-full bg-[#0a522f] text-white hover:bg-[#073b22] py-3 rounded-full text-xs font-bold shadow-sm transition-all chibi-button flex justify-center items-center gap-2 cursor-pointer">
                  <span className="material-symbols-outlined text-base">folder_open</span>
                  <span>เลือกไฟล์ JSON เพื่อนำเข้า</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Reset & Clear All Card */}
          <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow border-t-4 border-[#ba1a1a] space-y-6">
            <div className="border-b border-[#dce2f3] pb-4">
              <h3 className="font-display text-xl font-bold text-[#ba1a1a] flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                <span>จัดการข้อมูลเริ่มต้นและล้างข้อมูล (System Reset)</span>
              </h3>
              <p className="text-xs text-[#41474d]">
                ตัวเลือกสำหรับเริ่มปีการศึกษาใหม่ หรือต้องการล้างข้อมูลคะแนนและนักเรียนทั้งหมด
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Auto Save & Security Info */}
              <div className="p-5 rounded-2xl bg-[#ebf7f0] border border-[#93d5a7] space-y-3">
                <div className="font-bold text-sm text-[#0a522f] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">verified_user</span>
                  <span>ระบบบันทึกข้อมูลอัตโนมัติ (Auto-Save Active)</span>
                </div>
                <p className="text-xs text-[#00210f] leading-relaxed">
                  ข้อมูลการให้คะแนนและรายชื่อนักเรียนจะถูกบันทึกไว้ในเบราว์เซอร์อัตโนมัติทุกครั้งที่มีการแก้ไข สามารถส่งออกสำรองเป็นไฟล์ JSON หรือ Excel ได้ทุกเมื่อค่ะ
                </p>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0a522f] pt-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>ปลอดภัย ข้อมูลไม่สูญหาย</span>
                </div>
              </div>

              {/* Clear All Students & Grades */}
              <div className="p-5 rounded-2xl bg-[#fff9fa] border-2 border-[#ba1a1a] space-y-3">
                <div className="font-bold text-sm text-[#ba1a1a] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">delete_forever</span>
                  <span>ล้างข้อมูลนักเรียนและคะแนนทั้งหมด (Clear All)</span>
                </div>
                <p className="text-xs text-[#41474d] leading-relaxed">
                  ลบรายชื่อนักเรียน งาน และคะแนนทั้งหมดให้ว่างเปล่า (ชื่อโรงเรียนและวิชาที่สอนจะยังอยู่ครบ เพื่อเริ่มห้องใหม่)
                </p>
                <button
                  onClick={onClearAllData}
                  className="w-full bg-[#ba1a1a] text-white hover:bg-[#93000a] py-2.5 rounded-xl text-xs font-bold transition-colors"
                >
                  ล้างข้อมูลนักเรียนและคะแนน (เริ่มห้องใหม่)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: WEB PAGE MANAGEMENT & INTEGRATIONS */}
      {activeSection === 'integrations' && (
        <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow space-y-8">
          <div className="border-b border-[#dce2f3] pb-4">
            <h3 className="font-display text-xl font-bold text-[#306385] flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">tune</span>
              <span>🎛️ จัดการการแสดงผลหน้าเว็บ & เชื่อมต่อระบบ (AppSheet & GitHub)</span>
            </h3>
            <p className="text-xs text-[#41474d] mt-1">
              ปรับแต่งซ่อน/แสดงเมนูที่ไม่จำเป็นเพื่อไม่ให้หน้าหลักรก หรือกดเข้าใช้งานระบบเชื่อมต่อต่างๆ จากที่นี่ได้โดยตรง
            </p>
          </div>

          {/* Part 1: Menu Visibility Controls */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#151c27] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-[#306385]">visibility</span>
              <span>ตั้งค่าซ่อน/แสดงเมนูนำทางในหน้าหลัก</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hide GAS Menu Toggle */}
              <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#dce2f3] flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-[#151c27]">
                    ซ่อนเมนู "เชื่อมต่อ Apps Script (Sheets)"
                  </div>
                  <div className="text-xs text-[#41474d]">
                    ย้ายจากเมนูด้านซ้ายมาไว้ในการตั้งค่า เพื่อไม่ให้เมนูหลักรก
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newVal = !settings.hideGasMenu;
                    onUpdateSettings({ hideGasMenu: newVal });
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                    settings.hideGasMenu
                      ? 'bg-[#306385] text-white shadow-xs'
                      : 'bg-[#e2e8f8] text-[#41474d]'
                  }`}
                >
                  {settings.hideGasMenu ? '✅ ซ่อนอยู่ (สะอาดตา)' : '👁️ แสดงในแถบซ้าย'}
                </button>
              </div>

              {/* Hide GitHub Menu Toggle */}
              <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#dce2f3] flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-[#151c27]">
                    ซ่อนเมนู "นำขึ้น GitHub & ส่งออก"
                  </div>
                  <div className="text-xs text-[#41474d]">
                    ย้ายจากเมนูด้านซ้ายมาไว้ในการตั้งค่า เพื่อไม่ให้เมนูหลักรก
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newVal = !settings.hideGithubMenu;
                    onUpdateSettings({ hideGithubMenu: newVal });
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                    settings.hideGithubMenu
                      ? 'bg-[#306385] text-white shadow-xs'
                      : 'bg-[#e2e8f8] text-[#41474d]'
                  }`}
                >
                  {settings.hideGithubMenu ? '✅ ซ่อนอยู่ (สะอาดตา)' : '👁️ แสดงในแถบซ้าย'}
                </button>
              </div>

              {/* Show Quick Buttons in Top Navbar Toggle */}
              <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#dce2f3] flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-[#151c27]">
                    แสดงปุ่มทางลัดในแถบด้านบน (Top Navbar)
                  </div>
                  <div className="text-xs text-[#41474d]">
                    แสดงปุ่มสถานะ Sheets และปุ่ม GitHub ด้านบนสุด
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newVal = !settings.showQuickButtonsInNavbar;
                    onUpdateSettings({ showQuickButtonsInNavbar: newVal });
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                    settings.showQuickButtonsInNavbar
                      ? 'bg-[#0a522f] text-white shadow-xs'
                      : 'bg-[#e2e8f8] text-[#41474d]'
                  }`}
                >
                  {settings.showQuickButtonsInNavbar ? '✓ แสดงปุ่มด้านบน' : '🔇 ปิด (ให้สะอาดที่สุด)'}
                </button>
              </div>

              {/* Hide AI Assistant Menu Toggle */}
              <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#dce2f3] flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-[#151c27]">
                    ซ่อนเมนู "วิเคราะห์ AI น้องชิบิ"
                  </div>
                  <div className="text-xs text-[#41474d]">
                    สำหรับครูที่ต้องการให้หน้าระบบมินิมอลและเรียบง่ายที่สุด
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newVal = !settings.hideAiMenu;
                    onUpdateSettings({ hideAiMenu: newVal });
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                    settings.hideAiMenu
                      ? 'bg-[#306385] text-white shadow-xs'
                      : 'bg-[#e2e8f8] text-[#41474d]'
                  }`}
                >
                  {settings.hideAiMenu ? '✅ ซ่อนอยู่' : '👁️ แสดงอยู่'}
                </button>
              </div>
            </div>
          </div>

          {/* Part 2: Direct Integrations Access */}
          <div className="space-y-4 pt-4 border-t border-[#f0f3ff]">
            <h4 className="text-sm font-bold text-[#151c27] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-[#306385]">hub</span>
              <span>ศูนย์การเชื่อมต่อและส่งออกข้อมูล (Integrations Hub)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AppScript / Sheets Card */}
              <div className="p-5 rounded-2xl bg-[#ebf7f0] border border-[#93d5a7] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#0a522f] text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined">table_view</span>
                    <span>Google Sheets & Apps Script (AppSheet API)</span>
                  </span>
                  <span className="bg-white text-[#0a522f] px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#93d5a7]">
                    {gasConfig.webAppUrl ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}
                  </span>
                </div>
                <p className="text-xs text-[#00210f] leading-relaxed">
                  เชื่อมต่อฐานข้อมูล Google Sheets แบบเรียลไทม์ผ่าน Apps Script รองรับการซิงค์กับ AppSheet โดยไม่ต้องใช้คีย์ลับ
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('appScriptSync')}
                  className="w-full bg-[#0a522f] text-white hover:bg-[#1a7f4c] py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  <span>เปิดหน้าตั้งค่าการเชื่อมต่อ Google Sheets</span>
                </button>
              </div>

              {/* GitHub Export Card */}
              <div className="p-5 rounded-2xl bg-[#f0f3ff] border border-[#a7d8ff] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#306385] text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined">terminal</span>
                    <span>นำขึ้น GitHub & ส่งออกซอร์สโค้ด</span>
                  </span>
                  <span className="bg-white text-[#306385] px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#a7d8ff]">
                    GitHub Actions ✅
                  </span>
                </div>
                <p className="text-xs text-[#151c27] leading-relaxed">
                  ดาวน์โหลดไฟล์โปรเจกต์ นำขึ้น GitHub Pages ด้วย GitHub Actions พร้อมคู่มือแก้ปัญหาหน้าขาวสมบูรณ์แบบ
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('githubExport')}
                  className="w-full bg-[#306385] text-white hover:bg-[#1e4863] py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  <span>เปิดหน้าคู่มือและส่งออก GitHub</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
