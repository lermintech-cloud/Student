import React, { useState } from 'react';
import { AppScriptConfig } from '../types.js';
import { GAS_SCRIPT_CODE } from '../data/gasScriptTemplate.js';
import { syncWithAppsScript, FullDbState } from '../services/api.js';

interface AppScriptSyncTabProps {
  gasConfig: AppScriptConfig;
  onUpdateGasConfig: (config: Partial<AppScriptConfig>) => void;
  onDataPulledFromGas: (db: FullDbState) => void;
  fullDb?: FullDbState;
}

export const AppScriptSyncTab: React.FC<AppScriptSyncTabProps> = ({
  gasConfig,
  onUpdateGasConfig,
  onDataPulledFromGas,
  fullDb
}) => {
  const [urlInput, setUrlInput] = useState(gasConfig.webAppUrl || '');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'pushing' | 'pulling' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState<'sync' | 'code' | 'guide'>('sync');

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGasConfig({ webAppUrl: urlInput.trim() });
    setSyncStatus('success');
    setStatusMessage('บันทึก Web App URL ในระบบเรียบร้อยแล้ว');
  };

  const handleTestAndConnect = async () => {
    const targetUrl = urlInput.trim() || gasConfig.webAppUrl;
    if (!targetUrl) {
      setSyncStatus('error');
      setStatusMessage('กรุณาวาง Web App URL ก่อนกดทดสอบเชื่อมต่อ');
      return;
    }
    onUpdateGasConfig({ webAppUrl: targetUrl });
    setSyncStatus('pushing');
    setStatusMessage('🔄 กำลังเชื่อมต่อและสร้าง 4 ตาราง (Students, Subjects, Assignments, Grades) ใน Google Sheets...');
    const res = await syncWithAppsScript(targetUrl, 'push', fullDb);
    if (res.success) {
      setSyncStatus('success');
      setStatusMessage('🎉 เชื่อมต่อสำเร็จ! สร้างตารางทั้ง 4 และส่งข้อมูลนักเรียนขึ้น Google Sheets เรียบร้อยแล้ว!');
      onUpdateGasConfig({ lastSyncedAt: new Date().toISOString() });
    } else {
      setSyncStatus('error');
      setStatusMessage(res.error || 'เชื่อมต่อไม่สำเร็จ โปรดตรวจสอบสิทธิ์ Who has access ให้เป็น "Anyone (ทุกคน)"');
    }
  };

  const handlePushToSheets = async () => {
    const targetUrl = urlInput.trim() || gasConfig.webAppUrl;
    if (!targetUrl) {
      setSyncStatus('error');
      setStatusMessage('กรุณาระบุ Web App URL ก่อนกดซิงค์');
      return;
    }
    setSyncStatus('pushing');
    setStatusMessage('กำลังส่งข้อมูลขึ้น Google Sheets... (กรุณารอสักครู่)');
    const res = await syncWithAppsScript(targetUrl, 'push', fullDb);
    if (res.success) {
      setSyncStatus('success');
      setStatusMessage('🎉 ส่งข้อมูลบันทึกใน Google Sheets (4 ชีต) เรียบร้อยแล้ว!');
      onUpdateGasConfig({ lastSyncedAt: new Date().toISOString() });
    } else {
      setSyncStatus('error');
      setStatusMessage(res.error || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    }
  };

  const handlePullFromSheets = async () => {
    const targetUrl = urlInput.trim() || gasConfig.webAppUrl;
    if (!targetUrl) {
      setSyncStatus('error');
      setStatusMessage('กรุณาระบุ Web App URL ก่อนกดดึงข้อมูล');
      return;
    }
    setSyncStatus('pulling');
    setStatusMessage('กำลังดึงข้อมูลจาก Google Sheets...');
    const res = await syncWithAppsScript(targetUrl, 'pull', fullDb);
    if (res.success && res.data) {
      setSyncStatus('success');
      setStatusMessage('🎉 ดึงข้อมูลล่าสุดจาก Google Sheets และอัปเดตตารางเรียบร้อยแล้ว');
      onDataPulledFromGas(res.data);
      onUpdateGasConfig({ lastSyncedAt: new Date().toISOString() });
    } else {
      setSyncStatus('error');
      setStatusMessage(res.error || 'ไม่สามารถดึงข้อมูลจาก Google Sheets ได้');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#ebf7f0] text-[#0a522f] px-3.5 py-1 rounded-full text-xs font-bold mb-2">
            <span className="material-symbols-outlined text-sm">cloud_sync</span>
            <span>Google Apps Script & Google Sheets Connector</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#306385]">
            เชื่อมต่อฐานข้อมูล Google Apps Script
          </h1>
          <p className="text-sm md:text-base text-[#41474d] mt-1">
            ซิงค์คะแนนและรายชื่อนักเรียนกับ Google Sheets ของโรงเรียนแบบเรียลไทม์
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-[#f0f3ff] p-1.5 rounded-full border border-[#dce2f3]">
          <button
            onClick={() => setActiveStepTab('sync')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all chibi-button ${
              activeStepTab === 'sync'
                ? 'bg-[#306385] text-white shadow-sm'
                : 'text-[#41474d] hover:text-[#306385]'
            }`}
          >
            1. ซิงค์ข้อมูลกับ Sheets
          </button>
          <button
            onClick={() => setActiveStepTab('code')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all chibi-button ${
              activeStepTab === 'code'
                ? 'bg-[#306385] text-white shadow-sm'
                : 'text-[#41474d] hover:text-[#306385]'
            }`}
          >
            2. โค้ด Code.gs (สำหรับครู)
          </button>
          <button
            onClick={() => setActiveStepTab('guide')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all chibi-button ${
              activeStepTab === 'guide'
                ? 'bg-[#306385] text-white shadow-sm'
                : 'text-[#41474d] hover:text-[#306385]'
            }`}
          >
            3. วิธีติดตั้งทีละขั้นตอน
          </button>
        </div>
      </div>

      {/* SYNC TAB */}
      {activeStepTab === 'sync' && (
        <div className="space-y-6">
          {/* URL Form Box */}
          <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow border-t-4 border-[#306385]">
            <h3 className="font-display text-xl font-extrabold text-[#306385] mb-2">
              ตั้งค่า Web App URL ของ Google Apps Script
            </h3>
            <p className="text-sm text-[#41474d] mb-6">
              วาง URL ที่ได้จากการ Deploy ใน Google Sheets (ต้องขึ้นต้นด้วย <code className="bg-[#f0f3ff] px-2 py-0.5 rounded text-[#306385]">https://script.google.com/macros/s/.../exec</code>)
            </p>

            <form onSubmit={handleSaveUrl} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#71787e]">
                  link
                </span>
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/xxxxxx.../exec"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#f0f3ff] rounded-full border border-[#dce2f3] focus:border-[#306385] focus:outline-none focus:bg-white text-sm font-bold transition-all"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleTestAndConnect}
                  disabled={syncStatus === 'pushing'}
                  className="px-6 py-3.5 rounded-full bg-[#306385] hover:bg-[#254d68] text-white font-extrabold text-sm shadow-md chibi-button flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">bolt</span>
                  <span>{syncStatus === 'pushing' ? 'กำลังเชื่อมต่อ...' : 'บันทึกและเชื่อมต่อทันที'}</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-3.5 rounded-full bg-[#f0f3ff] hover:bg-[#dce2f3] text-[#306385] font-bold text-sm chibi-button"
                >
                  บันทึก URL
                </button>
              </div>
            </form>

            <div className="mt-5 p-4 rounded-2xl bg-[#f0f9f4] border border-[#93d5a7] text-xs text-[#0a522f] space-y-1.5">
              <div className="font-extrabold flex items-center gap-1.5 text-sm">
                <span className="material-symbols-outlined text-base text-[#2a6a45]">tips_and_updates</span>
                <span>ทำไมถึงรู้สึกว่ายังไม่ได้เชื่อมต่อ? ตรวจเช็ค 2 จุดสำคัญ:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[#2a6a45]">
                <li>
                  <strong>สิทธิ์การเข้าถึง (Who has access):</strong> ตอนกด Deploy ใน Apps Script ต้องเลือกเป็น <span className="underline font-bold">"Anyone (ทุกคน)"</span> หากเลือกเป็น Only myself ระบบจะเชื่อมต่อไม่ได้
                </li>
                <li>
                  <strong>กดปุ่มเชื่อมต่อ:</strong> เมื่อวาง URL แล้ว ให้กดปุ่ม <span className="font-bold text-[#306385]">"⚡ บันทึกและเชื่อมต่อทันที"</span> ด้านบน ระบบจะสร้าง 4 ชีต (Students, Subjects, Assignments, Grades) และส่งรายชื่อนักเรียนขึ้น Google Sheets ทันที
                </li>
              </ul>
            </div>

            {gasConfig.lastSyncedAt && (
              <div className="mt-4 flex items-center gap-2 text-xs text-[#2a6a45] font-semibold">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>ซิงค์กับ Google Sheets ล่าสุดเมื่อ: {new Date(gasConfig.lastSyncedAt).toLocaleString('th-TH')}</span>
              </div>
            )}
          </div>

          {/* Sync Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Push Card */}
            <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow border-2 border-[#a7d8ff] flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-[#a7d8ff] text-[#001e2f] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                </div>
                <h4 className="font-display text-xl font-bold text-[#151c27]">
                  ส่งข้อมูลขึ้น Google Sheets (Push)
                </h4>
                <p className="text-sm text-[#41474d] mt-2">
                  ระบบจะส่งรายชื่อนักเรียน รายวิชา งานที่มอบหมาย และคะแนนทั้งหมดไปสร้างเป็น 4 ชีตใน Google Sheets
                </p>
              </div>

              <button
                type="button"
                onClick={handlePushToSheets}
                disabled={syncStatus === 'pushing' || syncStatus === 'pulling'}
                className="mt-6 w-full py-3.5 rounded-full bg-[#306385] text-white font-bold text-sm shadow-sm chibi-button flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">upload</span>
                <span>{syncStatus === 'pushing' ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลขึ้น Google Sheets'}</span>
              </button>
            </div>

            {/* Pull Card */}
            <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow border-2 border-[#aef2c2] flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-[#aef2c2] text-[#00210f] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl">cloud_download</span>
                </div>
                <h4 className="font-display text-xl font-bold text-[#151c27]">
                  ดึงข้อมูลจาก Google Sheets (Pull)
                </h4>
                <p className="text-sm text-[#41474d] mt-2">
                  หากคุณครูแก้ไขหรือกรอกคะแนนใน Google Sheets สามารถดึงข้อมูลล่าสุดลงมาอัปเดตในระบบนี้ได้ทันที
                </p>
              </div>

              <button
                type="button"
                onClick={handlePullFromSheets}
                disabled={syncStatus === 'pushing' || syncStatus === 'pulling'}
                className="mt-6 w-full py-3.5 rounded-full bg-[#2a6a45] text-white font-bold text-sm shadow-sm chibi-button flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">download</span>
                <span>{syncStatus === 'pulling' ? 'กำลังดึงข้อมูล...' : 'ดึงข้อมูลจาก Google Sheets'}</span>
              </button>
            </div>
          </div>

          {/* Status feedback message */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                syncStatus === 'success'
                  ? 'bg-[#ebf7f0] text-[#0a522f] border border-[#93d5a7]'
                  : syncStatus === 'error'
                  ? 'bg-[#ffdad6] text-[#93000a] border border-[#ffdad6]'
                  : 'bg-[#f0f3ff] text-[#306385] border border-[#a7d8ff]'
              }`}
            >
              <span className="material-symbols-outlined">
                {syncStatus === 'success'
                  ? 'check_circle'
                  : syncStatus === 'error'
                  ? 'error'
                  : 'hourglass_empty'}
              </span>
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* CODE.GS VIEW TAB */}
      {activeStepTab === 'code' && (
        <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow border-t-4 border-[#81515a] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-[#151c27]">
                โค้ด Code.gs สำหรับ Google Apps Script
              </h3>
              <p className="text-xs text-[#41474d]">
                คัดลอกโค้ดด้านล่างนี้ไปวางในไฟล์ <strong>Code.gs</strong> บน Apps Script ของชีตคุณครู
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className={`px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 chibi-button ${
                copied
                  ? 'bg-[#ebf7f0] text-[#0a522f] border border-[#93d5a7]'
                  : 'bg-[#81515a] text-white shadow-sm'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'คัดลอกโค้ดเรียบร้อยแล้ว!' : 'คัดลอกโค้ด Code.gs'}</span>
            </button>
          </div>

          <div className="bg-[#151c27] text-[#ebf1ff] p-5 rounded-2xl overflow-x-auto text-xs font-mono max-h-[480px] shadow-inner">
            <pre>{GAS_SCRIPT_CODE}</pre>
          </div>
        </div>
      )}

      {/* INSTALLATION GUIDE TAB */}
      {activeStepTab === 'guide' && (
        <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 chibi-shadow border-t-4 border-[#2a6a45] space-y-6">
          <h3 className="font-display text-xl font-bold text-[#151c27]">
            ขั้นตอนการตั้งค่าเชื่อมต่อ Google Sheets ทีละขั้นตอน (3 นาที)
          </h3>

          <div className="space-y-4 text-sm text-[#41474d]">
            <div className="flex gap-4 p-4 rounded-2xl bg-[#f0f3ff]">
              <div className="w-8 h-8 rounded-full bg-[#306385] text-white font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-[#151c27]">เปิด Google Sheets ใหม่</h4>
                <p className="text-xs mt-1">
                  ไปที่ <strong>sheets.google.com</strong> สร้างชีตใหม่ ตั้งชื่อว่า "โรงเรียนบ้านไร่ - บันทึกคะแนน"
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-[#f0f3ff]">
              <div className="w-8 h-8 rounded-full bg-[#306385] text-white font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-[#151c27]">เปิดเมนู Apps Script</h4>
                <p className="text-xs mt-1">
                  คลิกที่เมนู <strong>ส่วนขยาย (Extensions)</strong> ด้านบน แล้วเลือก <strong>Apps Script</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-[#f0f3ff]">
              <div className="w-8 h-8 rounded-full bg-[#306385] text-white font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-[#151c27]">วางโค้ด Code.gs</h4>
                <p className="text-xs mt-1">
                  ลบโค้ดเดิมในไฟล์ <strong>Code.gs</strong> ออกทั้งหมด แล้ววางโค้ดที่ได้จากแท็บ "2. โค้ด Code.gs" ลงไป จากนั้นกด <strong>บันทึก (Ctrl + S)</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-[#f0f3ff]">
              <div className="w-8 h-8 rounded-full bg-[#306385] text-white font-bold flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <h4 className="font-bold text-[#151c27]">การทำให้ใช้งานได้ (Deploy as Web App)</h4>
                <p className="text-xs mt-1">
                  คลิกปุ่มสีน้ำเงินมุมขวาบน <strong>การทำให้ใช้งานได้ (Deploy)</strong> &gt; <strong>การทำให้ใช้งานได้รายการใหม่ (New deployment)</strong>
                  <br />- คลิกไอคอนฟันเฟือง เลือก <strong>เว็บแอป (Web app)</strong>
                  <br />- <strong>ผู้มีสิทธิ์เข้าถึง (Who has access):</strong> เลือกเป็น <strong className="text-[#306385]">"ทุกคน (Anyone)"</strong>
                  <br />- กด <strong>Deploy</strong> และอนุญาตสิทธิ์ (Authorize access)
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-[#f0f3ff]">
              <div className="w-8 h-8 rounded-full bg-[#306385] text-white font-bold flex items-center justify-center shrink-0">
                5
              </div>
              <div>
                <h4 className="font-bold text-[#151c27]">คัดลอก URL มาวางในแอปนี้</h4>
                <p className="text-xs mt-1">
                  คัดลอก <strong>"เว็บแอป URL (Web app URL)"</strong> ที่ขึ้นต้นด้วย <code>https://script.google.com/macros/s/.../exec</code> มาใส่ที่ช่องด้านบน แล้วกด <strong>บันทึก URL</strong> และ <strong>ส่งข้อมูลขึ้น Google Sheets</strong> ได้ทันที!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
