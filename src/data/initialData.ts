import { EducationalApp, InteractiveGame, ScienceExperiment } from '../types';

// Xóa tất cả các ứng dụng mẫu để giáo viên tự thêm vào
export const INITIAL_APPS: EducationalApp[] = [];

// Xóa tất cả các trò chơi tương tác mẫu để giáo viên tự thêm vào
export const INITIAL_GAMES: InteractiveGame[] = [];

// Giữ lại duy nhất thí nghiệm mô phỏng Vòng tuần hoàn nước
export const INITIAL_EXPERIMENTS: ScienceExperiment[] = [
  {
    id: 'exp-water-cycle',
    title: 'Mô Phỏng Vòng Tuần Hoàn Của Nước',
    subject: 'khoa_hoc',
    subjectLabel: 'Khoa học',
    grade: 'grade_4',
    gradeLabel: 'Khối Lớp 4 - Lớp 5',
    description: 'Phòng thí nghiệm tương tác trực quan mô phỏng quá trình Bốc hơi từ biển, Ngưng tụ thành mây, Mưa rơi xuống núi và Dòng chảy trở về đại dương.',
    learningGoals: [
      'Hiểu rõ 4 giai đoạn của vòng tuần hoàn nước',
      'Quan sát ảnh hưởng của nhiệt độ và ánh nắng mặt trời',
      'Giải thích hiện tượng mây và mưa trong tự nhiên'
    ],
    simMode: 'water_cycle'
  }
];
