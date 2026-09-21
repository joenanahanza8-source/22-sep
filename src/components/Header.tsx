import { WheelMode } from '../types';
import { Volume2, VolumeX, Users, Swords, RotateCcw } from 'lucide-react';
import shuttlecockImg from '../assets/images/badminton_shuttlecock_1789983259796.jpg';

interface HeaderProps {
  mode: WheelMode;
  onSelectMode: (mode: WheelMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeCount: number;
  eliminatedCount: number;
  onRestoreAll: () => void;
}

export function Header({
  mode,
  onSelectMode,
  soundEnabled,
  onToggleSound,
  activeCount,
  eliminatedCount,
  onRestoreAll,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/80 shadow-md shadow-indigo-500/30 flex items-center justify-center p-0.5">
              <img
                src={shuttlecockImg}
                alt="แบดมินตัน"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 font-['Kanit',sans-serif]">
                วงล้อสุ่มชื่อผู้เล่น
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-gradient-to-r from-sky-500 to-orange-500 text-white shadow-sm">
                  ทีม A vs B
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                สุ่มแล้วคัดออกอัตโนมัติ • กดที่ลูกแบดเพื่อหมุนวงล้อ
              </p>
            </div>
          </div>

          {/* Sound & Restore buttons on mobile */}
          <div className="flex md:hidden items-center gap-1.5">
            {eliminatedCount > 0 && (
              <button
                type="button"
                onClick={onRestoreAll}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1"
                title="คืนชื่อทั้งหมดเข้าวงล้อ"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition ${
                soundEnabled
                  ? 'bg-slate-800 border-slate-700 text-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mode Selector Pill */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => onSelectMode('ALL')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'ALL'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>รวมทุกทีม (A + B)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('TEAM_A')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'TEAM_A'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-sky-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>เฉพาะทีม A</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('TEAM_B')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'TEAM_B'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-orange-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span>เฉพาะทีม B</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('VERSUS')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'VERSUS'
                ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>โหมดดวลจับคู่ A vs B</span>
          </button>
        </div>

        {/* Right Tools: Sound & Stats */}
        <div className="hidden md:flex items-center gap-3">
          {eliminatedCount > 0 && (
            <button
              id="btn-header-restore-all"
              type="button"
              onClick={onRestoreAll}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="คืนชื่อทั้งหมดเข้าวงล้อ"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>คืนชื่อทั้งหมด ({eliminatedCount})</span>
            </button>
          )}

          <button
            id="btn-toggle-sound"
            type="button"
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-amber-400 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
