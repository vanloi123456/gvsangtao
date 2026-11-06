import React, { useState, useRef, useEffect, useCallback } from 'react';
import { soundEffects } from '../../utils/audio';
import { RotateCw, Trophy, Plus, Trash2, Volume2, VolumeX, Sparkles, X } from 'lucide-react';

interface WheelGameProps {
  onClose: () => void;
}

const PRESET_LISTS = {
  students: [
    'Bảo An', 'Minh Khôi', 'Ngọc Ánh', 'Tuấn Kiệt',
    'Gia Hân', 'Đức Trọng', 'Phương Linh', 'Hoàng Nam',
    'Khánh Vy', 'Quốc Bảo', 'Hương Giang', 'Nhật Minh'
  ],
  challenges: [
    'Hát 1 bài thiếu nhi', 'Tính nhẩm: 8 × 7 = ?', 'Kể tên 3 động vật ăn cỏ',
    'Nhảy lò cò 5 nhịp', '1 tràng pháo tay cả lớp!', 'Đọc 1 khổ thơ em thích',
    'Tính nhẩm: 63 : 9 = ?', 'Kể việc tốt em đã làm'
  ],
  rewards: [
    '⭐ +10 Điểm Sao', '🍬 1 Phần quà nhỏ', '👏 Pháo tay khen ngợi',
    '👑 Làm Quản ca tiết này', '⭐ +5 Điểm Sao', '🎯 Thêm 1 lượt quay'
  ]
};

const COLORS = [
  '#0284c7', '#0d9488', '#16a34a', '#ca8a04',
  '#ea580c', '#e11d48', '#9333ea', '#4f46e5',
  '#0891b2', '#059669', '#d97706', '#c026d3'
];

