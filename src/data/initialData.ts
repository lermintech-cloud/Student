import { Student, Subject, Assignment, GradeEntry, SchoolSettings, AppScriptConfig } from '../types.js';

export const initialSchoolSettings: SchoolSettings = {
  schoolName: 'โรงเรียนบ้านไร่',
  teacherName: 'ครูน้ำฝน ใจดี',
  teacherRole: 'ครูประจำชั้น ป.1/1',
  teacherEmail: 'teacher.namfon@school.ac.th',
  academicYear: '2568',
  semester: '1',
  mascotUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDeHsRpHO5LYMxtQsF3EdfPvXmGmxIPoy1yXJs6g9iiyLqCXYK2Xt8q1mAgndGgZsqzcKNF5sC3dVXIX9OXN_BL8oqfrcv8wYVt8PlCzztwQiGgqVjNybc6Z4AedSuKEjO7-_14Fbn5Du4Ln7DcUArkbl4QrsYaNA98_XgOAZOHH1JXGhqMNiyHux-77jNqqDmRqXs3xC27G8hNz2nrQe280JACrRS9gaEu8VdIJJvMDVz_NzzLUTf',
  teacherAvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAL5t_MWvFniyYyAgPM7lL7RtqInuWSeTJZVqgChQ5YaPMsKWxH2Az8gcdATP51fZgMNvD4Tzx-ynYWFP0D2u4HSCqiUn_dAgRmSFusmq56qf39j7fYZHvuYVzWZG0f-LmMx4UYLky8Wm6NGFfLRej_sOHb-oaN0_gCMJbJjQOUTU6P6YbUuM7H6cGeHF7CEONozlIeC-kTjGEW1dLI2G6jVMVSOzpV69HLyP4DOO-sXxrgByy-ZpvH',
  hideGasMenu: false,
  hideGithubMenu: true,
  hideAiMenu: false,
  showQuickButtonsInNavbar: true
};

export const initialAppScriptConfig: AppScriptConfig = {
  webAppUrl: '',
  spreadsheetId: '',
  sheetName: 'ChibiGradebook',
  autoSync: true,
  lastSyncedAt: undefined
};

export const initialSubjects: Subject[] = [
  {
    id: 'sub-1',
    code: 'COM-101',
    name: 'วิทยาการคำนวณ (คอมพิวเตอร์)',
    classLevel: 'ป.1/1',
    defaultMaxScore: 10,
    icon: 'computer',
    color: 'bg-[#a7d8ff] text-[#001e2f] border-[#306385]'
  },
  {
    id: 'sub-2',
    code: 'CAR-101',
    name: 'การงานอาชีพ',
    classLevel: 'ป.1/1',
    defaultMaxScore: 10,
    icon: 'handyman',
    color: 'bg-[#ffd9df] text-[#330f19] border-[#81515a]'
  },
  {
    id: 'sub-3',
    code: 'ETH-101',
    name: 'การป้องกันการทุจริต (จิตพิสัย)',
    classLevel: 'ป.1/1',
    defaultMaxScore: 10,
    icon: 'shield',
    color: 'bg-[#aef2c2] text-[#00210f] border-[#2a6a45]'
  }
];

