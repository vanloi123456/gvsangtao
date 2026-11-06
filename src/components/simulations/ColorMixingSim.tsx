import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Palette, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface ColorMixingSimProps {
  onClose: () => void;
}

export const ColorMixingSim: React.FC<ColorMixingSimProps> = ({ onClose }) => {
  const [red, setRed] = useState(255);
  const [green, setGreen] = useState(255);
  const [blue, setBlue] = useState(0); // starts at Red + Green = Yellow!
  const [challenge, setChallenge] = useState<'yellow' | 'cyan' | 'magenta' | 'white'>('yellow');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawMixing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Dark background for optical light visualization
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Coordinate centers for 3 light beams
    const centerX = w / 2;
    const centerY = h / 2 - 10;
    const r = 90;

    const redCenter = { x: centerX - 55, y: centerY - 45 };
    const greenCenter = { x: centerX + 55, y: centerY - 45 };
    const blueCenter = { x: centerX, y: centerY + 55 };

    // Use 'screen' globalCompositeOperation for additive optical mixing!
    ctx.globalCompositeOperation = 'screen';

    // Red Beam
    if (red > 0) {
      const gradR = ctx.createRadialGradient(redCenter.x, redCenter.y, 10, redCenter.x, redCenter.y, r);
      gradR.addColorStop(0, `rgb(${red}, 0, 0)`);
      gradR.addColorStop(1, `rgba(${red}, 0, 0, 0.2)`);
      ctx.fillStyle = gradR;
      ctx.beginPath();
      ctx.arc(redCenter.x, redCenter.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Green Beam
    if (green > 0) {
      const gradG = ctx.createRadialGradient(greenCenter.x, greenCenter.y, 10, greenCenter.x, greenCenter.y, r);
      gradG.addColorStop(0, `rgb(0, ${green}, 0)`);
      gradG.addColorStop(1, `rgba(0, ${green}, 0, 0.2)`);
      ctx.fillStyle = gradG;
      ctx.beginPath();
      ctx.arc(greenCenter.x, greenCenter.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Blue Beam
    if (blue > 0) {
      const gradB = ctx.createRadialGradient(blueCenter.x, blueCenter.y, 10, blueCenter.x, blueCenter.y, r);
      gradB.addColorStop(0, `rgb(0, 0, ${blue})`);
      gradB.addColorStop(1, `rgba(0, 0, ${blue}, 0.2)`);
      ctx.fillStyle = gradB;
      ctx.beginPath();
      ctx.arc(blueCenter.x, blueCenter.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    // Labels for the light sources
    ctx.font = 'bold 13px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';

    ctx.fillStyle = '#f87171';
    ctx.fillText('Đèn Đỏ (Red)', redCenter.x, redCenter.y - r - 8);

    ctx.fillStyle = '#4ade80';
    ctx.fillText('Đèn Lục (Green)', greenCenter.x, greenCenter.y - r - 8);

    ctx.fillStyle = '#60a5fa';
    ctx.fillText('Đèn Lam (Blue)', blueCenter.x, blueCenter.y + r + 24);
  }, [red, green, blue]);

  useEffect(() => {
    drawMixing();
  }, [drawMixing]);

  // Check challenge completion
  const isChallengeDone = (() => {
    if (challenge === 'yellow') return red > 200 && green > 200 && blue < 40;
    if (challenge === 'cyan') return red < 40 && green > 200 && blue > 200;
    if (challenge === 'magenta') return red > 200 && green < 40 && blue > 200;
    if (challenge === 'white') return red > 200 && green > 200 && blue > 200;
    return false;
  })();

  const setPreset = (rVal: number, gVal: number, bVal: number) => {
    soundEffects.playClick();
    setRed(rVal);
    setGreen(gVal);
    setBlue(bVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-md">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">PHÒNG THÍ NGHIỆM PHA TRỘN MÀU SẮC QUANG HỌC</h3>
              <p className="text-xs text-slate-300">Khám phá nguyên lý trộn ánh sáng RGB và sắc màu tự nhiên</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-200 hover:bg-red-600 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2-Zone Sandbox Body */}
        <div className="grid flex-1 overflow-y-auto lg:grid-cols-12">
          {/* Left Zone: Interactive Stage (70%) */}
          <div className="flex flex-col bg-slate-950 p-4 lg:col-span-8">
            <div className="relative overflow-hidden rounded-xl border border-slate-800 shadow-inner">
              <canvas
                ref={canvasRef}
                width={700}
                height={400}
                className="h-auto w-full object-contain"
              />

              {/* Real-time synthesized color preview */}
              <div className="absolute top-4 left-4 flex items-center gap-3 rounded-xl bg-slate-900/90 px-3.5 py-2 border border-slate-700 backdrop-blur-xs">
                <div
                  className="h-7 w-7 rounded-lg shadow-sm border border-white/30"
                  style={{ backgroundColor: `rgb(${red}, ${green}, ${blue})` }}
                />
                <div className="text-xs text-white">
                  <div className="font-semibold text-slate-300">Màu tổng hợp ở tâm:</div>
                  <div className="font-mono text-amber-400 font-bold">rgb({red}, {green}, {blue})</div>
                </div>
              </div>
            </div>

            {/* Quick Color Presets */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Mẫu thử nhanh:</span>
              <button
                onClick={() => setPreset(255, 255, 0)}
                className="rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 hover:bg-amber-500/30 font-medium"
              >
                Đỏ + Lục = Vàng (Yellow)
              </button>
              <button
                onClick={() => setPreset(0, 255, 255)}
                className="rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 hover:bg-cyan-500/30 font-medium"
              >
                Lục + Lam = Xanh lơ (Cyan)
              </button>
              <button
                onClick={() => setPreset(255, 0, 255)}
                className="rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2.5 py-1 hover:bg-pink-500/30 font-medium"
              >
                Đỏ + Lam = Hồng tím (Magenta)
              </button>
              <button
                onClick={() => setPreset(255, 255, 255)}
                className="rounded-md bg-white/20 text-white border border-white/30 px-2.5 py-1 hover:bg-white/30 font-medium"
              >
                Cả 3 đèn = Trắng (White)
              </button>
            </div>
          </div>

          {/* Right Zone: Control Deck & Pedagogical Deck (30%) */}
          <div className="flex flex-col border-t border-slate-200 bg-white p-5 lg:col-span-4 lg:border-t-0 lg:border-l">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Cường độ 3 chùm đèn chiếu (RGB)
            </h4>

            {/* Slider 1: Red */}
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-600">Đèn Đỏ (Red):</span>
                <span className="font-mono font-bold text-rose-600 tabular-nums">{red}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={red}
                onChange={e => setRed(Number(e.target.value))}
                className="w-full accent-rose-600"
              />
            </div>

            {/* Slider 2: Green */}
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-600">Đèn Lục (Green):</span>
                <span className="font-mono font-bold text-emerald-600 tabular-nums">{green}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={green}
                onChange={e => setGreen(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Slider 3: Blue */}
            <div className="mb-5">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-600">Đèn Lam (Blue):</span>
                <span className="font-mono font-bold text-blue-600 tabular-nums">{blue}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={blue}
                onChange={e => setBlue(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Mini Challenge for Pupils */}
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
              <div className="mb-2 font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Nhiệm vụ thử thách cho học sinh:</span>
              </div>
              <div className="mb-2 grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setChallenge('yellow')}
                  className={`py-1 rounded text-[11px] font-semibold border ${challenge === 'yellow' ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-white border-slate-200'}`}
                >
                  Tạo màu Vàng
                </button>
                <button
                  onClick={() => setChallenge('cyan')}
                  className={`py-1 rounded text-[11px] font-semibold border ${challenge === 'cyan' ? 'bg-cyan-100 border-cyan-400 text-cyan-900' : 'bg-white border-slate-200'}`}
                >
                  Tạo màu Xanh lơ
                </button>
                <button
                  onClick={() => setChallenge('magenta')}
                  className={`py-1 rounded text-[11px] font-semibold border ${challenge === 'magenta' ? 'bg-pink-100 border-pink-400 text-pink-900' : 'bg-white border-slate-200'}`}
                >
                  Tạo màu Hồng sen
                </button>
                <button
                  onClick={() => setChallenge('white')}
                  className={`py-1 rounded text-[11px] font-semibold border ${challenge === 'white' ? 'bg-blue-100 border-blue-400 text-blue-900' : 'bg-white border-slate-200'}`}
                >
                  Tạo Ánh sáng trắng
                </button>
              </div>

              {isChallengeDone ? (
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Chính xác! Em đã pha màu thành công!</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic">
                  💡 Hãy kéo chỉnh thanh trượt để tạo ra màu đúng yêu cầu.
                </div>
              )}
            </div>

            {/* Pedagogical Guidance */}
            <div className="mt-auto rounded-xl border border-purple-100 bg-purple-50/70 p-3.5 text-xs">
              <div className="font-bold text-purple-900 mb-1">Kiến thức ứng dụng:</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Màn hình TV, điện thoại thông minh và máy chiếu trường học đều tạo nên mọi màu sắc nhờ 3 điểm ảnh tí hon Đỏ - Lục - Lam (RGB)!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
