import React, { useState, useEffect } from 'react';
import { soundEffects } from '../../utils/audio';
import { Trophy, RotateCcw, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface CardMatchGameProps {
  onClose: () => void;
}

interface CardItem {
  id: string;
  pairId: number;
  text: string;
  subtext?: string;
  color: string;
}

const MATH_PAIRS = [
  { pairId: 1, a: '6 × 7', b: '42' },
  { pairId: 2, a: '9 × 8', b: '72' },
  { pairId: 3, a: '54 : 6', b: '9' },
  { pairId: 4, a: '1/2 của 20', b: '10' },
  { pairId: 5, a: '15 × 4', b: '60' },
  { pairId: 6, a: '100 - 35', b: '65' }
];

const VIETNAMESE_PAIRS = [
  { pairId: 1, a: 'Dũng cảm', b: 'Gan dạ' },
  { pairId: 2, a: 'Thật thà', b: 'Trung thực' },
  { pairId: 3, a: 'Chăm chỉ', b: 'Siêng năng' },
  { pairId: 4, a: 'Sáng tạo', b: 'Tìm tòi điều mới' },
  { pairId: 5, a: 'Nhân hậu', b: 'Yêu thương con người' },
  { pairId: 6, a: 'Kiên trì', b: 'Không bỏ cuộc' }
];

export const CardMatchGame: React.FC<CardMatchGameProps> = ({ onClose }) => {
  const [topic, setTopic] = useState<'math' | 'vietnamese'>('math');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Initialize or shuffle deck
  useEffect(() => {
    const rawPairs = topic === 'math' ? MATH_PAIRS : VIETNAMESE_PAIRS;
    const deck: CardItem[] = [];

    rawPairs.forEach((pair, idx) => {
      const colors = ['#0284c7', '#059669', '#d97706', '#9333ea', '#dc2626', '#0891b2'];
      const color = colors[idx % colors.length];
      deck.push({
        id: `${pair.pairId}-a`,
        pairId: pair.pairId,
        text: pair.a,
        subtext: topic === 'math' ? 'Phép tính' : 'Từ ngữ',
        color
      });
      deck.push({
        id: `${pair.pairId}-b`,
        pairId: pair.pairId,
        text: pair.b,
        subtext: topic === 'math' ? 'Kết quả' : 'Đồng nghĩa',
        color
      });
    });

    // Shuffle deck
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedPairIds([]);
    setMoves(0);
    setIsWon(false);
  }, [topic]);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length >= 2 || flippedIndices.includes(index)) return;
    const card = cards[index];
    if (matchedPairIds.includes(card.pairId)) return;

    soundEffects.playClick();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const first = cards[newFlipped[0]];
      const second = cards[newFlipped[1]];

      if (first.pairId === second.pairId) {
        // Match!
        setTimeout(() => {
          soundEffects.playCorrect();
          setMatchedPairIds(prev => {
            const next = [...prev, first.pairId];
            if (next.length === (topic === 'math' ? MATH_PAIRS.length : VIETNAMESE_PAIRS.length)) {
              setIsWon(true);
              soundEffects.playFanfare();
            }
            return next;
          });
          setFlippedIndices([]);
        }, 500);
      } else {
        // No match, flip back
        setTimeout(() => {
          soundEffects.playWrong();
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const restart = () => {
    const rawPairs = topic === 'math' ? MATH_PAIRS : VIETNAMESE_PAIRS;
    const deck: CardItem[] = [];
    rawPairs.forEach((pair, idx) => {
      const colors = ['#0284c7', '#059669', '#d97706', '#9333ea', '#dc2626', '#0891b2'];
      const color = colors[idx % colors.length];
      deck.push({ id: `${pair.pairId}-a`, pairId: pair.pairId, text: pair.a, color });
      deck.push({ id: `${pair.pairId}-b`, pairId: pair.pairId, text: pair.b, color });
    });
    setCards([...deck].sort(() => Math.random() - 0.5));
    setFlippedIndices([]);
    setMatchedPairIds([]);
    setMoves(0);
    setIsWon(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">GHÉP THẺ TRI THỨC THÔNG THÁI</h3>
              <p className="text-xs text-slate-300">Rèn luyện trí nhớ, phản xạ liên kết kiến thức toán & tiếng Việt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-200 hover:bg-red-600 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Controls & Mode selection */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setTopic('math')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${topic === 'math' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Toán học (Phép tính & Đáp án)
            </button>
            <button
              onClick={() => setTopic('vietnamese')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${topic === 'vietnamese' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Tiếng Việt (Từ đồng nghĩa)
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span>
              Số lượt mở: <strong className="text-blue-600 tabular-nums">{moves}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>
              Cặp đã ghép: <strong className="text-emerald-600 tabular-nums">{matchedPairIds.length}</strong> / 6
            </span>
            <button
              onClick={restart}
              className="flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Chơi lại
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isWon ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3.5">
              {cards.map((card, idx) => {
                const isFlipped = flippedIndices.includes(idx);
                const isMatched = matchedPairIds.includes(card.pairId);

                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    disabled={isMatched}
                    className={`relative flex h-28 flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-300 shadow-sm border-2 ${
                      isMatched
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-900 cursor-default opacity-80'
                        : isFlipped
                        ? 'border-blue-500 bg-white text-slate-900 shadow-md scale-102'
                        : 'border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 hover:border-slate-300 hover:shadow'
                    }`}
                  >
                    {isFlipped || isMatched ? (
                      <>
                        <span className="text-sm sm:text-base font-bold leading-tight">{card.text}</span>
                        {card.subtext && (
                          <span className="mt-1 text-[10px] text-slate-400 font-medium">{card.subtext}</span>
                        )}
                        {isMatched && (
                          <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-emerald-500" />
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Sparkles className="h-6 w-6 opacity-40 mb-1" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">?</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center animate-in fade-in">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100 text-amber-500">
                <Trophy className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">XUẤT SẮC! ĐÃ GHÉP ĐỦ CÁC CẶP THẺ!</h2>
              <p className="mt-2 text-sm text-slate-600">
                Em đã hoàn thành thử thách chỉ sau <strong className="text-blue-600">{moves}</strong> lượt lật thẻ.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={restart}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  <RotateCcw className="h-4 w-4" /> Chơi Lượt Mới
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
