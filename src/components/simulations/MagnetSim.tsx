import React, { useState, useRef, useEffect, useCallback } from 'react';
import { soundEffects } from '../../utils/audio';
import { X, Magnet, RotateCcw, Eye, Sparkles, Check, HelpCircle } from 'lucide-react';

interface MagnetSimProps {
  onClose: () => void;
}

interface TestObject {
  id: string;
  name: string;
  isMagnetic: boolean;
  x: number;
  y: number;
  color: string;
  shape: 'nail' | 'paperclip' | 'wood' | 'coin';
  attached: boolean;
}

export const MagnetSim: React.FC<MagnetSimProps> = ({ onClose }) => {
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [magnetStrength, setMagnetStrength] = useState(70); // 30 - 100%
  const [selectedObjId, setSelectedObjId] = useState<string | null>(null);
  const [objects, setObjects] = useState<TestObject[]>([
    { id: 'obj-nail', name: 'Đinh sắt', isMagnetic: true, x: 80, y: 100, color: '#64748b', shape: 'nail', attached: false },
    { id: 'obj-clip', name: 'Kẹp ghim sắt', isMagnetic: true, x: 80, y: 160, color: '#94a3b8', shape: 'paperclip', attached: false },
    { id: 'obj-wood', name: 'Que gỗ', isMagnetic: false, x: 80, y: 220, color: '#b45309', shape: 'wood', attached: false },
    { id: 'obj-coin', name: 'Đồng xu đồng', isMagnetic: false, x: 80, y: 280, color: '#d97706', shape: 'coin', attached: false }
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDragging = useRef(false);
  const draggedObj = useRef<TestObject | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Magnet fixed location on stage
  const magnetPos = { x: 380, y: 200, width: 180, height: 50 };

  const drawStage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Grid pattern
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 2. Magnetic Field Lines (if toggled)
    if (showFieldLines) {
      const poleN = { x: magnetPos.x - magnetPos.width / 2, y: magnetPos.y };
      const poleS = { x: magnetPos.x + magnetPos.width / 2, y: magnetPos.y };

      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      // Draw symmetrical elliptical curves connecting N pole to S pole
      for (let r = 35; r <= 140; r += 28) {
        ctx.beginPath();
        // Upper loop
        ctx.moveTo(poleN.x, poleN.y);
        ctx.bezierCurveTo(poleN.x - r * 0.4, poleN.y - r * 1.5, poleS.x + r * 0.4, poleS.y - r * 1.5, poleS.x, poleS.y);
        ctx.stroke();

        // Lower loop
        ctx.beginPath();
        ctx.moveTo(poleN.x, poleN.y);
        ctx.bezierCurveTo(poleN.x - r * 0.4, poleN.y + r * 1.5, poleS.x + r * 0.4, poleS.y + r * 1.5, poleS.x, poleS.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Central Bar Magnet
    const mx = magnetPos.x - magnetPos.width / 2;
    const my = magnetPos.y - magnetPos.height / 2;
    const halfW = magnetPos.width / 2;

    // North Pole (Red) - Left half
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(mx, my, halfW, magnetPos.height, [8, 0, 0, 8]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', mx + halfW / 2, magnetPos.y);

    // South Pole (Blue) - Right half
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(mx + halfW, my, halfW, magnetPos.height, [0, 8, 8, 0]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('S', mx + halfW + halfW / 2, magnetPos.y);

    // Outer border & shadow
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(mx, my, magnetPos.width, magnetPos.height, 8);
    ctx.stroke();

    // 4. Test Objects
    objects.forEach(obj => {
      ctx.save();
      ctx.translate(obj.x, obj.y);

      if (obj.shape === 'nail') {
        // Draw an iron nail
        ctx.fillStyle = obj.color;
        ctx.fillRect(-4, -14, 8, 28);
        ctx.fillRect(-10, -18, 20, 5); // nail head
        ctx.beginPath();
        ctx.moveTo(-4, 14);
        ctx.lineTo(4, 14);
        ctx.lineTo(0, 22);
        ctx.fill();
      } else if (obj.shape === 'paperclip') {
        // Draw a steel paperclip
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(-8, -14, 16, 28, 6);
        ctx.stroke();
      } else if (obj.shape === 'wood') {
        // Draw a wooden stick
        ctx.fillStyle = obj.color;
        ctx.fillRect(-6, -16, 12, 32);
        ctx.strokeStyle = '#78350f';
        ctx.strokeRect(-6, -16, 12, 32);
      } else if (obj.shape === 'coin') {
        // Draw copper coin
        ctx.fillStyle = obj.color;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Name label under object
      ctx.font = '11px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#334155';
      ctx.textAlign = 'center';
      ctx.fillText(obj.name, 0, 26);

      if (obj.attached) {
        ctx.fillStyle = '#16a34a';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('⚡ Bị hút dính', 0, 40);
      }

      ctx.restore();
    });
  }, [objects, showFieldLines, magnetStrength, magnetPos.height, magnetPos.width, magnetPos.x, magnetPos.y]);

  useEffect(() => {
    drawStage();
  }, [drawStage]);

  // Handle pointer interactions for dragging test objects
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = (e.clientX - rect.left) * scaleX;
    const clientY = (e.clientY - rect.top) * scaleY;

    // Find if clicked on any object
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      const dist = Math.hypot(clientX - obj.x, clientY - obj.y);
      if (dist < 30) {
        isDragging.current = true;
        draggedObj.current = obj;
        dragOffset.current = { x: clientX - obj.x, y: clientY - obj.y };
        setSelectedObjId(obj.id);
        break;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || !draggedObj.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = (e.clientX - rect.left) * scaleX;
    const clientY = (e.clientY - rect.top) * scaleY;

    let targetX = clientX - dragOffset.current.x;
    let targetY = clientY - dragOffset.current.y;

    // Magnetic attraction check
    const currentObj = draggedObj.current;
    if (currentObj.isMagnetic) {
      const poleN = { x: magnetPos.x - magnetPos.width / 2, y: magnetPos.y };
      const poleS = { x: magnetPos.x + magnetPos.width / 2, y: magnetPos.y };

      const distN = Math.hypot(targetX - poleN.x, targetY - poleN.y);
      const distS = Math.hypot(targetX - poleS.x, targetY - poleS.y);

      const captureRadius = 55 * (magnetStrength / 70);

      if (distN < captureRadius) {
        targetX = poleN.x - 12;
        targetY = poleN.y;
        if (!currentObj.attached) {
          soundEffects.playClick();
        }
        currentObj.attached = true;
      } else if (distS < captureRadius) {
        targetX = poleS.x + 12;
        targetY = poleS.y;
        if (!currentObj.attached) {
          soundEffects.playClick();
        }
        currentObj.attached = true;
      } else {
        currentObj.attached = false;
      }
    }

    setObjects(prev =>
      prev.map(o => (o.id === currentObj.id ? { ...o, x: targetX, y: targetY, attached: currentObj.attached } : o))
    );
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    draggedObj.current = null;
  };

  const resetAllObjects = () => {
    setObjects([
      { id: 'obj-nail', name: 'Đinh sắt', isMagnetic: true, x: 80, y: 100, color: '#64748b', shape: 'nail', attached: false },
      { id: 'obj-clip', name: 'Kẹp ghim sắt', isMagnetic: true, x: 80, y: 160, color: '#94a3b8', shape: 'paperclip', attached: false },
      { id: 'obj-wood', name: 'Que gỗ', isMagnetic: false, x: 80, y: 220, color: '#b45309', shape: 'wood', attached: false },
      { id: 'obj-coin', name: 'Đồng xu đồng', isMagnetic: false, x: 80, y: 280, color: '#d97706', shape: 'coin', attached: false }
    ]);
    setSelectedObjId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md">
              <Magnet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">NAM CHÂM VÀ LỰC HÚT TỪ TRƯỜNG</h3>
              <p className="text-xs text-slate-300">Phòng thực nghiệm phân biệt vật liệu từ tính môn Khoa học Tiểu học</p>
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
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="h-auto w-full cursor-grab active:cursor-grabbing touch-none"
              />

              <div className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs text-slate-600 shadow-sm border border-slate-200">
                👆 <strong>Hướng dẫn:</strong> Nhấn giữ và kéo các vật mẫu bên trái lại gần 2 cực của nam châm!
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={resetAllObjects}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Đặt lại vị trí ban đầu
              </button>

              <button
                onClick={() => setShowFieldLines(!showFieldLines)}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  showFieldLines ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                {showFieldLines ? 'Đang bật Đường sức từ' : 'Ẩn Đường sức từ'}
              </button>
            </div>
          </div>

          {/* Right Zone: Control Deck & Pedagogical Deck (30%) */}
          <div className="flex flex-col border-t border-slate-200 bg-white p-5 lg:col-span-4 lg:border-t-0 lg:border-l">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Thông số từ tính & Quan sát
            </h4>

            {/* Slider: Magnet Strength */}
            <div className="mb-5">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Độ mạnh của nam châm:</span>
                <span className="font-mono font-bold text-blue-600 tabular-nums">{magnetStrength}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={magnetStrength}
                onChange={e => setMagnetStrength(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Nam châm yếu</span>
                <span>Tiêu chuẩn</span>
                <span>Nam châm cực mạnh</span>
              </div>
            </div>

            {/* Objects Classification Table */}
            <div className="mb-5 rounded-xl border border-slate-200 p-3 bg-slate-50/50">
              <div className="text-xs font-bold text-slate-700 mb-2">Bảng kiểm tra tương tác:</div>
              <div className="space-y-1.5 text-xs">
                {objects.map(obj => (
                  <div key={obj.id} className="flex items-center justify-between rounded-md bg-white p-2 shadow-2xs">
                    <span className="font-medium text-slate-700">{obj.name}</span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                        obj.isMagnetic ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {obj.isMagnetic ? (
                        <>
                          <Check className="h-3 w-3" /> Hút mạnh
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3" /> Không hút
                        </>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pedagogical Guidance Box */}
            <div className="mt-auto rounded-xl border border-rose-100 bg-rose-50/70 p-3.5 text-xs">
              <div className="mb-1.5 flex items-center gap-1.5 font-bold text-rose-900">
                <HelpCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Kiến thức trọng tâm môn Khoa học:</span>
              </div>
              <ul className="space-y-1 text-slate-700 text-[11px] leading-relaxed">
                <li>• Nam châm có 2 cực: Cực Bắc (N - màu đỏ) và Cực Nam (S - màu xanh).</li>
                <li>• Nam châm chỉ hút các vật làm bằng <strong>sắt, thép, niken</strong> (vật liệu từ tính).</li>
                <li>• Các vật bằng gỗ, nhựa, đồng, vàng, nhôm nam châm <strong>không hút được</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
