import React, { useState, useEffect, useRef } from 'react';
import { soundEffects } from '../../utils/audio';
import { Trophy, Clock, CheckCircle2, XCircle, RotateCcw, X, ArrowRight } from 'lucide-react';

interface QuizRelayGameProps {
  onClose: () => void;
}

interface Question {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const PRIMARY_QUESTIONS: Question[] = [
  {
    id: 1,
    subject: 'Toán học - Phép tính nhanh',
    question: 'Kết quả của phép tính: 8 × 7 + 14 là bao nhiêu?',
    options: ['60', '70', '68', '72'],
    correctIndex: 1,
    explanation: 'Ta thực hiện nhân trước: 8 × 7 = 56, sau đó cộng 14: 56 + 14 = 70.'
  },
  {
    id: 2,
    subject: 'Tiếng Việt - Từ ngữ',
    question: 'Từ nào sau đây là từ ĐỒNG NGHĨA với từ "chăm chỉ"?',
    options: ['Cần cù', 'Thông minh', 'Dũng cảm', 'Hiền lành'],
    correctIndex: 0,
    explanation: '"Cần cù" và "chăm chỉ" đều chỉ tính kiên trì, chịu khó làm việc hoặc học tập.'
  },
  {
    id: 3,
    subject: 'Toán học - Phân số cơ bản',
    question: 'Một lớp học có 30 học sinh, trong đó 1/3 số học sinh là học sinh giỏi. Hỏi lớp có bao nhiêu học sinh giỏi?',
    options: ['8 học sinh', '10 học sinh', '12 học sinh', '15 học sinh'],
    correctIndex: 1,
    explanation: 'Số học sinh giỏi là: 30 : 3 = 10 (học sinh).'
  },
  {
    id: 4,
    subject: 'Tự nhiên & Xã hội',
    question: 'Cơ quan nào trong cơ thể người chịu trách nhiệm bơm máu đi nuôi toàn bộ cơ thể?',
    options: ['Dạ dày', 'Phổi', 'Trái tim', 'Bộ não'],
    correctIndex: 2,
    explanation: 'Trái tim hoạt động như một chiếc máy bơm liên tục co bóp để đẩy máu giàu oxy nuôi cơ thể.'
  },
  {
    id: 5,
    subject: 'Tiếng Việt - Biện pháp tu từ',
    question: 'Câu thơ "Mặt trời xuống biển như hòn lửa" sử dụng biện pháp nghệ thuật gì?',
    options: ['Nhân hóa', 'So sánh', 'Điệp từ', 'Đảo ngữ'],
    correctIndex: 1,
    explanation: 'Có từ so sánh "như" liên kết giữa "mặt trời xuống biển" và "hòn lửa".'
  },
  {
    id: 6,
    subject: 'Toán học - Đo lường',
    question: 'Đổi đơn vị: 3 mét 5 đề-xi-mét bằng bao nhiêu xăng-ti-mét (cm)?',
    options: ['350 cm', '305 cm', '35 cm', '3500 cm'],
    correctIndex: 0,
    explanation: '3 m = 300 cm, 5 dm = 50 cm. Vậy 300 + 50 = 350 cm.'
  },
  {
    id: 7,
    subject: 'Khoa học - Đời sống thực vật',
    question: 'Cây xanh hấp thụ khí gì và nhả ra khí gì trong quá trình quang hợp vào ban ngày?',
    options: [
      'Hút khí Oxy, nhả khí Các-bô-níc',
      'Hút khí Các-bô-níc (CO2), nhả khí Oxy (O2)',
      'Hút khí Nitơ, nhả khí Oxy',
      'Chỉ hút nước, không trao đổi khí'
    ],
    correctIndex: 1,
    explanation: 'Dưới ánh sáng mặt trời, lá cây hấp thụ khí CO2 và thải ra khí O2 trong lành cho con người.'
  },
  {
    id: 8,
    subject: 'Kỹ năng sống & Đạo đức',
    question: 'Khi nhận được sự giúp đỡ hoặc quà tặng từ thầy cô, người lớn, em cần làm gì trước tiên?',
    options: [
      'Cầm lấy rồi chạy đi chơi ngay',
      'Khoanh tay lễ phép nói lời cảm ơn',
      'Hỏi người lớn xem quà có đắt tiền không',
      'Lắc đầu im lặng'
    ],
    correctIndex: 1,
    explanation: 'Lễ phép khoanh tay nói lời cảm ơn thể hiện sự biết ơn và nét đẹp văn hóa học sinh Việt Nam.'
  }
];

export const QuizRelayGame: React.FC<QuizRelayGameProps> = ({ onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [isGameOver, setIsGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQ = PRIMARY_QUESTIONS[currentIndex];

  useEffect(() => {
    if (isGameOver || isAnswered) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isAnswered, isGameOver]);

  const handleTimeOut = () => {
    setIsAnswered(true);
    setStreak(0);
    soundEffects.playWrong();
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered || isGameOver) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      soundEffects.playCorrect();
      setScore(s => s + 10 + Math.max(0, Math.floor(timeLeft / 2)));
      setStreak(st => st + 1);
    } else {
      soundEffects.playWrong();
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < PRIMARY_QUESTIONS.length) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(25);
    } else {
      setIsGameOver(true);
      soundEffects.playFanfare();
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setTimeLeft(25);
    setIsGameOver(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 shadow-md">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">THỬ THÁCH ĐUA TÀI TÍNH NHANH</h3>
              <p className="text-xs text-slate-300">Bộ câu hỏi trắc nghiệm tương tác dành cho học sinh Tiểu học</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-200 hover:bg-red-600 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Game Progress Bar & Telemetry */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs">
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <span>
              Câu hỏi: <strong className="text-blue-600 tabular-nums">{currentIndex + 1}</strong> / {PRIMARY_QUESTIONS.length}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>
              Điểm số: <strong className="text-emerald-600 tabular-nums">{score}</strong> điểm
            </span>
            {streak > 1 && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-bold text-amber-600">
                  Chuỗi đúng: {streak} 🔥
                </span>
              </>
            )}
          </div>
          <div className={`flex items-center gap-1.5 font-bold tabular-nums ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
            <Clock className="h-4 w-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Question Canvas or End Screen */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isGameOver ? (
            <div>
              {/* Question metadata */}
              <div className="mb-2 text-xs font-semibold text-blue-600 uppercase tracking-wide">
                {currentQ.subject}
              </div>
              <h2 className="mb-6 text-xl font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h2>

              {/* Options Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = 'border-slate-200 hover:border-blue-400 bg-white text-slate-800';

                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold shadow-xs';
                    } else if (idx === selectedOption) {
                      btnStyle = 'border-red-500 bg-red-50 text-red-900 font-semibold';
                    } else {
                      btnStyle = 'border-slate-200 opacity-60 bg-white text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all text-sm font-medium ${btnStyle}`}
                    >
                      <span className="flex-1">{opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 ml-2" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <XCircle className="h-5 w-5 text-red-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Explanation */}
              {isAnswered && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 animate-in fade-in">
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-700">
                    {selectedOption === currentQ.correctIndex ? '✅ Chính xác!' : '💡 Lời giải thích:'}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={nextQuestion}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      {currentIndex + 1 < PRIMARY_QUESTIONS.length ? 'Câu tiếp theo' : 'Xem kết quả chung cuộc'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100 text-amber-500">
                <Trophy className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">HOÀN THÀNH THỬ THÁCH!</h2>
              <p className="mt-2 text-sm text-slate-600">
                Chúc mừng em đã hoàn thành tất cả {PRIMARY_QUESTIONS.length} câu đố vui.
              </p>
              <div className="mx-auto my-6 max-w-xs rounded-xl bg-slate-100 p-4">
                <div className="text-xs text-slate-500 uppercase font-semibold">Tổng điểm đạt được:</div>
                <div className="text-3xl font-black text-blue-600 tabular-nums">{score} Điểm</div>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={restartQuiz}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  <RotateCcw className="h-4 w-4" /> Chơi Lại Từ Đầu
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-slate-300 px-6 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Đóng Trò Chơi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
