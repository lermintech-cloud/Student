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
  hideGasMenu: true,
  hideGithubMenu: true,
  hideAiMenu: false,
  showQuickButtonsInNavbar: false
};

export const initialAppScriptConfig: AppScriptConfig = {
  webAppUrl: '',
  spreadsheetId: '',
  sheetName: 'ChibiGradebook',
  autoSync: false,
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
    id: 'stu-001',
    code: '001',
    title: 'ด.ช.',
    firstName: 'Oliver',
    lastName: 'Smith',
    nickname: 'โอลลี่',
    gender: 'male',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1zrbR5LJ132IT7GHNZ6XJHu81UNgH7_kYAfB8291kvt62_NfAJMZX9jL4aSEHBLZE3OYbqLu5PHHnf6cRJAEt7VvOTyMZqTQA_t0OIHWhxqfph3kgrpx2s9bpfa4Z6Ja1DZ5MgL0D6YpBzqLXyt621PJJrWg9pybZQvwd8Ft6ofEg3lHK8hQYsb8jNSOk9SuIqQlyHy5GueIu1Wkpt2GEzXQjuJ5V7X-gtUBBFG0ShbcUz55CxW5B',
    status: 'active',
    note: 'หัวหน้าห้อง เก่งคณิตศาสตร์',
    createdAt: '2025-05-15'
  },
  {
    id: 'stu-002',
    code: '002',
    title: 'ด.ญ.',
    firstName: 'Emma',
    lastName: 'Johnson',
    nickname: 'เอ็มม่า',
    gender: 'female',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkSqD236twd6X8UpXEQ6X5tP5QZPE96FrbUuQu4VOHGN8E0WEwDibXlSB57nM1IApmvri1JNDHdjBmAZ9O5jhv9ttBgyV_TuZCFeJqV42vM95gE8dwbQfs1Jd8hh3RbANRKrt6JgCR2nQ4UILgBh38poQiTrmgvd8zOLilrHW9ZKknAHOLaenumTWgOD172UFqgqTXF85mTqgW3F1VEf7ud0OIwzcy-d3OE4tKWutqo9NXePIYbL5g',
    status: 'active',
    note: 'มีความคิดสร้างสรรค์สูง',
    createdAt: '2025-05-15'
  },
  {
    id: 'stu-003',
    code: '003',
    title: 'ด.ช.',
    firstName: 'Noah',
    lastName: 'Williams',
    nickname: 'โนอาห์',
    gender: 'male',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaKNtM7Ss_waLgni8Vbt1-9iDA1btKdtTZxp2IS4bL49dhVTzOBr1NQuStHIjHdqvnkOLF0KSKIgxC1Ht65ZOIOqzQ9ETPRMt-V3hN_mAbowGvvOsnocVfLtIAOX76WKYh0Gvs7UEsp73KzVQCqM7CCnnXi3R2D3r2wFXSxj3WVHwEEGQlJjwJobNCi18safHawvCzu7fAa6dKwF_a7o5QSrwaJsTn8xShZPuIsY-r55SpKHP251qa',
    status: 'active',
    note: 'คะแนนเต็มทุกวิชา',
    createdAt: '2025-05-15'
  },
  {
    id: 'stu-004',
    code: '004',
    title: 'ด.ช.',
    firstName: 'สมชาย',
    lastName: 'รักเรียน',
    nickname: 'สม',
    gender: 'male',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRM2iMXzB_CqV-yjhaNSVxrepuhyteyJMmqdo3MNNMzZGx1iMJ76zEavuSaiO7GWKO4SIKsUk4r-OULp6COYfGbUgI4xEAYWsRPGj6kV6DEFC0NCG0M7lFrpKJtAZn8jQQ24TBmuP2PXVeBIJOGPuGbb3MXclabxvM_07FuUZ2fOq0Q5N4-Wgsz2wu4TrzhNiG5xZeVUmi6omiTm3exvV0aOdIQwPGOtzNlHRAl6acYOstbLuZGovr',
    status: 'active',
    note: 'ตั้งใจเรียน ส่งงานตรงเวลาเสมอ',
    createdAt: '2025-05-15'
  },
  {
    id: 'stu-005',
    code: '005',
    title: 'ด.ญ.',
    firstName: 'วิภาดา',
    lastName: 'ใจดี',
    nickname: 'วิ',
    gender: 'female',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBnzCHssGlt0ocH3jwf4G2GBG9jlVV9hn19Yb49wFjs8OiqDXNno_OtBGeMvJGt67pF0xMIVgeQnSoS72HOtjTFyNNqbV5G4PkLBTfQLLSUDx7Bht5mDdj2jfolmheN2dpSg5wO0sd_SZnocec0xIiEERnmr0b_fi5CHPBFL5fzRnVgsQMeP_lMMMywmlxkl9VADfM-UA5hKvtMb9rImv90onvfv68Qr6ml0XyoDS3ZXMIXSyw9N8E',
    status: 'active',
    note: 'ชอบช่วยเหลือเพื่อน',
    createdAt: '2025-05-15'
  },
  {
    id: 'stu-006',
    code: '006',
    title: 'ด.ช.',
    firstName: 'ธนพล',
    lastName: 'ขยันยิ่ง',
    nickname: 'ธน',
    gender: 'male',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1z022o1aJu536i3dYLsZfF8U8UKbLo0Teebyu3cDjLD9xZZrU_tGleHckEE11ZNWuqL1HhAxA0zKR0Pfck_M0swfE60TUIMivSyjb-9K0Y3zVw6VyNIKs0Vn82hawoNzdqNHf5KvhcjmR3sZM0T2iDXmcjWSoTufXedKw6m5AzBD2o_9ZX-Qybm1EO3TyZGBPudcSB3Al9-wDbDH5TgVMRYV2PsfygkZ2F58lID8FUHDZ5SUjQnqp',
    status: 'active',
    note: 'ขาดสอบย่อยครั้งที่ 1',
    createdAt: '2025-05-15'
  },
  {
    id: 'stu-007',
    code: '007',
    title: 'ด.ญ.',
    firstName: 'กนกวรรณ',
    lastName: 'สวยงาม',
    nickname: 'กนก',
    gender: 'female',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz0oXX52ByJ0J7Ouy0FaNmnRE04u0aRclNyJKhkoQuxL4CaXP9wcDY3788xL9tgu_RGH2Ru1jMhHHa5CA1aiprjuzGshaITYXbLCeyma1nhRWEL559MtrfwKD2K9PU9tHVLzBpxRyPvZKQ3Ga-QJBFIUBGVtOo8GpsguDksYWwvo7tiv_vA15VhGiuDZy-SFRf2uSy-CkSWdLY2TWSa_ZIuKSQ60-rEzDD0DMi2LyHV6-NSsvRoydm',
    status: 'active',
    note: 'ลายมือสวย เป็นระเบียบ',
    createdAt: '2025-05-15'
  },
  {
    id: 'stu-008',
    code: '008',
    title: 'ด.ช.',
    firstName: 'ปิยะพงษ์',
    lastName: 'มุ่งมั่น',
    nickname: 'ปิยะ',
    gender: 'male',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClTfnQ8x0kWe3Lzcmw2wAWkThjXR5JfAVDwEw9npSBuXjuK7T16bSGeLHqLVj21xv996gnpRHRciepSL53S1X0Zo9y9uycjz81gM1UqBwsXeRE_MTgYYZ1BxNZDPgMgf7t9MA3qNZsbasPkSLt08zelR_IfCHFOdfT3E2H05-t99pPX9tVBkTp_ybwI1ZBChQ_3TvK4cCx26P7fL-Wk3ljTjstwafauKKG7OxckS_aKn3J6Y7A9Pmf',
    status: 'absent',
    note: 'ค้างโครงงานและต้องเสริมการอ่าน',
    createdAt: '2025-05-15'
  },
  {
    id: 'stu-009',
    code: '009',
    title: 'ด.ญ.',
    firstName: 'รตินันท์',
    lastName: 'มีสุข',
    nickname: 'รติ',
    gender: 'female',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBnzCHssGlt0ocH3jwf4G2GBG9jlVV9hn19Yb49wFjs8OiqDXNno_OtBGeMvJGt67pF0xMIVgeQnSoS72HOtjTFyNNqbV5G4PkLBTfQLLSUDx7Bht5mDdj2jfolmheN2dpSg5wO0sd_SZnocec0xIiEERnmr0b_fi5CHPBFL5fzRnVgsQMeP_lMMMywmlxkl9VADfM-UA5hKvtMb9rImv90onvfv68Qr6ml0XyoDS3ZXMIXSyw9N8E',
    status: 'active',
    note: 'มีความกระตือรือร้นสูง',
    createdAt: '2025-05-15'
  },
  {
    id: 'stu-010',
    code: '010',
    title: 'ด.ช.',
    firstName: 'ณัฐพล',
    lastName: 'เก่งกาจ',
    nickname: 'ณัฐ',
    gender: 'male',
    classLevel: 'ป.1/1',
    room: 'ห้อง 101',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRM2iMXzB_CqV-yjhaNSVxrepuhyteyJMmqdo3MNNMzZGx1iMJ76zEavuSaiO7GWKO4SIKsUk4r-OULp6COYfGbUgI4xEAYWsRPGj6kV6DEFC0NCG0M7lFrpKJtAZn8jQQ24TBmuP2PXVeBIJOGPuGbb3MXclabxvM_07FuUZ2fOq0Q5N4-Wgsz2wu4TrzhNiG5xZeVUmi6omiTm3exvV0aOdIQwPGOtzNlHRAl6acYOstbLuZGovr',
    status: 'active',
    note: 'เก่งเขียนโค้ด Scratch เบื้องต้น',
    createdAt: '2025-05-15'
  }
];

