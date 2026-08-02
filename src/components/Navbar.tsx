import React from 'react';
import { ActiveTab, SchoolSettings, AppScriptConfig } from '../types.js';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: SchoolSettings;
  gasConfig: AppScriptConfig;
  onOpenNewAssignment: () => void;
  onOpenAiAssistant: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  gasConfig,
  onOpenNewAssignment,
  onOpenAiAssistant,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const isGasConnected = Boolean(gasConfig.webAppUrl && gasConfig.webAppUrl.startsWith('https://script.google.com'));

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#ffffff] shadow-sm px-4 md:px-6 flex justify-between items-center lg:ml-72 border-b border-[#e2e8f8]">
      {/* Mobile left: toggle sidebar & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-full hover:bg-[#f0f3ff] text-[#306385] transition-colors"
          title="เมนูนำทาง"
        >
          <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-extrabold text-[#306385]">
            {settings.schoolName}
          </span>
          <span className="hidden sm:inline-block bg-[#e7eefe] text-[#306385] px-2.5 py-0.5 rounded-full text-xs font-semibold">
            ภาคเรียนที่ {settings.semester}/{settings.academicYear}
          </span>
        </div>
      </div>

      {/* Center: Title / Breadcrumb */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-sm font-semibold text-[#41474d]">
          {activeTab === 'dashboard' && 'แดชบอร์ดภาพรวมการเรียน'}
          {activeTab === 'students' && 'รายชื่อนักเรียนทั้งหมด'}
          {activeTab === 'grading' && 'บันทึกและให้คะแนนรายวิชา'}
          {activeTab === 'summary' && 'สรุปผลคะแนนและการประเมิน'}
          {activeTab === 'appScriptSync' && 'เชื่อมต่อฐานข้อมูล Google Apps Script (Google Sheets)'}
          {activeTab === 'githubExport' && 'เตรียมนำขึ้น GitHub & ส่งออกข้อมูล'}
          {activeTab === 'aiAssistant' && 'น้องชิบิ AI วิเคราะห์ผลการเรียน'}
          {activeTab === 'settings' && 'การตั้งค่าระบบและจัดการข้อมูลทั้งหมด'}
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Google Apps Script status badge */}
        <button
          onClick={() => setActiveTab('appScriptSync')}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all chibi-button ${
            isGasConnected
              ? 'bg-[#ebf7f0] text-[#0a522f] border border-[#93d5a7]'
              : 'bg-[#fff9e6] text-[#996300] border border-[#f4b6c1]'
          }`}
          title="ตั้งค่าเชื่อมต่อ Google Apps Script / Sheets"
        >
          <span className="material-symbols-outlined text-sm">
            {isGasConnected ? 'cloud_done' : 'cloud_off'}
          </span>
          <span>{isGasConnected ? 'Sheets เชื่อมต่อแล้ว' : 'ยังไม่เชื่อม Apps Script'}</span>
        </button>

        {/* AI Assistant button */}
        <button
          onClick={onOpenAiAssistant}
          className="flex items-center gap-1.5 bg-[#fdbec9] text-[#330f19] hover:bg-[#f4b6c1] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm chibi-button"
          title="น้องชิบิ AI ผู้ช่วยครู"
        >
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          <span className="hidden md:inline">น้องชิบิ AI</span>
        </button>

        {/* GitHub Export Quick button */}
        <button
          onClick={() => setActiveTab('githubExport')}
          className="hidden lg:flex items-center gap-1 bg-[#f0f3ff] text-[#306385] hover:bg-[#e2e8f8] px-3 py-1.5 rounded-full text-xs font-bold chibi-button border border-[#c1c7ce]/50"
          title="ส่งออกขึ้น GitHub & ซอร์สโค้ด"
        >
          <span className="material-symbols-outlined text-sm">code</span>
          <span>GitHub</span>
        </button>

        {/* Profile Avatar (Click to go to Settings) */}
        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2 pl-2 border-l border-[#dce2f3] hover:opacity-80 transition-opacity text-left cursor-pointer"
          title="คลิกเพื่อเปิดเมนูการตั้งค่าระบบและข้อมูลคุณครู"
        >
          <img
            src={settings.teacherAvatarUrl}
            alt={settings.teacherName}
            className="w-8 h-8 rounded-full border-2 border-[#a7d8ff] object-cover"
          />
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-[#151c27] leading-tight">
              {settings.teacherName}
            </div>
            <div className="text-[10px] text-[#306385] font-semibold">ตั้งค่าระบบ ⚙️</div>
          </div>
        </button>
      </div>
    </header>
  );
};
