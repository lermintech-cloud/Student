import React, { useState } from 'react';
import { SchoolSettings } from '../types.js';
import { FullDbState, saveDatabase } from '../services/api.js';

interface GitHubExportTabProps {
  settings: SchoolSettings;
  fullDb: FullDbState;
  onRestoreDb: (db: FullDbState) => void;
}

export const GitHubExportTab: React.FC<GitHubExportTabProps> = ({
  settings,
  fullDb,
  onRestoreDb
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [restoreMessage, setRestoreMessage] = useState('');

  const gitCommands = [
    {
      title: '1. เริ่มต้นคลัง Git ในโฟลเดอร์โปรเจกต์',
      cmd: 'git init'
    },
    {
      title: '2. เพิ่มไฟล์ทั้งหมดเข้าสู่ Staging',
      cmd: 'git add .'
    },
    {
      title: '3. บันทึกประวัติการเปลี่ยนแปลงแรก (Commit)',
      cmd: 'git commit -m "feat: initial commit Chibi Cute School Gradebook"'
    },
    {
      title: '4. เปลี่ยนชื่อ Branch หลักเป็น main',
      cmd: 'git branch -M main'
    },
    {
      title: '5. เชื่อมต่อกับ Repository บน GitHub (แทนที่ URL ด้วยของคุณ)',
      cmd: 'git remote add origin https://github.com/USERNAME/chibi-cute-school-gradebook.git'
    },
    {
      title: '6. อัปโหลดขึ้น GitHub',
      cmd: 'git push -u origin main'
    }
  ];

  const handleCopy = (cmdText: string, label: string) => {
    navigator.clipboard.writeText(cmdText);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadReadme = () => {
    const readmeContent = `# ${settings.schoolName} - Chibi Cute School Gradebook & AI Assistant 🌸
    
ระบบบันทึกคะแนนนักเรียนระดับประถมศึกษา สไตล์ Chibi น่ารัก เป็นมิตรกับคุณครูและนักเรียน พร้อมการวิเคราะห์ผลการเรียนด้วย AI และเชื่อมต่อฐานข้อมูล **Google Apps Script / Google Sheets**

## ✨ คุณสมบัติเด่น (Features)
- 📊 **แดชบอร์ดภาพรวมห้องเรียน:** แสดงสถิตินักเรียนทั้งหมด, คะแนนเฉลี่ย, นักเรียนดีเด่น และงานค้างส่งในรูปแบบ Bento Grid น่ารัก
- 👧 **ระบบจัดการนักเรียน (Students Management):** เพิ่ม ลบ แก้ไขรายชื่อนักเรียน พร้อมคำนำหน้า ชื่อเล่น รูปโปรไฟล์ และสถานะ
- ✍️ **การให้คะแนนรายวิชา (Gradebook & Assignments):** กรอกคะแนนรวดเร็ว กดปุ่มผ่านเกณฑ์ หรือให้คะแนนเต็มทุกคนในคลิกเดียว
- 🤖 **น้องชิบิ AI ผู้ช่วยครู (Gemini AI Engine):** วิเคราะห์ภาพรวมชั้นเรียน จุดเด่น จุดที่ควรพัฒนา และข้อความเสนอแนะรายบุคคล
- ☁️ **เชื่อมต่อ Google Apps Script & Google Sheets:** ซิงค์ข้อมูลขึ้น Google Sheets แบบเรียลไทม์ (Push / Pull / Auto-create 4 sheets)
- 💾 **ระบบสำรองข้อมูล (JSON Backup & Restore):** ดาวน์โหลดและกู้คืนฐานข้อมูล SQLite/JSON ได้ทันที

## 🚀 วิธีเปิดใช้งานระบบ (Development & Deployment)
\`\`\`bash
# 1. ติดตั้งไลบรารี
npm install

# 2. เปิดใช้งานระบบแบบ Full-Stack (Server + Client)
npm run dev

# 3. เซิร์ฟเวอร์จะทำงานที่พอร์ต 3000 -> เปิดเบราว์เซอร์ไปที่ http://localhost:3000
\`\`\`

## 📁 โครงสร้างโปรเจกต์ (Project Architecture)
- \`server.ts\` : เซิร์ฟเวอร์ Express + Vite Middleware + Google Apps Script Proxy + Gemini AI endpoint
- \`src/types.ts\` : โครงสร้างข้อมูลสถิติ นักเรียน งาน และการให้คะแนน
- \`src/data/initialData.ts\` : ข้อมูลตัวอย่างนักเรียนไทยโรงเรียนบ้านไร่
- \`src/data/gasScriptTemplate.ts\` : โค้ด Code.gs สำหรับติดตั้งใน Google Apps Script
- \`src/components/\` : คอมโพเนนต์หน้าต่าง UI สไตล์ Chibi Pastel น่ารัก
`;
    const blob = new Blob([readmeContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadBackup = () => {
    const jsonText = JSON.stringify(fullDb, null, 2);
    const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_school_db_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const content = event.target?.result as string;
        const parsed: FullDbState = JSON.parse(content);
        if (parsed && (parsed.students || parsed.grades)) {
          await saveDatabase(parsed);
          onRestoreDb(parsed);
          setRestoreMessage('🎉 กู้คืนฐานข้อมูลจากไฟล์ JSON สำเร็จเรียบร้อยแล้ว');
        } else {
          setRestoreMessage('❌ ไฟล์ JSON ไม่ถูกต้อง ไม่พบข้อมูลนักเรียน');
        }
      } catch (err: any) {
        setRestoreMessage('❌ อ่านไฟล์ JSON ผิดพลาด: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#e7eefe] text-[#306385] px-3.5 py-1 rounded-full text-xs font-bold mb-2">
            <span className="material-symbols-outlined text-sm">terminal</span>
            <span>GitHub Export &amp; Backup Suite</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#306385]">
            เตรียมนำขึ้น GitHub &amp; จัดการซอร์สโค้ด
          </h1>
          <p className="text-sm md:text-base text-[#41474d] mt-1">
            คำสั่ง Git พร้อมคัดลอก สำหรับนำโปรเจกต์ขึ้น GitHub และเครื่องมือสำรองฐานข้อมูล
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleDownloadReadme}
            className="bg-[#306385] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-sm chibi-button flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">description</span>
            <span>ดาวน์โหลด README.md</span>
          </button>
          <button
            onClick={handleDownloadBackup}
            className="bg-[#aef2c2] text-[#00210f] px-5 py-2.5 rounded-full text-xs font-bold shadow-sm chibi-button flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>ดาวน์โหลดไฟล์สำรองฐานข้อมูล (JSON)</span>
          </button>
        </div>
      </div>

      {/* Terminal Step Commands */}
      <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow border-t-4 border-[#306385] space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-[#151c27]">
            ขั้นตอนอัปโหลดขึ้น GitHub ทีละขั้นตอน (Terminal Commands)
          </h3>
          <span className="text-xs text-[#41474d]">คลิกที่ปุ่มเพื่อคัดลอกคำสั่ง</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gitCommands.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-[#f0f3ff] border border-[#dce2f3] flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-bold text-[#306385] mb-2">{item.title}</div>
                <div className="bg-[#151c27] text-[#ebf1ff] p-3 rounded-xl font-mono text-xs overflow-x-auto">
                  <code>{item.cmd}</code>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => handleCopy(item.cmd, `cmd-${index}`)}
                  className="bg-[#ffffff] text-[#306385] hover:bg-[#c9e6ff]/50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-[#dce2f3]"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedCmd === `cmd-${index}` ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedCmd === `cmd-${index}` ? 'คัดลอกแล้ว' : 'คัดลอกคำสั่ง'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Structure Card */}
      <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow border-t-4 border-[#fdbec9] space-y-4">
        <h3 className="font-display text-xl font-bold text-[#306385]">
          โครงสร้างไฟล์และสถาปัตยกรรม (Architecture Checklist)
        </h3>
        <p className="text-xs text-[#41474d]">
          โปรเจกต์นี้ได้รับการพัฒนาแบบ Modular แยกความรับผิดชอบชัดเจน พร้อมใช้งานบน Cloud Run / GitHub:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#dce2f3]">
            <div className="font-bold text-[#306385]">📄 server.ts</div>
            <div className="text-[#41474d] mt-1">
              Backend Express + API Routes + Google Apps Script Proxy
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#dce2f3]">
            <div className="font-bold text-[#306385]">📦 src/types.ts</div>
            <div className="text-[#41474d] mt-1">
              TypeScript Interfaces สำหรับ Student, Assignment, Grade, Settings
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#dce2f3]">
            <div className="font-bold text-[#306385]">💾 src/data/initialData.ts</div>
            <div className="text-[#41474d] mt-1">
              ข้อมูลนักเรียนไทยตัวอย่าง 10 คน พร้อมรายวิชาและคะแนนเบื้องต้น
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#dce2f3]">
            <div className="font-bold text-[#306385]">☁️ src/data/gasScriptTemplate.ts</div>
            <div className="text-[#41474d] mt-1">
              โค้ด Code.gs สำหรับสร้างชีตและตอบกลับแบบ JSON ใน Google Sheets
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#dce2f3]">
            <div className="font-bold text-[#306385]">🌐 src/services/api.ts</div>
            <div className="text-[#41474d] mt-1">
              ระบบเชื่อมต่อ API พร้อม Offline LocalStorage Fallback
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#dce2f3]">
            <div className="font-bold text-[#306385]">🌸 src/components/*</div>
            <div className="text-[#41474d] mt-1">
              หน้า Dashboard, Students, Grading, Summary, AppsScriptSync
            </div>
          </div>
        </div>
      </div>

      {/* Restore JSON Backup Card */}
      <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow border-t-4 border-[#aef2c2] space-y-4">
        <h3 className="font-display text-xl font-bold text-[#151c27]">
          อัปโหลดกู้คืนข้อมูลสำรอง (Restore from JSON file)
        </h3>
        <p className="text-xs text-[#41474d]">
          หากคุณครูเคยดาวน์โหลดไฟล์สำรองข้อมูลจากระบบนี้ สามารถนำไฟล์ JSON กลับมากู้คืนคะแนนได้ทันที:
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <label className="bg-[#aef2c2] text-[#00210f] px-6 py-2.5 rounded-full text-xs font-bold cursor-pointer hover:bg-[#aef2c2]/80 chibi-button shadow-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">upload_file</span>
            <span>เลือกไฟล์สำรองข้อมูล .json</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>
          {restoreMessage && (
            <span className="text-xs font-bold text-[#306385]">{restoreMessage}</span>
          )}
        </div>
      </div>
    </div>
  );
};