export const WheelGame: React.FC<WheelGameProps> = ({ onClose }) => {
  const [items, setItems] = useState<string[]>(PRESET_LISTS.students);
  const [newItem, setNewItem] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<'students' | 'challenges' | 'rewards'>('students');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentRotation = useRef(0);
  const spinVelocity = useRef(0);
  const animFrameId = useRef<number | null>(null);
  const lastSliceIndex = useRef(-1);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    ctx.clearRect(0, 0, width, height);

    if (items.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Thêm danh sách để quay', centerX, centerY);
      return;
    }

    const arc = (Math.PI * 2) / items.length;

    // Draw slices
    items.forEach((item, index) => {
      const angle = currentRotation.current + index * arc;
      ctx.beginPath();
      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Outer rim edge
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px "Be Vietnam Pro", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;

      const maxTextLen = 16;
      const displayStr = item.length > maxTextLen ? item.slice(0, maxTextLen - 2) + '...' : item;
      ctx.fillText(displayStr, radius - 24, 5);
      ctx.restore();
    });

    // Central hub ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, 36, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // Sound ticking detection during spin
    const currentAngleNorm = (Math.PI * 2 - (currentRotation.current % (Math.PI * 2))) % (Math.PI * 2);
    const activeSlice = Math.floor(currentAngleNorm / arc) % items.length;
    if (activeSlice !== lastSliceIndex.current && isSpinning) {
      lastSliceIndex.current = activeSlice;
      if (soundOn) {
        soundEffects.playWheelTick();
      }
    }
  }, [items, isSpinning, soundOn]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  const spin = () => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);
    setWinner(null);
    soundEffects.playClick();

    // Random initial spin impulse (between 0.22 and 0.38 radians per frame)
    const initialVel = 0.24 + Math.random() * 0.15;
    spinVelocity.current = initialVel;
    const deceleration = 0.988 + Math.random() * 0.004;

    const animate = () => {
      currentRotation.current += spinVelocity.current;
      spinVelocity.current *= deceleration;

      drawWheel();

      if (spinVelocity.current > 0.0015) {
        animFrameId.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Determine winning slice (the slice located at 3 o'clock / pointer on right)
        const arc = (Math.PI * 2) / items.length;
        // Pointer is at angle 0 (right edge / 3 o'clock)
        const normalizedAngle = (Math.PI * 2 - (currentRotation.current % (Math.PI * 2))) % (Math.PI * 2);
        const winningIndex = Math.floor(normalizedAngle / arc) % items.length;
        const selected = items[winningIndex];
        setWinner(selected);
        if (soundOn) {
          soundEffects.playFanfare();
        }
      }
    };

    animFrameId.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, []);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setItems(prev => [...prev, newItem.trim()]);
    setNewItem('');
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 2) {
      alert('Vòng quay cần có tối thiểu 2 mục để hoạt động.');
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const applyPreset = (key: 'students' | 'challenges' | 'rewards') => {
    setSelectedPreset(key);
    setItems(PRESET_LISTS[key]);
    setWinner(null);
  };

  const removeWinnerAndContinue = () => {
    if (winner && items.includes(winner)) {
      setItems(items.filter(item => item !== winner));
    }
    setWinner(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-md">
              <RotateCw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">VÒNG QUAY MAY MẮN LỚP HỌC</h3>
              <p className="text-xs text-slate-300">Công cụ gọi tên ngẫu nhiên & tạo hứng thú trong tiết dạy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !soundOn;
                setSoundOn(next);
                soundEffects.setSoundEnabled(next);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
              title={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-200 hover:bg-red-600 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="grid flex-1 overflow-y-auto md:grid-cols-12">
          {/* Wheel Stage */}
          <div className="relative flex flex-col items-center justify-center bg-slate-50 p-6 md:col-span-7">
            {/* Pointer arrow on right pointing left into circle */}
            <div className="relative flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={380}
                height={380}
                className="max-h-[360px] max-w-[360px] rounded-full drop-shadow-xl"
              />
              {/* Pointer Triangle at 3 o'clock */}
              <div
                className="pointer-events-none absolute right-[-10px] top-1/2 -translate-y-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '16px solid transparent',
                  borderBottom: '16px solid transparent',
                  borderRight: '30px solid #ef4444',
                  filter: 'drop-shadow(-2px 1px 3px rgba(0,0,0,0.3))'
                }}
              />
            </div>

            {/* Spin CTA Button */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <button
                onClick={spin}
                disabled={isSpinning || items.length === 0}
                className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCw className={`h-5 w-5 ${isSpinning ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
                {isSpinning ? 'Đang quay may mắn...' : 'QUAY NGAY'}
              </button>
              <span className="text-xs text-slate-500">Nhấn để vòng quay ngẫu nhiên bắt đầu</span>
            </div>
          </div>

          {/* Configuration and Presets */}
          <div className="flex flex-col border-t border-slate-200 bg-white p-5 md:col-span-5 md:border-t-0 md:border-l">
            {/* Presets switcher */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Mẫu danh sách sẵn có:
              </label>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => applyPreset('students')}
                  className={`rounded-md py-1.5 font-medium transition-colors ${selectedPreset === 'students' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Tên học sinh
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('challenges')}
                  className={`rounded-md py-1.5 font-medium transition-colors ${selectedPreset === 'challenges' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Câu đố vui
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('rewards')}
                  className={`rounded-md py-1.5 font-medium transition-colors ${selectedPreset === 'rewards' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Khen thưởng
                </button>
              </div>
            </div>

            {/* Add new entry input */}
            <form onSubmit={handleAddItem} className="mb-3 flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                placeholder="Nhập tên hoặc câu hỏi..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" /> Thêm
              </button>
            </form>

            {/* Item list */}
            <div className="flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs">
              <div className="mb-2 flex items-center justify-between px-1 text-slate-500">
                <span>Số lượng mục: <strong>{items.length}</strong></span>
                <span className="text-[11px] text-slate-400">Tối thiểu 2 mục</span>
              </div>
              <div className="space-y-1.5">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md bg-white px-2.5 py-1.5 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="truncate font-medium text-slate-700">{item}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-red-500"
                      title="Xóa mục"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Winner Celebration Modal */}
        {winner && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="animate-in fade-in zoom-in-95 relative max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                <Trophy className="h-8 w-8" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                CHÚC MỪNG PHẦN THƯỞNG / KẾT QUẢ:
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">{winner}</h2>
              <p className="mt-2 text-xs text-slate-500">
                Xin chúc mừng em đã được chọn! Thầy cô có thể trao quyền phát biểu hoặc phần thưởng.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setWinner(null)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <RotateCw className="h-3.5 w-3.5" /> Quay Lại
                </button>
                <button
                  onClick={removeWinnerAndContinue}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Bỏ Mục Này & Quay Tiếp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