export const initialStudents: Student[] = [
  {
    id: 'stu-1',
    code: 'STU-1001',
    title: 'เด็กชาย',
    firstName: 'จักรกรี',
    lastName: 'สุริยะ',
    nickname: 'เคน',
    gender: 'male',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Ken&backgroundColor=c0aede',
    status: 'active',
    note: 'หัวหน้าห้อง ตั้งใจเรียนดีมาก',
    createdAt: new Date().toISOString()
  },
  {
    id: 'stu-2',
    code: 'STU-1002',
    title: 'เด็กหญิง',
    firstName: 'กัญญารัตน์',
    lastName: 'ใจสว่าง',
    nickname: 'มิ้นต์',
    gender: 'female',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Mint&backgroundColor=ffd5dc',
    status: 'active',
    note: 'ส่งงานตรงเวลา ลายมือสวยงาม',
    createdAt: new Date().toISOString()
  },
  {
    id: 'stu-3',
    code: 'STU-1003',
    title: 'เด็กชาย',
    firstName: 'ณัฐวุฒิ',
    lastName: 'มาลัยทอง',
    nickname: 'ก้อง',
    gender: 'male',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Kong&backgroundColor=b6e3f4',
    status: 'active',
    note: 'ชอบวิชาคอมพิวเตอร์เป็นพิเศษ',
    createdAt: new Date().toISOString()
  },
  {
    id: 'stu-4',
    code: 'STU-1004',
    title: 'เด็กหญิง',
    firstName: 'พรพิมล',
    lastName: 'สร้อยสุวรรณ',
    nickname: 'ฟ้า',
    gender: 'female',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Fah&backgroundColor=d1f4e0',
    status: 'active',
    note: 'ช่วยกิจกรรมในชั้นเรียนสม่ำเสมอ',
    createdAt: new Date().toISOString()
  },
  {
    id: 'stu-5',
    code: 'STU-1005',
    title: 'เด็กชาย',
    firstName: 'ศุภกร',
    lastName: 'มีโชค',
    nickname: 'บอส',
    gender: 'male',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Boss&backgroundColor=ffe4b5',
    status: 'active',
    note: 'กำลังฝึกฝนความรอบคอบในการทำงาน',
    createdAt: new Date().toISOString()
  },
  {
    id: 'stu-6',
    code: 'STU-1006',
    title: 'เด็กหญิง',
    firstName: 'อริสรา',
    lastName: 'รุ่งโรจน์',
    nickname: 'แอล',
    gender: 'female',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Elle&backgroundColor=f5d0fe',
    status: 'active',
    note: 'มีความคิดสร้างสรรค์ดีเยี่ยม',
    createdAt: new Date().toISOString()
  },
  {
    id: 'stu-7',
    code: 'STU-1007',
    title: 'เด็กชาย',
    firstName: 'ธนภูมิ',
    lastName: 'รักษาเมือง',
    nickname: 'ภูมิ',
    gender: 'male',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Phum&backgroundColor=e2e8f0',
    status: 'active',
    note: 'มีน้ำใจ ชอบช่วยเหลือเพื่อน',
    createdAt: new Date().toISOString()
  },
  {
    id: 'stu-8',
    code: 'STU-1008',
    title: 'เด็กหญิง',
    firstName: 'ลลิตา',
    lastName: 'นิลวรรณ',
    nickname: 'ลิตา',
    gender: 'female',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Lita&backgroundColor=fed7aa',
    status: 'active',
    note: 'อ่านเขียนคล่องแคล่ว ตั้งใจเรียน',
    createdAt: new Date().toISOString()
  }
];

