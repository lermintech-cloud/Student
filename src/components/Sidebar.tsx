import React from 'react';
import { ActiveTab, SchoolSettings } from '../types.js';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: SchoolSettings;
  onOpenNewAssignment: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onOpenNewAssignment,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onResetData
}) => {
  const navItems: { id: ActiveTab; label: string; icon: string; badge?: string; hidden?: boolean }[] = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: 'dashboard' },
    { id: 'students', label: 'นักเรียน', icon: 'school' },
    { id: 'grading', label: 'การให้คะแนน', icon: 'grade' },
    { id: 'summary', label: 'สรุปผล', icon: 'grid_on' },
    { id: 'appScriptSync', label: 'เชื่อมต่อ Apps Script', icon: 'cloud_sync', badge: 'Sheets', hidden: settings.hideGasMenu },
    { id: 'githubExport', label: 'นำขึ้น GitHub & ส่งออก', icon: 'terminal', badge: 'Git', hidden: settings.hideGithubMenu },
    { id: 'aiAssistant', label: 'วิเคราะห์ AI น้องชิบิ', icon: 'auto_awesome', badge: 'AI', hidden: settings.hideAiMenu },
    { id: 'settings', label: 'การตั้งค่าระบบ', icon: 'settings_suggest', badge: 'ตั้งค่า' }
  ].filter(item => !item.hidden);

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-[#151c27]/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 p-6 shadow-[4px_0_24px_rgba(167,216,255,0.12)] z-50 bg-[#ffffff] border-r border-[#dce2f3]/60 flex flex-col transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo and Mascot */}
        <div className="mb-6 flex flex-col items-center relative">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden absolute top-0 right-0 p-1 rounded-full text-[#41474d] hover:bg-[#f0f3ff]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-4 border-[#e2e8f8] bg-[#e7eefe] shadow-sm">
            <img
              src={settings.mascotUrl}
              alt="School Mascot"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="font-display text-2xl text-[#306385] text-center font-bold">
            {settings.schoolName}
          </h1>
          <p className="text-xs text-[#41474d] mt-0.5">{settings.teacherRole || 'ระบบบันทึกคะแนน & AI สไตล์ Chibi'}</p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all chibi-button ${
                  isActive
                    ? 'bg-[#a7d8ff] text-[#001e2f] shadow-sm font-extrabold'
                    : 'text-[#41474d] hover:bg-[#f0f3ff] hover:text-[#306385]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0"
                    }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-[#306385] text-white'
                        : item.badge === 'Sheets'
                        ? 'bg-[#ebf7f0] text-[#0a522f]'
                        : item.badge === 'AI'
                        ? 'bg-[#fdbec9] text-[#330f19]'
                        : item.badge === 'ตั้งค่า'
                        ? 'bg-[#fff0cb] text-[#4d3a00]'
                        : 'bg-[#e2e8f8] text-[#41474d]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto pt-4 border-t border-[#dce2f3]/60 flex flex-col gap-3">
          <button
            onClick={() => {
              onOpenNewAssignment();
              setIsMobileMenuOpen(false);
            }}
            className="w-full bg-[#fdbec9] text-[#330f19] hover:bg-[#f4b6c1] transition-colors rounded-full py-3.5 text-sm font-bold flex justify-center items-center gap-2 shadow-[0_4px_16px_rgba(253,190,201,0.5)] chibi-button"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>มอบหมายงานใหม่</span>
          </button>

          <div className="flex items-center justify-between text-xs text-[#41474d] pt-1">
            <span>ข้อมูลบันทึกใน SQLite/JSON</span>
            <button
              onClick={onResetData}
              className="text-[#81515a] hover:underline hover:text-[#ba1a1a] flex items-center gap-1"
              title="รีเซ็ตกลับไปใช้ข้อมูลตัวอย่างเริ่มต้น"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span>รีเซ็ตตัวอย่าง</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
