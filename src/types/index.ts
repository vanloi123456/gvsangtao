export type NavTab = 'home' | 'apps' | 'games' | 'simulations';

export interface EducationalApp {
  id: string;
  title: string;
  developer: string;
  description: string;
  category: 'lesson_design' | 'assessment' | 'classroom_mgmt' | 'stem_math' | 'ai_assistant';
  categoryLabel: string;
  gradeLevel: 'all' | 'grade_1_2' | 'grade_3_5';
  gradeLabel: string;
  url: string;
  tags: string[];
  features: string[];
  guideTips?: string;
  authorId?: string;
  authorEmail?: string;
  authorName?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  isCustom?: boolean;
}

export interface InteractiveGame {
  id: string;
  title: string;
  subject: string;
  subjectLabel: string;
  grade: string;
  gradeLabel: string;
  gameType: 'wheel' | 'quiz' | 'matching' | 'external';
  gameTypeLabel: string;
  description: string;
  playMode: 'interactive' | 'external';
  targetSkills: string[];
  externalUrl?: string;
  authorId?: string;
  authorEmail?: string;
  authorName?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  isCustom?: boolean;
}

export interface PrimarySubjectOption {
  id: string;
  label: string;
  shortLabel?: string;
}

export interface PrimaryGradeOption {
  id: string;
  label: string;
  shortLabel?: string;
}

export const PRIMARY_SUBJECTS: PrimarySubjectOption[] = [
  { id: 'toan', label: 'Toán học', shortLabel: 'Toán' },
  { id: 'tieng_viet', label: 'Tiếng Việt', shortLabel: 'Tiếng Việt' },
  { id: 'tieng_anh', label: 'Tiếng Anh', shortLabel: 'Tiếng Anh' },
  { id: 'khoa_hoc', label: 'Khoa học', shortLabel: 'Khoa học' },
  { id: 'tu_nhien_xa_hoi', label: 'Tự nhiên & Xã hội', shortLabel: 'TN & XH' },
  { id: 'lich_su_dia_ly', label: 'Lịch sử & Địa lý', shortLabel: 'Sử & Địa' },
  { id: 'tin_hoc_cong_nghe', label: 'Tin học & Công nghệ', shortLabel: 'Tin & CN' },
  { id: 'dao_duc', label: 'Đạo đức', shortLabel: 'Đạo đức' },
  { id: 'my_thuat', label: 'Mỹ thuật', shortLabel: 'Mỹ thuật' },
  { id: 'am_nhac', label: 'Âm nhạc', shortLabel: 'Âm nhạc' },
  { id: 'hoat_dong_trai_nghiem', label: 'Hoạt động trải nghiệm', shortLabel: 'HĐ Trải nghiệm' },
  { id: 'giao_duc_the_chat', label: 'Giáo dục thể chất', shortLabel: 'Thể chất' }
];

export const PRIMARY_GRADES: PrimaryGradeOption[] = [
  { id: 'grade_1', label: 'Lớp 1', shortLabel: 'K1' },
  { id: 'grade_2', label: 'Lớp 2', shortLabel: 'K2' },
  { id: 'grade_3', label: 'Lớp 3', shortLabel: 'K3' },
  { id: 'grade_4', label: 'Lớp 4', shortLabel: 'K4' },
  { id: 'grade_5', label: 'Lớp 5', shortLabel: 'K5' }
];

export interface ScienceExperiment {
  id: string;
  title: string;
  subject: string;
  subjectLabel: string;
  grade: string;
  gradeLabel?: string;
  topic?: string;
  topicLabel?: string;
  description: string;
  learningGoals: string[];
  simMode: string;
  externalUrl?: string;
  authorId?: string;
  authorEmail?: string;
  authorName?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  isCustom?: boolean;
}

export interface ResourceSubmission {
  type: 'app' | 'game' | 'experiment';
  title: string;
  description: string;
  categoryOrSubject: string;
  grade: string;
  url?: string;
  tags?: string;
}