export const initialAssignments: Assignment[] = [
  {
    id: 'assign-1',
    subjectId: 'sub-1',
    classLevel: 'ป.1/1',
    title: 'ใบงานที่ 1: การใช้อุปกรณ์คอมพิวเตอร์เบื้องต้น',
    description: 'ฝึกการใช้เมาส์ คีย์บอร์ด และการเปิดปิดเครื่องคอมพิวเตอร์อย่างถูกวิธี',
    maxScore: 10,
    dueDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    category: 'homework',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 'assign-2',
    subjectId: 'sub-1',
    classLevel: 'ป.1/1',
    title: 'แบบทดสอบท้ายหน่วย: การแก้ปัญหาอย่างง่าย',
    description: 'ทดสอบความเข้าใจลำดับขั้นตอนการแก้ปัญหาในชีวิตประจำวัน',
    maxScore: 10,
    dueDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    category: 'quiz',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'assign-3',
    subjectId: 'sub-2',
    classLevel: 'ป.1/1',
    title: 'ปฏิบัติงานที่ 1: การจัดเก็บของใช้ส่วนตัว',
    description: 'การพับเสื้อผ้า จัดกระเป๋านักเรียน และการดูแลความสะอาดพื้นฐาน',
    maxScore: 10,
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    category: 'project',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'assign-4',
    subjectId: 'sub-3',
    classLevel: 'ป.1/1',
    title: 'จิตพิสัย: ความรับผิดชอบและตรงต่อเวลา',
    description: 'ประเมินการเข้าชั้นเรียน การส่งงานตามกำหนด และความซื่อสัตย์',
    maxScore: 10,
    dueDate: new Date().toISOString().split('T')[0],
    category: 'behavior',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

export const initialGrades: GradeEntry[] = [
  // assignment-1 (COM-101)
  { id: 'g-1-1', studentId: 'stu-1', assignmentId: 'assign-1', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-1-2', studentId: 'stu-2', assignmentId: 'assign-1', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-1-3', studentId: 'stu-3', assignmentId: 'assign-1', score: 9, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-1-4', studentId: 'stu-4', assignmentId: 'assign-1', score: 9, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-1-5', studentId: 'stu-5', assignmentId: 'assign-1', score: 8, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-1-6', studentId: 'stu-6', assignmentId: 'assign-1', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-1-7', studentId: 'stu-7', assignmentId: 'assign-1', score: 9, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-1-8', studentId: 'stu-8', assignmentId: 'assign-1', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },

  // assignment-2 (COM-101 quiz)
  { id: 'g-2-1', studentId: 'stu-1', assignmentId: 'assign-2', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-2-2', studentId: 'stu-2', assignmentId: 'assign-2', score: 9, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-2-3', studentId: 'stu-3', assignmentId: 'assign-2', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-2-4', studentId: 'stu-4', assignmentId: 'assign-2', score: 8, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-2-5', studentId: 'stu-5', assignmentId: 'assign-2', score: 7, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-2-6', studentId: 'stu-6', assignmentId: 'assign-2', score: 9, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-2-7', studentId: 'stu-7', assignmentId: 'assign-2', score: 8, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-2-8', studentId: 'stu-8', assignmentId: 'assign-2', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },

  // assignment-3 (CAR-101 project)
  { id: 'g-3-1', studentId: 'stu-1', assignmentId: 'assign-3', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-3-2', studentId: 'stu-2', assignmentId: 'assign-3', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-3-3', studentId: 'stu-3', assignmentId: 'assign-3', score: 9, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-3-4', studentId: 'stu-4', assignmentId: 'assign-3', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-3-5', studentId: 'stu-5', assignmentId: 'assign-3', score: 8, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-3-6', studentId: 'stu-6', assignmentId: 'assign-3', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-3-7', studentId: 'stu-7', assignmentId: 'assign-3', score: 9, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-3-8', studentId: 'stu-8', assignmentId: 'assign-3', score: 9, isCompleted: true, updatedAt: new Date().toISOString() },

  // assignment-4 (ETH-101 behavior)
  { id: 'g-4-1', studentId: 'stu-1', assignmentId: 'assign-4', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-4-2', studentId: 'stu-2', assignmentId: 'assign-4', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-4-3', studentId: 'stu-3', assignmentId: 'assign-4', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-4-4', studentId: 'stu-4', assignmentId: 'assign-4', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-4-5', studentId: 'stu-5', assignmentId: 'assign-4', score: 9, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-4-6', studentId: 'stu-6', assignmentId: 'assign-4', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-4-7', studentId: 'stu-7', assignmentId: 'assign-4', score: 10, isCompleted: true, updatedAt: new Date().toISOString() },
  { id: 'g-4-8', studentId: 'stu-8', assignmentId: 'assign-4', score: 10, isCompleted: true, updatedAt: new Date().toISOString() }
];