export const initialAssignments: Assignment[] = [
  {
    id: 'assign-1',
    subjectId: 'sub-1',
    classLevel: 'ป.1/1',
    title: 'A1: การบ้าน 1 - อัลกอริทึมในชีวิตประจำวัน',
    description: 'แบบฝึกหัดการคิดเป็นขั้นตอนในชีวิตประจำวัน เช่น การแต่งตัวมาโรงเรียน',
    maxScore: 10,
    dueDate: '2025-06-10',
    category: 'homework',
    createdAt: '2025-06-01'
  },
  {
    id: 'assign-2',
    subjectId: 'sub-1',
    classLevel: 'ป.1/1',
    title: 'A2: แบบฝึกหัด - ระบุตัวเศษและตัวส่วน',
    description: 'ใบงานฝึกหัดการแยกแยะคำสั่งและการทำซ้ำ',
    maxScore: 15,
    dueDate: '2025-06-15',
    category: 'homework',
    createdAt: '2025-06-05'
  },
  {
    id: 'assign-3',
    subjectId: 'sub-1',
    classLevel: 'ป.1/1',
    title: 'A3: ทดสอบย่อย - การเขียนโปรแกรมเบื้องต้น',
    description: 'แบบทดสอบกลางภาคเกี่ยวกับคำสั่งทิศทาง',
    maxScore: 20,
    dueDate: '2025-06-20',
    category: 'quiz',
    createdAt: '2025-06-10'
  },
  {
    id: 'assign-4',
    subjectId: 'sub-1',
    classLevel: 'ป.1/1',
    title: 'A4: โครงงาน - สร้างการ์ดแอนิเมชัน',
    description: 'โครงงานนำเสนอผลงานด้วยบล็อกคำสั่งง่ายๆ',
    maxScore: 20,
    dueDate: '2025-07-01',
    category: 'project',
    createdAt: '2025-06-15'
  },
  {
    id: 'assign-5',
    subjectId: 'sub-1',
    classLevel: 'ป.1/1',
    title: 'A5: จิตพิสัยและการมีส่วนร่วม',
    description: 'การเข้าชั้นเรียนและจิตพิสัยตลอดภาคเรียน',
    maxScore: 10,
    dueDate: '2025-07-15',
    category: 'behavior',
    createdAt: '2025-06-01'
  }
];

