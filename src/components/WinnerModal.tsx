import { Player } from '../types';
import { Sparkles, Trophy, RotateCcw, ArrowRight, UserX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WinnerModalProps {
  winner: Player | null;
  roundNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onKeepInWheel: (player: Player) => void;
  onSpinNext: () => void;
  remainingActiveCount: number;
}

export function WinnerModal({
  winner,
  roundNumber,
  isOpen,
  onClose,
  onKeepInWheel,
  onSpinNext,
  remainingActiveCount,
}: WinnerModalProps) {
  if (!isOpen || !winner) return null;

  const isTeamA = winner.team === 'A';

  return (
    <AnimatePresence>
      <div
        id="winner-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      >
        <motion.div
          id="winner-modal-card"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-700/70 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden text-center"
        >
          {/* Background Glow */}
          <div
            className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 ${
              isTeamA ? 'bg-sky-500' : 'bg-orange-500'
            }`}
          />
          <div
            className={`absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30 ${
              isTeamA ? 'bg-indigo-500' : 'bg-rose-500'
            }`}
          />

          {/* Trophy Badge */}
          <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20">
            <Trophy className="w-10 h-10" />
            <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-white animate-bounce" />
          </div>

          <div className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">
            ผู้เล่นที่ถูกสุ่มเลือก (รอบที่ #{roundNumber})
          </div>

          {/* Player Name */}
          <div className="my-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight break-words font-['Kanit',sans-serif]">
              {winner.name}
            </h2>
          </div>

          {/* Team Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border mb-4 shadow-sm bg-slate-800/80">
            <span
              className={`w-3 h-3 rounded-full ${isTeamA ? 'bg-sky-400' : 'bg-orange-500'}`}
            />
            <span className={isTeamA ? 'text-sky-300' : 'text-orange-300'}>
              {isTeamA ? 'ทีม A (Team A)' : 'ทีม B (Team B)'}
            </span>
          </div>

          {/* Elimination Notice */}
          <div className="flex items-center justify-center gap-2 py-2 px-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300 text-xs mb-6">
            <UserX className="w-4 h-4 shrink-0 text-rose-400" />
            <span>คัดออกจากวงล้อแล้ว (จะไม่มีสิทธิ์ถูกสุ่มซ้ำจนกว่าจะคืนชื่อ)</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {remainingActiveCount > 0 ? (
              <button
                id="btn-confirm-spin-next"
                type="button"
                onClick={onSpinNext}
                className="w-full py-3.5 px-5 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-orange-500 hover:from-sky-400 hover:to-orange-400 shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>สุ่มต่อรอบถัดไป</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-all-eliminated-close"
                type="button"
                onClick={onClose}
                className="w-full py-3.5 px-5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                ผู้เล่นในวงล้อถูกคัดออกหมดแล้ว!
              </button>
            )}

            <div className="flex gap-2">
              <button
                id="btn-undo-eliminate"
                type="button"
                onClick={() => onKeepInWheel(winner)}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                title="นำผู้เล่นนี้กลับเข้าวงล้อทันที"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ยกเลิก / เก็บไว้ในวงล้อ</span>
              </button>

              <button
                id="btn-close-winner-modal"
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-transparent hover:bg-slate-800/50 transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
