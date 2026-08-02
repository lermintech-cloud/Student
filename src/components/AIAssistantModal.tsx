import React, { useState, useEffect } from 'react';
import {
  Student,
  Assignment,
  GradeEntry,
  AIAnalysisResult
} from '../types.js';
import { analyzeClassWithAI } from '../services/api.js';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  assignments: Assignment[];
  grades: GradeEntry[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  students,
  assignments,
  grades
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState('');

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    const res = await analyzeClassWithAI(students, assignments, grades);
    setLoading(false);
    if (res.success && res.analysis) {
      setResult(res.analysis);
    } else {
      setError(res.error || 'ไม่สามารถวิเคราะห์ข้อมูลด้วย AI ได้');
    }
  };

  useEffect(() => {
    if (isOpen && !result && !loading) {
      runAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151c27]/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#ffffff] rounded-[2.5rem] chibi-shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border-t-8 border-[#fdbec9]">
        {/* Header */}
        <div className="p-6 bg-[#fff9fa] border-b border-[#ffd9df] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#fdbec9] text-[#330f19] flex items-center justify-center font-bold text-2xl shadow-sm">
              🤖
            </div>
            <div>
              <h3 className="font-display text-xl font-extrabold text-[#306385]">
                น้องชิบิ AI - สรุปและวิเคราะห์ผลการเรียน
              </h3>
              <p className="text-xs text-[#41474d]">
                วิเคราะห์สถิติ จุดเด่น และคำแนะนำการสอนด้วย Gemini AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#ffd9df]/50 text-[#41474d]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-sm">
          {loading && (
            <div className="py-16 text-center space-y-4">
              <div className="inline-block animate-spin text-[#306385]">
                <span className="material-symbols-outlined text-5xl">autorenew</span>
              </div>
              <h4 className="font-display text-lg font-bold text-[#306385]">
                น้องชิบิ AI กำลังวิเคราะห์คะแนนของนักเรียน...
              </h4>
              <p className="text-xs text-[#71787e]">
                กรุณารอสักครู่ ระบบกำลังประมวลผลสถิติจากทุกการบ้านและทดสอบย่อย
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="p-6 rounded-3xl bg-[#ffdad6] text-[#93000a] text-center space-y-3">
              <span className="material-symbols-outlined text-4xl">error</span>
              <p className="font-bold">{error}</p>
              <button
                onClick={runAnalysis}
                className="px-6 py-2 rounded-full bg-[#93000a] text-white text-xs font-bold"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          )}

          {!loading && result && (
            <>
              {/* Summary Text Box */}
              <div className="p-5 rounded-3xl bg-[#f0f3ff] border-2 border-[#a7d8ff] space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#306385]">
                  <span className="material-symbols-outlined text-base">speaker_notes</span>
                  <span>สรุปภาพรวมจากคุณครูชิบิ</span>
                </div>
                <p className="text-[#151c27] leading-relaxed font-medium">
                  {result.summaryText}
                </p>
              </div>

              {/* Stats overview banner */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-3xl bg-[#ebf7f0] border border-[#93d5a7] text-center">
                  <div className="text-xs font-bold text-[#2a6a45]">คะแนนเฉลี่ยทั้งชั้นเรียน</div>
                  <div className="font-display text-3xl font-extrabold text-[#2a6a45] mt-1">
                    {result.classAverage || 85}%
                  </div>
                </div>
                <div className="p-4 rounded-3xl bg-[#fff9e6] border border-[#f4b6c1] text-center">
                  <div className="text-xs font-bold text-[#996300]">อัตราสอบผ่านเกณฑ์</div>
                  <div className="font-display text-3xl font-extrabold text-[#996300] mt-1">
                    {result.passRate || 92}%
                  </div>
                </div>
              </div>

              {/* Strengths & Improvement Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-3xl bg-[#ffffff] border-2 border-[#aef2c2] space-y-3">
                  <h4 className="font-display font-bold text-[#2a6a45] flex items-center gap-1.5 text-base">
                    <span className="material-symbols-outlined text-lg">thumb_up</span>
                    <span>จุดเด่นของนักเรียนชั้นนี้</span>
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {(result.strengths || []).map((str, i) => (
                      <li key={`str-${i}-${str.substring(0, 10)}`} className="flex items-start gap-2">
                        <span className="text-[#2a6a45] font-bold">✨</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-3xl bg-[#ffffff] border-2 border-[#fdbec9] space-y-3">
                  <h4 className="font-display font-bold text-[#81515a] flex items-center gap-1.5 text-base">
                    <span className="material-symbols-outlined text-lg">lightbulb</span>
                    <span>จุดที่ควรพัฒนา &amp; ข้อเสนอแนะ</span>
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {(result.improvementAreas || []).map((imp, i) => (
                      <li key={`imp-${i}-${imp.substring(0, 10)}`} className="flex items-start gap-2">
                        <span className="text-[#81515a] font-bold">💡</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                    {(result.recommendedActions || []).map((rec, j) => (
                      <li key={'rec-' + j} className="flex items-start gap-2 text-[#306385]">
                        <span className="font-bold">🎯</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f0f3ff] border-t border-[#e2e8f8] flex justify-between items-center shrink-0">
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="px-4 py-2 rounded-full bg-[#ffffff] text-[#306385] border border-[#dce2f3] text-xs font-bold hover:bg-[#e7eefe] flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>วิเคราะห์ใหม่</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#306385] text-white text-xs font-bold shadow-sm chibi-button"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
