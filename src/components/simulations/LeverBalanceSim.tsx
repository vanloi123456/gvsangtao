import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Scale, RotateCcw, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface LeverBalanceSimProps {
  onClose: () => void;
}

interface WeightItem {
  id: string;
  name: string;
  mass: number; // in kg
  color: string;
}

const AVAILABLE_WEIGHTS: Omit<WeightItem, 'id'>[] = [
  { name: 'Quả cân 1kg', mass: 1, color: '#3b82f6' },
  { name: 'Quả cân 2kg', mass: 2, color: '#10b981' },
  { name: 'Quả cân 5kg', mass: 5, color: '#f59e0b' },
  { name: 'Quả Táo (0.5kg)', mass: 0.5, color: '#ef4444' },
  { name: 'Hộp Quà (3kg)', mass: 3, color: '#8b5cf6' }
];

export const LeverBalanceSim: React.FC<LeverBalanceSimProps> = ({ onClose }) => {
  const [leftPan, setLeftPan] = useState<WeightItem[]>([
    { id: 'l-init', name: 'Hộp Quà (3kg)', mass: 3, color: '#8b5cf6' }
  ]);
  const [rightPan, setRightPan] = useState<WeightItem[]>([
    { id: 'r-init-1', name: 'Quả cân 1kg', mass: 1, color: '#3b82f6' },
    { id: 'r-init-2', name: 'Quả cân 2kg', mass: 2, color: '#10b981' }
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const totalLeft = leftPan.reduce((sum, item) => sum + item.mass, 0);
  const totalRight = rightPan.reduce((sum, item) => sum + item.mass, 0);
  const isBalanced = Math.abs(totalLeft - totalRight) < 0.01;

  const drawScale = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Pivot base in center
    const centerX = w / 2;
    const baseY = h * 0.75;
    const pivotTopY = baseY - 120;

    // Draw sturdy triangle stand
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(centerX, pivotTopY);
    ctx.lineTo(centerX - 40, baseY);
    ctx.lineTo(centerX + 40, baseY);
    ctx.closePath();
    ctx.fill();

    // Base plate
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(centerX - 90, baseY, 180, 16, 6);
    ctx.fill();

    // Calculate beam tilt angle based on weight difference
    // Max tilt is about 0.25 radians (~14 degrees)
    const diff = totalRight - totalLeft;
    const tilt = Math.max(-0.24, Math.min(0.24, diff * 0.06));

    const beamLength = 340;
    const halfBeam = beamLength / 2;

    const leftX = centerX - Math.cos(tilt) * halfBeam;
    const leftY = pivotTopY - Math.sin(tilt) * halfBeam;

    const rightX = centerX + Math.cos(tilt) * halfBeam;
    const rightY = pivotTopY + Math.sin(tilt) * halfBeam;

    // Beam line
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.stroke();

    // Central pivot fulcrum
    ctx.beginPath();
    ctx.arc(centerX, pivotTopY, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    // Draw suspension strings & pans
    const stringLen = 75;

    // Left pan
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(leftX - 35, leftY + stringLen);
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(leftX + 35, leftY + stringLen);
    ctx.stroke();

    // Left pan tray
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(leftX, leftY + stringLen, 46, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Right pan
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rightX, rightY);
    ctx.lineTo(rightX - 35, rightY + stringLen);
    ctx.moveTo(rightX, rightY);
    ctx.lineTo(rightX + 35, rightY + stringLen);
    ctx.stroke();

    // Right pan tray
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(rightX, rightY + stringLen, 46, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw weights stacked on Left pan
    let currentStackY = leftY + stringLen - 4;
    leftPan.forEach(item => {
      const boxW = Math.min(48, 20 + item.mass * 6);
      const boxH = Math.min(24, 12 + item.mass * 3);
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(leftX - boxW / 2, currentStackY - boxH, boxW, boxH, 4);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${item.mass}kg`, leftX, currentStackY - boxH / 2 + 3);

      currentStackY -= boxH + 2;
    });

    // Draw weights stacked on Right pan
    currentStackY = rightY + stringLen - 4;
    rightPan.forEach(item => {
      const boxW = Math.min(48, 20 + item.mass * 6);
      const boxH = Math.min(24, 12 + item.mass * 3);
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(rightX - boxW / 2, currentStackY - boxH, boxW, boxH, 4);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${item.mass}kg`, rightX, currentStackY - boxH / 2 + 3);

      currentStackY -= boxH + 2;
    });
  }, [leftPan, rightPan, totalLeft, totalRight]);

  useEffect(() => {
    drawScale();
  }, [drawScale]);

  const addWeight = (pan: 'left' | 'right', weightDef: Omit<WeightItem, 'id'>) => {
    soundEffects.playClick();
    const newItem: WeightItem = {
      ...weightDef,
      id: `${pan}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    if (pan === 'left') {
      setLeftPan(prev => [...prev, newItem]);
    } else {
      setRightPan(prev => [...prev, newItem]);
    }
  };

  const removeWeight = (pan: 'left' | 'right', id: string) => {
    soundEffects.playClick();
    if (pan === 'left') {
      setLeftPan(prev => prev.filter(i => i.id !== id));
    } else {
      setRightPan(prev => prev.filter(i => i.id !== id));
    }
  };

  const clearPan = (pan: 'left' | 'right') => {
    if (pan === 'left') setLeftPan([]);
    else setRightPan([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">MÔ PHỎNG CÂN ĐĨA THĂNG BẰNG & ĐÒN BẨY</h3>
              <p className="text-xs text-slate-300">Khám phá khái niệm khối lượng và cân bằng toán học Tiểu học</p>
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
                height={380}
                className="h-auto w-full object-contain"
              />

              {/* Equilibrium status badge */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2">
                {isBalanced ? (
                  <div className="flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-300 px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-md">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>CÂN ĐANG THĂNG BẰNG HOÀN HẢO! ({totalLeft}kg = {totalRight}kg)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-full bg-amber-100 border border-amber-300 px-4 py-1.5 text-xs font-bold text-amber-800 shadow-md">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span>
                      {totalLeft > totalRight ? `Đĩa Trái nặng hơn (${totalLeft}kg > ${totalRight}kg)` : `Đĩa Phải nặng hơn (${totalRight}kg > ${totalLeft}kg)`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Math Comparison Bar */}
            <div className="mt-3 flex items-center justify-around rounded-xl bg-white p-3 border border-slate-200 text-xs">
              <div className="text-center">
                <span className="text-slate-500">Khối lượng đĩa Trái:</span>
                <div className="text-lg font-black text-blue-600 tabular-nums">{totalLeft} kg</div>
              </div>
              <div className="text-xl font-bold text-slate-400">
                {totalLeft === totalRight ? '=' : totalLeft > totalRight ? '>' : '<'}
              </div>
              <div className="text-center">
                <span className="text-slate-500">Khối lượng đĩa Phải:</span>
                <div className="text-lg font-black text-blue-600 tabular-nums">{totalRight} kg</div>
              </div>
            </div>
          </div>

          {/* Right Zone: Control Deck & Weights Picker (30%) */}
          <div className="flex flex-col border-t border-slate-200 bg-white p-5 lg:col-span-4 lg:border-t-0 lg:border-l">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Chọn quả cân thêm vào đĩa
            </h4>

            {/* Available Weights buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {AVAILABLE_WEIGHTS.map((w, idx) => (
                <div key={idx} className="flex flex-col gap-1 rounded-lg border border-slate-200 p-2 text-xs bg-slate-50/50">
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span>{w.name}</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => addWeight('left', w)}
                      className="flex-1 rounded bg-blue-50 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 border border-blue-200"
                    >
                      + Trái
                    </button>
                    <button
                      onClick={() => addWeight('right', w)}
                      className="flex-1 rounded bg-emerald-50 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    >
                      + Phải
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Current Weight Breakdown */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {/* Left tray items */}
              <div className="rounded-lg border border-slate-200 p-2.5 text-xs">
                <div className="flex items-center justify-between mb-1.5 font-bold text-blue-900">
                  <span>Vật trên đĩa Trái ({leftPan.length}):</span>
                  {leftPan.length > 0 && (
                    <button onClick={() => clearPan('left')} className="text-[10px] text-red-500 hover:underline">
                      Xóa hết
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {leftPan.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white px-2 py-1 rounded shadow-2xs">
                      <span>{item.name}</span>
                      <button onClick={() => removeWeight('left', item.id)} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {leftPan.length === 0 && <span className="text-slate-400 italic">Đang trống</span>}
                </div>
              </div>

              {/* Right tray items */}
              <div className="rounded-lg border border-slate-200 p-2.5 text-xs">
                <div className="flex items-center justify-between mb-1.5 font-bold text-emerald-900">
                  <span>Vật trên đĩa Phải ({rightPan.length}):</span>
                  {rightPan.length > 0 && (
                    <button onClick={() => clearPan('right')} className="text-[10px] text-red-500 hover:underline">
                      Xóa hết
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {rightPan.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white px-2 py-1 rounded shadow-2xs">
                      <span>{item.name}</span>
                      <button onClick={() => removeWeight('right', item.id)} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {rightPan.length === 0 && <span className="text-slate-400 italic">Đang trống</span>}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  setLeftPan([]);
                  setRightPan([]);
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Dọn sạch cả hai đĩa cân
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
