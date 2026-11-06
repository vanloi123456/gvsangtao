import React, { useState, useEffect } from 'react';
import { X, Sparkles, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { EducationalApp, InteractiveGame, ScienceExperiment, PRIMARY_SUBJECTS, PRIMARY_GRADES } from '../types';
import { uploadResourceMedia } from '../firebase';

interface AddResourceModalProps {
  initialType?: 'app' | 'game' | 'experiment';
  editItem?: EducationalApp | InteractiveGame | ScienceExperiment | null;
  onClose: () => void;
  onSaveApp: (app: EducationalApp, isEdit: boolean) => void;
  onSaveGame: (game: InteractiveGame, isEdit: boolean) => void;
  onSaveExperiment: (exp: ScienceExperiment, isEdit: boolean) => void;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({
  initialType = 'app',
  editItem = null,
  onClose,
  onSaveApp,
  onSaveGame,
  onSaveExperiment
}) => {
  const isEditMode = !!editItem;

  const [resourceType, setResourceType] = useState<'app' | 'game' | 'experiment'>(() => {
    if (editItem) {
      if ('category' in editItem) return 'app';
      if ('gameType' in editItem) return 'game';
      if ('topic' in editItem) return 'experiment';
    }
    return initialType;
  });

  const [title, setTitle] = useState(editItem ? editItem.title : '');
  const [description, setDescription] = useState(editItem ? editItem.description : '');
  const [url, setUrl] = useState(() => {
    if (!editItem) return '';
    if ('url' in editItem) return editItem.url;
    if ('externalUrl' in editItem && editItem.externalUrl) return editItem.externalUrl;
    return '';
  });
  const [grade, setGrade] = useState(() => {
    if (!editItem) return 'all';
    if ('gradeLevel' in editItem) return editItem.gradeLevel;
    if ('grade' in editItem) return editItem.grade;
    return 'all';
  });
  const [category, setCategory] = useState(() => {
    if (editItem && 'category' in editItem) return editItem.category;
    return 'lesson_design';
  });
  const [subject, setSubject] = useState<string>(() => {
    if (editItem && 'subject' in editItem && editItem.subject) {
      return editItem.subject;
    }
    return 'toan';
  });
  const [tags, setTags] = useState(() => {
    if (!editItem) return '';
    if ('tags' in editItem && Array.isArray(editItem.tags)) return editItem.tags.join(', ');
    if ('targetSkills' in editItem && Array.isArray(editItem.targetSkills)) return editItem.targetSkills.join(', ');
    if ('learningGoals' in editItem && Array.isArray(editItem.learningGoals)) return editItem.learningGoals.join(', ');
    return '';
  });
  const [guideTips, setGuideTips] = useState(() => {
    if (editItem && 'guideTips' in editItem && editItem.guideTips) return editItem.guideTips;
    return '';
  });

  // Storage Image Upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(editItem?.imageUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và mô tả học liệu.');
      return;
    }

    setIsUploading(true);
    let finalImageUrl = imagePreview;

    // Upload to Firebase Storage if a new file was chosen
    if (imageFile) {
      try {
        finalImageUrl = await uploadResourceMedia(imageFile, resourceType);
      } catch (err) {
        console.warn('Firebase Storage upload notice (proceeding with local url):', err);
      }
    }

    const id = editItem ? editItem.id : `res-${Date.now()}`;

    if (resourceType === 'app') {
      const newApp: EducationalApp = {
        id,
        title: title.trim(),
        developer: editItem && 'developer' in editItem ? editItem.developer : 'Giáo viên sáng tạo',
        description: description.trim(),
        category: category as EducationalApp['category'],
        categoryLabel:
          category === 'lesson_design'
            ? 'Thiết kế bài học & Trình chiếu'
            : category === 'assessment'
            ? 'Kiểm tra & Đánh giá'
            : category === 'classroom_mgmt'
            ? 'Quản lý lớp học & Tương tác'
            : category === 'stem_math'
            ? 'Toán & Khoa học số'
            : 'Trợ lý AI giáo viên',
        gradeLevel: grade as EducationalApp['gradeLevel'],
        gradeLabel: grade === 'all' ? 'Toàn cấp Tiểu học' : grade === 'grade_1_2' ? 'Lớp 1 - 2' : 'Lớp 3 - 5',
        url: url.trim() || 'https://violet.vn',
        tags: tags ? tags.split(',').map(t => t.trim()) : ['Học liệu số', 'Tiểu học'],
        features: editItem && 'features' in editItem ? editItem.features : ['Học liệu số lưu trữ đám mây Firebase'],
        guideTips: guideTips.trim() || 'Có thể kết hợp trình chiếu trên bảng thông minh hoặc giao về cho học sinh tự học.',
        imageUrl: finalImageUrl,
        isCustom: true
      };
      onSaveApp(newApp, isEditMode);
      const selectedSubjectObj = PRIMARY_SUBJECTS.find(s => s.id === subject) || {
        id: subject,
        label: subject === 'math' ? 'Toán học' : subject === 'vietnamese' ? 'Tiếng Việt' : subject === 'english' ? 'Tiếng Anh' : 'Toán học'
      };
      const selectedGradeObj = PRIMARY_GRADES.find(g => g.id === grade);
      const gradeLabel = grade === 'all' ? 'Toàn cấp Tiểu học' : (selectedGradeObj ? selectedGradeObj.label : `Lớp ${grade.replace('grade_', '')}`);

      const newGame: InteractiveGame = {
        id,
        title: title.trim(),
        subject: selectedSubjectObj.id,
        subjectLabel: selectedSubjectObj.label,
        grade,
        gradeLabel,
        gameType: editItem && 'gameType' in editItem ? editItem.gameType : 'external',
        gameTypeLabel: editItem && 'gameTypeLabel' in editItem ? editItem.gameTypeLabel : 'Trò chơi tương tác',
        description: description.trim(),
        playMode: editItem && 'playMode' in editItem ? editItem.playMode : 'external',
        externalUrl: url.trim() || 'https://wordwall.net/vi',
        targetSkills: tags ? tags.split(',').map(t => t.trim()) : ['Rèn luyện tư duy', 'Phản xạ tích cực'],
        imageUrl: finalImageUrl,
        isCustom: true
      };
      onSaveGame(newGame, isEditMode);
    } else {
      const selectedSubjectObj = PRIMARY_SUBJECTS.find(s => s.id === subject) || {
        id: subject,
        label: 'Khoa học'
      };
      const selectedGradeObj = PRIMARY_GRADES.find(g => g.id === grade);
      const gradeLabel = grade === 'all' ? 'Toàn cấp Tiểu học' : (selectedGradeObj ? selectedGradeObj.label : `Lớp ${grade.replace('grade_', '')}`);

      const newExp: ScienceExperiment = {
        id,
        title: title.trim(),
        subject: selectedSubjectObj.id,
        subjectLabel: selectedSubjectObj.label,
        topic: editItem && 'topic' in editItem ? editItem.topic : 'experiment',
        topicLabel: selectedSubjectObj.label,
        grade,
        gradeLabel,
        description: description.trim(),
        learningGoals: tags ? tags.split(',').map(t => t.trim()) : ['Khám phá khoa học trực quan'],
        simMode: editItem && 'simMode' in editItem ? editItem.simMode : 'external',
        externalUrl: url.trim() || 'https://phet.colorado.edu/vi/',
        imageUrl: finalImageUrl,
        isCustom: true
      };
      onSaveExperiment(newExp, isEditMode);
    }

    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {isEditMode ? 'CHỈNH SỬA HỌC LIỆU SỐ' : 'BỔ SUNG HỌC LIỆU SỐ (FIREBASE)'}
              </h3>
              <p className="text-xs text-slate-300">
                {isEditMode
                  ? 'Cập nhật nội dung và lưu trữ trực tiếp lên cơ sở dữ liệu đám mây'
                  : 'Thêm ứng dụng, trò chơi hoặc mô phỏng lưu trữ vĩnh viễn trên Firestore'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-200 hover:bg-red-600 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Resource Type Selector (only when adding new) */}
          {!isEditMode && (
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Chọn danh mục học liệu:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setResourceType('app')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    resourceType === 'app'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  1. Kho ứng dụng
                </button>
                <button
                  type="button"
                  onClick={() => setResourceType('game')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    resourceType === 'game'
                      ? 'border-amber-600 bg-amber-50 text-amber-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  2. Trò chơi tương tác
                </button>
                <button
                  type="button"
                  onClick={() => setResourceType('experiment')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    resourceType === 'experiment'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  3. Thí nghiệm mô phỏng
                </button>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Tên học liệu / phần mềm <span className="text-red-500">*</span>:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ví dụ: Bảng cửu chương thông minh, Đố vui Toán học..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Mô tả ngắn gọn & Mục đích sử dụng <span className="text-red-500">*</span>:
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Giới thiệu cách thức sử dụng trong giờ học Tiểu học..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* URL */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Đường dẫn liên kết (Website / Game URL):
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Firebase Storage Image Upload */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Ảnh minh họa (Tải lên Firebase Storage):
            </label>
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-blue-400">
                <Upload className="h-4 w-4 text-blue-600" />
                <span>Chọn ảnh từ máy tính</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={imagePreview}
                    alt="Xem trước ảnh"
                    className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                  />
                  <span className="text-[11px] text-emerald-600 font-semibold">Đã chọn ảnh</span>
                </div>
              )}
            </div>
          </div>

          {/* Classification dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Khối lớp áp dụng:</label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="all">Toàn cấp Tiểu học (Khối 1 - 5)</option>
                {PRIMARY_GRADES.map(g => (
                  <option key={g.id} value={g.id}>
                    Khối {g.label}
                  </option>
                ))}
              </select>
            </div>

            {resourceType === 'app' ? (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Phân loại ứng dụng:</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as EducationalApp['category'])}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="lesson_design">Thiết kế bài học & Trình chiếu</option>
                  <option value="assessment">Kiểm tra & Đánh giá</option>
                  <option value="classroom_mgmt">Quản lý lớp học & Tương tác</option>
                  <option value="stem_math">Toán & Khoa học số</option>
                  <option value="ai_assistant">Trợ lý AI giáo viên</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Môn học tương ứng:</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden"
                >
                  {PRIMARY_SUBJECTS.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Từ khóa / Kỹ năng rèn luyện:
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Tính nhẩm, Trắc nghiệm, Khởi động, Hoạt động nhóm..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Pedagogical Tips (for apps) */}
          {resourceType === 'app' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Gợi ý sư phạm triển khai vào tiết dạy:
              </label>
              <input
                type="text"
                value={guideTips}
                onChange={e => setGuideTips(e.target.value)}
                placeholder="Ví dụ: Sử dụng 5 phút đầu tiết học để khởi động không khí sôi nổi..."
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="rounded-lg border border-slate-300 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-6 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang tải lên...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{isEditMode ? 'Lưu Thay Đổi (Firestore)' : 'Lưu Vào Kho Học Liệu'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
