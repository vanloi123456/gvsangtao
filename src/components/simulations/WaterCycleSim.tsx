import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Thermometer, Sun, Wind, CloudRain, Info } from 'lucide-react';

interface WaterCycleSimProps {
  onClose: () => void;
}

export const WaterCycleSim: React.FC<WaterCycleSimProps> = ({ onClose }) => {
  const [temperature, setTemperature] = useState(30); // 15 to 45 deg C
  const [sunIntensity, setSunIntensity] = useState(70); // 20 to 100%
  const [windSpeed, setWindSpeed] = useState(3); // 1 to 6
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeStage, setActiveStage] = useState<'all' | 'evaporation' | 'condensation' | 'precipitation' | 'runoff'>('all');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  // Particles for evaporation and rain
  const vaporParticles = useRef<{ x: number; y: number; speedY: number; size: number; alpha: number }[]>([]);
  const rainDrops = useRef<{ x: number; y: number; speedY: number; len: number }[]>([]);

  useEffect(() => {
    // Initialize particles
    vaporParticles.current = Array.from({ length: 30 }, () => ({
      x: 180 + Math.random() * 260,
      y: 280 + Math.random() * 60,
      speedY: 0.8 + Math.random() * 1.2,
      size: 2 + Math.random() * 3,
      alpha: 0.3 + Math.random() * 0.5
    }));

    rainDrops.current = Array.from({ length: 45 }, () => ({
      x: 420 + Math.random() * 220,
      y: 90 + Math.random() * 150,
      speedY: 4 + Math.random() * 3,
      len: 8 + Math.random() * 6
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Sky background gradient (dependent on sun & clouds)
      const skyGradient = ctx.createLinearGradient(0, 0, 0, h * 0.65);
      if (temperature > 32) {
        skyGradient.addColorStop(0, '#bae6fd');
        skyGradient.addColorStop(1, '#e0f2fe');
      } else {
        skyGradient.addColorStop(0, '#93c5fd');
        skyGradient.addColorStop(1, '#dbeafe');
      }
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, w, h);

      // 2. Sun (top-left) with rays
      const sunX = 100;
      const sunY = 70;
      const sunRadius = 28 + (sunIntensity / 100) * 8;

      ctx.save();
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius + Math.sin(time * 3) * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 20;
      ctx.fill();

      // Rays
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + time * 0.5;
        const x1 = sunX + Math.cos(angle) * (sunRadius + 6);
        const y1 = sunY + Math.sin(angle) * (sunRadius + 6);
        const x2 = sunX + Math.cos(angle) * (sunRadius + 16);
        const y2 = sunY + Math.sin(angle) * (sunRadius + 16);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Mountains on right
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(380, h * 0.65);
      ctx.lineTo(520, 110);
      ctx.lineTo(650, h * 0.65);
      ctx.fill();

      // Snow cap
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(520, 110);
      ctx.lineTo(485, 160);
      ctx.lineTo(555, 160);
      ctx.closePath();
      ctx.fill();

      // Fore mountain
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(460, h * 0.65);
      ctx.lineTo(580, 150);
      ctx.lineTo(700, h * 0.65);
      ctx.fill();

      // Green hills & terrain
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.65);
      ctx.bezierCurveTo(150, h * 0.62, 300, h * 0.66, 450, h * 0.64);
      ctx.lineTo(450, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // 4. Ocean on the left/middle
      const oceanGrad = ctx.createLinearGradient(0, h * 0.68, 0, h);
      oceanGrad.addColorStop(0, '#0284c7');
      oceanGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.68);
      for (let x = 0; x <= 380; x += 20) {
        const waveY = h * 0.68 + Math.sin(x * 0.04 + time * 3) * 3;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(380, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // 5. River flowing from mountains to ocean
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(540, 240);
      ctx.quadraticCurveTo(460, 280, 340, h * 0.68 + 10);
      ctx.stroke();

      // 6. Evaporating water vapor particles
      if (isPlaying && (activeStage === 'all' || activeStage === 'evaporation')) {
        const evapSpeedFactor = (temperature / 30) * (sunIntensity / 70);
        ctx.fillStyle = '#38bdf8';
        vaporParticles.current.forEach(p => {
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y -= p.speedY * evapSpeedFactor;
          p.x += Math.sin(time + p.y * 0.05) * 0.5 + (windSpeed * 0.2);

          // Reset when reaching cloud level
          if (p.y < 120) {
            p.y = 290 + Math.random() * 40;
            p.x = 80 + Math.random() * 260;
          }
        });
        ctx.globalAlpha = 1;
      }

      // 7. Clouds (formed by condensation)
      const cloudAlpha = Math.min(1, 0.5 + (temperature / 50) * 0.5);
      const isDarkRainCloud = temperature > 26;
      ctx.fillStyle = isDarkRainCloud ? `rgba(100, 116, 139, ${cloudAlpha})` : `rgba(241, 245, 249, ${cloudAlpha})`;

      // Cloud over mountains
      const cloudX = 490 + Math.sin(time * 0.4) * (windSpeed * 6);
      const cloudY = 90;
      ctx.beginPath();
      ctx.arc(cloudX - 40, cloudY, 32, 0, Math.PI * 2);
      ctx.arc(cloudX, cloudY - 14, 40, 0, Math.PI * 2);
      ctx.arc(cloudX + 44, cloudY, 30, 0, Math.PI * 2);
      ctx.arc(cloudX + 80, cloudY + 5, 24, 0, Math.PI * 2);
      ctx.fill();

      // 8. Rain precipitation falling from cloud onto mountains
      if (isPlaying && (activeStage === 'all' || activeStage === 'precipitation')) {
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        rainDrops.current.forEach(r => {
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x - windSpeed * 0.8, r.y + r.len);
          ctx.stroke();

          r.y += r.speedY;
          r.x -= windSpeed * 0.2;

          if (r.y > h * 0.65) {
            r.y = cloudY + 25 + Math.random() * 20;
            r.x = cloudX - 50 + Math.random() * 150;
          }
        });
      }

      // Educational Stage Labels overlay on canvas
      ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#0f172a';

      // Stage 1 label
      ctx.fillStyle = '#0369a1';
      ctx.fillText('1. Bốc hơi (Evaporation)', 90, 240);

      // Stage 2 label
      ctx.fillStyle = '#1e293b';
      ctx.fillText('2. Ngưng tụ (Condensation)', 420, 60);

      // Stage 3 label
      ctx.fillStyle = '#0284c7';
      ctx.fillText('3. Mưa rơi (Precipitation)', 540, 190);

      // Stage 4 label
      ctx.fillStyle = '#15803d';
      ctx.fillText('4. Dòng chảy & Thấm hút (Runoff)', 250, h * 0.76);

      if (isPlaying) {
        animRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [temperature, sunIntensity, windSpeed, isPlaying, activeStage]);

  const resetParams = () => {
    setTemperature(30);
    setSunIntensity(70);
    setWindSpeed(3);
    setActiveStage('all');
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 shadow-md">
              <CloudRain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">MÔ PHỎNG VÒNG TUẦN HOÀN CỦA NƯỚC</h3>
              <p className="text-xs text-slate-300">Phòng thí nghiệm tương tác trực quan môn Khoa học Tiểu học</p>
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
          <div className="flex flex-col bg-slate-900/5 p-4 lg:col-span-8">
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner">
              <canvas
                ref={canvasRef}
                width={700}
                height={400}
                className="h-auto w-full object-contain"
              />

              {/* Status indicator badge */}
              <div className="absolute top-3 right-3 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 shadow-sm text-xs font-semibold text-slate-700 backdrop-blur-xs">
                <span className={`h-2.5 w-2.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{isPlaying ? 'Mô phỏng đang chạy' : 'Tạm dừng'}</span>
              </div>
            </div>

            {/* Playback Controls & Stage Selector */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? 'Tạm dừng' : 'Tiếp tục'}
                </button>
                <button
                  onClick={resetParams}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Đặt lại
                </button>
              </div>

              {/* Guided Stage Selector */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setActiveStage('all')}
                  className={`px-2.5 py-1 rounded font-medium ${activeStage === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Toàn chu trình
                </button>
                <button
                  onClick={() => setActiveStage('evaporation')}
                  className={`px-2.5 py-1 rounded font-medium ${activeStage === 'evaporation' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  1. Bốc hơi
                </button>
                <button
                  onClick={() => setActiveStage('precipitation')}
                  className={`px-2.5 py-1 rounded font-medium ${activeStage === 'precipitation' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  2. Mưa rơi
                </button>
              </div>
            </div>
          </div>

          {/* Right Zone: Control Deck & Pedagogical Deck (30%) */}
          <div className="flex flex-col border-t border-slate-200 bg-white p-5 lg:col-span-4 lg:border-t-0 lg:border-l">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Bảng điều khiển thông số thí nghiệm
            </h4>

            {/* Slider 1: Temperature */}
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Thermometer className="h-4 w-4 text-rose-500" /> Nhiệt độ môi trường:
                </span>
                <span className="font-mono font-bold text-blue-600 tabular-nums">{temperature}°C</span>
              </div>
              <input
                type="range"
                min="15"
                max="45"
                value={temperature}
                onChange={e => setTemperature(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>15°C (Mát mẻ)</span>
                <span>30°C (Tiêu chuẩn)</span>
                <span>45°C (Nắng gắt)</span>
              </div>
            </div>

            {/* Slider 2: Sun Intensity */}
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Sun className="h-4 w-4 text-amber-500" /> Cường độ bức xạ Mặt Trời:
                </span>
                <span className="font-mono font-bold text-amber-600 tabular-nums">{sunIntensity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={sunIntensity}
                onChange={e => setSunIntensity(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Râm mát</span>
                <span>Nắng vừa</span>
                <span>Nắng chói chang</span>
              </div>
            </div>

            {/* Slider 3: Wind Speed */}
            <div className="mb-5">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Wind className="h-4 w-4 text-cyan-600" /> Tốc độ gió thổi mây:
                </span>
                <span className="font-mono font-bold text-cyan-600 tabular-nums">Cấp {windSpeed}</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                value={windSpeed}
                onChange={e => setWindSpeed(Number(e.target.value))}
                className="w-full accent-cyan-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Gió nhẹ</span>
                <span>Gió trung bình</span>
                <span>Gió mạnh</span>
              </div>
            </div>

            {/* Pedagogical Guidance Box */}
            <div className="mt-auto rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs">
              <div className="mb-1.5 flex items-center gap-1.5 font-bold text-blue-900">
                <Info className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Gợi ý hướng dẫn học sinh:</span>
              </div>
              <ul className="space-y-1 text-slate-700 text-[11px] leading-relaxed">
                <li>• Kéo tăng nhiệt độ lên 40°C: Giải thích tại sao ngày nắng to nước ao hồ cạn nhanh hơn (bốc hơi nhanh).</li>
                <li>• Khí nước bốc lên cao gặp lạnh ngưng tụ thành từng đám mây tích điện.</li>
                <li>• Khi mây nặng hạt tích tụ đủ nhiều, nước rơi xuống thành mưa nuôi dưỡng cây cối và đổ về sông ngòi.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
