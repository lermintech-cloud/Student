import React, { useState } from 'react';
import { Subject, Assignment } from '../types.js';

interface NewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onSave: (assign: Partial<Assignment>) => void;
}

export const NewAssignmentModal: React.FC<NewAssignmentModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'sub-1');
  const [maxScore, setMaxScore] = useState(10);
  const [dueDate, setDueDate] = useState('2025-07-30');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'homework' | 'quiz' | 'project' | 'behavior'>('homework');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      subjectId,
      classLevel: 'ป.1/1',
      maxScore: Number(maxScore) || 10,
      dueDate,
      description: description.trim(),
      category,
      createdAt: new Date().toISOString().slice(0, 10)
    });
    // Reset inputs
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151c27]/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#ffffff] rounded-3xl chibi-shadow-lg w-full max-w-md p-6 border-t-4 border-[#fdbec9]">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#81515a] text-2xl">
              assignment_add
            </span>
            <h3 className="font-display text-xl font-extrabold text-[#306385]">
              มอบหมายงานใหม่
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#f0f3ff] text-[#41474d]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm font-medium">
          <div>
            <label className="block text-xs font-bold text-[#41474d] mb-1">
              วิชาที่มอบหมาย
            </label>
            <select
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none font-bold"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.classLevel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#41474d] mb-1">
              ชื่องานที่มอบหมาย <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="เช่น A6: แบบฝึกหัดเรื่องตัวแปร"
              className="w-full px-3 py-2.5 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none font-bold text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#41474d] mb-1">
                คะแนนเต็ม
              </label>
              <input
                type="number"
                min="1"
                required
                value={maxScore}
                onChange={e => setMaxScore(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none font-bold text-center text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#41474d] mb-1">
                กำหนดส่ง (วันที่)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#41474d] mb-1">
              ประเภทงาน
            </label>
            <select
              value={category}
              onChange={e =>
                setCategory(
                  e.target.value as 'homework' | 'quiz' | 'project' | 'behavior'
                )
              }
              className="w-full px-3 py-2.5 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none"
            >
              <option value="homework">การบ้าน / แบบฝึกหัด (Homework)</option>
              <option value="quiz">ทดสอบย่อย (Quiz)</option>
              <option value="project">โครงงาน / กิจกรรมกลุ่ม (Project)</option>
              <option value="behavior">จิตพิสัยและการมีส่วนร่วม (Behavior)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#41474d] mb-1">
              คำอธิบายรายละเอียด
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="รายละเอียดงาน หรือข้อควรระวัง..."
              className="w-full px-3 py-2 bg-[#f0f3ff] rounded-xl border border-[#dce2f3] focus:border-[#306385] focus:outline-none text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#f0f3ff]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[#f0f3ff] text-[#41474d] font-bold text-xs chibi-button"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#306385] text-white font-bold text-xs shadow-sm chibi-button"
            >
              สร้างงานและให้คะแนน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