export const initialGrades: GradeEntry[] = [
  // Oliver Smith (001) - 10, 15, 20, null, 10 -> Total 55 (91.6%)
  { id: 'g-1-1', studentId: 'stu-001', assignmentId: 'assign-1', score: 10, isCompleted: true, updatedAt: '2025-06-11' },
  { id: 'g-1-2', studentId: 'stu-001', assignmentId: 'assign-2', score: 15, isCompleted: true, updatedAt: '2025-06-16' },
  { id: 'g-1-3', studentId: 'stu-001', assignmentId: 'assign-3', score: 20, isCompleted: true, updatedAt: '2025-06-21' },
  { id: 'g-1-4', studentId: 'stu-001', assignmentId: 'assign-4', score: null, isCompleted: false, note: 'รอส่งโครงงาน', updatedAt: '2025-06-22' },
  { id: 'g-1-5', studentId: 'stu-001', assignmentId: 'assign-5', score: 10, isCompleted: true, updatedAt: '2025-06-22' },

  // Emma Johnson (002) - 8, 12, 0, 18, 9 -> Total 47 (78.3%)
  { id: 'g-2-1', studentId: 'stu-002', assignmentId: 'assign-1', score: 8, isCompleted: true, updatedAt: '2025-06-11' },
  { id: 'g-2-2', studentId: 'stu-002', assignmentId: 'assign-2', score: 12, isCompleted: true, updatedAt: '2025-06-16' },
  { id: 'g-2-3', studentId: 'stu-002', assignmentId: 'assign-3', score: 0, isCompleted: true, note: 'ขาดสอบเนื่องจากป่วย', updatedAt: '2025-06-21' },
  { id: 'g-2-4', studentId: 'stu-002', assignmentId: 'assign-4', score: 18, isCompleted: true, updatedAt: '2025-06-22' },
  { id: 'g-2-5', studentId: 'stu-002', assignmentId: 'assign-5', score: 9, isCompleted: true, updatedAt: '2025-06-22' },

  // Noah Williams (003) - 10, 15, 20, 20, 10 -> Total 75 (100%)
  { id: 'g-3-1', studentId: 'stu-003', assignmentId: 'assign-1', score: 10, isCompleted: true, updatedAt: '2025-06-11' },
  { id: 'g-3-2', studentId: 'stu-003', assignmentId: 'assign-2', score: 15, isCompleted: true, updatedAt: '2025-06-16' },
  { id: 'g-3-3', studentId: 'stu-003', assignmentId: 'assign-3', score: 20, isCompleted: true, updatedAt: '2025-06-21' },
  { id: 'g-3-4', studentId: 'stu-003', assignmentId: 'assign-4', score: 20, isCompleted: true, updatedAt: '2025-06-22' },
  { id: 'g-3-5', studentId: 'stu-003', assignmentId: 'assign-5', score: 10, isCompleted: true, updatedAt: '2025-06-22' },

  // สมชาย รักเรียน (004) - 9, 14, 18, 19, 10 -> Total 70 (93.3%)
  { id: 'g-4-1', studentId: 'stu-004', assignmentId: 'assign-1', score: 9, isCompleted: true, updatedAt: '2025-06-11' },
  { id: 'g-4-2', studentId: 'stu-004', assignmentId: 'assign-2', score: 14, isCompleted: true, updatedAt: '2025-06-16' },
  { id: 'g-4-3', studentId: 'stu-004', assignmentId: 'assign-3', score: 18, isCompleted: true, updatedAt: '2025-06-21' },
  { id: 'g-4-4', studentId: 'stu-004', assignmentId: 'assign-4', score: 19, isCompleted: true, updatedAt: '2025-06-22' },
  { id: 'g-4-5', studentId: 'stu-004', assignmentId: 'assign-5', score: 10, isCompleted: true, updatedAt: '2025-06-22' },

  // วิภาดา ใจดี (005) - 7, 11, 15, 15, 8 -> Total 56 (74.7%)
  { id: 'g-5-1', studentId: 'stu-005', assignmentId: 'assign-1', score: 7, isCompleted: true, updatedAt: '2025-06-11' },
  { id: 'g-5-2', studentId: 'stu-005', assignmentId: 'assign-2', score: 11, isCompleted: true, updatedAt: '2025-06-16' },
  { id: 'g-5-3', studentId: 'stu-005', assignmentId: 'assign-3', score: 15, isCompleted: true, updatedAt: '2025-06-21' },
  { id: 'g-5-4', studentId: 'stu-005', assignmentId: 'assign-4', score: 15, isCompleted: true, updatedAt: '2025-06-22' },
  { id: 'g-5-5', studentId: 'stu-005', assignmentId: 'assign-5', score: 8, isCompleted: true, updatedAt: '2025-06-22' },

  // ธนพล ขยันยิ่ง (006) - 10, 13, 0, 17, 9 -> Total 49 (65.3%)
  { id: 'g-6-1', studentId: 'stu-006', assignmentId: 'assign-1', score: 10, isCompleted: true, updatedAt: '2025-06-11' },
  { id: 'g-6-2', studentId: 'stu-006', assignmentId: 'assign-2', score: 13, isCompleted: true, updatedAt: '2025-06-16' },
  { id: 'g-6-3', studentId: 'stu-006', assignmentId: 'assign-3', score: 0, isCompleted: true, note: 'ต้องนัดสอบชดเชย', updatedAt: '2025-06-21' },
  { id: 'g-6-4', studentId: 'stu-006', assignmentId: 'assign-4', score: 17, isCompleted: true, updatedAt: '2025-06-22' },
  { id: 'g-6-5', studentId: 'stu-006', assignmentId: 'assign-5', score: 9, isCompleted: true, updatedAt: '2025-06-22' },

  // กนกวรรณ สวยงาม (007) - 8, 12, 16, 16, 10 -> Total 62 (82.7%)
  { id: 'g-7-1', studentId: 'stu-007', assignmentId: 'assign-1', score: 8, isCompleted: true, updatedAt: '2025-06-11' },
  { id: 'g-7-2', studentId: 'stu-007', assignmentId: 'assign-2', score: 12, isCompleted: true, updatedAt: '2025-06-16' },
  { id: 'g-7-3', studentId: 'stu-007', assignmentId: 'assign-3', score: 16, isCompleted: true, updatedAt: '2025-06-21' },
  { id: 'g-7-4', studentId: 'stu-007', assignmentId: 'assign-4', score: 16, isCompleted: true, updatedAt: '2025-06-22' },
  { id: 'g-7-5', studentId: 'stu-007', assignmentId: 'assign-5', score: 10, isCompleted: true, updatedAt: '2025-06-22' },

  // ปิยะพงษ์ มุ่งมั่น (008) - 6, 10, 14, null, 7 -> Total 37 (49.3%)
  { id: 'g-8-1', studentId: 'stu-008', assignmentId: 'assign-1', score: 6, isCompleted: true, updatedAt: '2025-06-11' },
  { id: 'g-8-2', studentId: 'stu-008', assignmentId: 'assign-2', score: 10, isCompleted: true, updatedAt: '2025-06-16' },
  { id: 'g-8-3', studentId: 'stu-008', assignmentId: 'assign-3', score: 14, isCompleted: true, updatedAt: '2025-06-21' },
  { id: 'g-8-4', studentId: 'stu-008', assignmentId: 'assign-4', score: null, isCompleted: false, note: 'ค้างส่งงานโครงงาน', updatedAt: '2025-06-22' },
  { id: 'g-8-5', studentId: 'stu-008', assignmentId: 'assign-5', score: 7, isCompleted: true, updatedAt: '2025-06-22' },

  // รตินันท์ มีสุข (009) - 9, 14, 19, 18, 9 -> Total 69 (92.0%)
  { id: 'g-9-1', studentId: 'stu-009', assignmentId: 'assign-1', score: 9, isCompleted: true, updatedAt: '2025-06-11' },
  { id: 'g-9-2', studentId: 'stu-009', assignmentId: 'assign-2', score: 14, isCompleted: true, updatedAt: '2025-06-16' },
  { id: 'g-9-3', studentId: 'stu-009', assignmentId: 'assign-3', score: 19, isCompleted: true, updatedAt: '2025-06-21' },
  { id: 'g-9-4', studentId: 'stu-009', assignmentId: 'assign-4', score: 18, isCompleted: true, updatedAt: '2025-06-22' },
  { id: 'g-9-5', studentId: 'stu-009', assignmentId: 'assign-5', score: 9, isCompleted: true, updatedAt: '2025-06-22' },

  // ณัฐพล เก่งกาจ (010) - 7, 11, 15, 14, 8 -> Total 55 (73.3%)
  { id: 'g-10-1', studentId: 'stu-010', assignmentId: 'assign-1', score: 7, isCompleted: true, updatedAt: '2025-06-11' },
  { id: 'g-10-2', studentId: 'stu-010', assignmentId: 'assign-2', score: 11, isCompleted: true, updatedAt: '2025-06-16' },
  { id: 'g-10-3', studentId: 'stu-010', assignmentId: 'assign-3', score: 15, isCompleted: true, updatedAt: '2025-06-21' },
  { id: 'g-10-4', studentId: 'stu-010', assignmentId: 'assign-4', score: 14, isCompleted: true, updatedAt: '2025-06-22' },
  { id: 'g-10-5', studentId: 'stu-010', assignmentId: 'assign-5', score: 8, isCompleted: true, updatedAt: '2025-06-22' }
];
