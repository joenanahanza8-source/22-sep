import { useState, useId } from 'react';
import { Player, TeamId } from '../types';
import {
  UserPlus,
  RotateCcw,
  Trash2,
  Users,
  UserX,
  FileText,
  Shuffle,
  CheckCircle2,
  ArrowLeftRight,
} from 'lucide-react';

interface PlayerManagementProps {
  players: Player[];
  onAddPlayer: (name: string, team: TeamId) => void;
  onBulkAddPlayers: (names: string[], team: TeamId) => void;
  onRemovePlayer: (id: string) => void;
  onRestorePlayer: (id: string) => void;
  onRestoreAllEliminated: (team?: TeamId) => void;
  onResetAllPlayers: () => void;
  onLoadPreset: () => void;
  onToggleTeam: (id: string) => void;
}

export function PlayerManagement({
  players,
  onAddPlayer,
  onBulkAddPlayers,
  onRemovePlayer,
  onRestorePlayer,
  onRestoreAllEliminated,
  onResetAllPlayers,
  onLoadPreset,
  onToggleTeam,
}: PlayerManagementProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'eliminated' | 'bulk'>('active');
  const [singleName, setSingleName] = useState('');
  const [singleTeam, setSingleTeam] = useState<TeamId>('A');

  // Bulk add state
  const [bulkText, setBulkText] = useState('');
  const [bulkTeam, setBulkTeam] = useState<TeamId>('A');

  const singleInputId = useId();
  const bulkTextareaId = useId();

  const activePlayers = players.filter((p) => !p.isEliminated);
  const eliminatedPlayers = players.filter((p) => p.isEliminated);

  const teamACount = activePlayers.filter((p) => p.team === 'A').length;
  const teamBCount = activePlayers.filter((p) => p.team === 'B').length;
  const eliminatedACount = eliminatedPlayers.filter((p) => p.team === 'A').length;
  const eliminatedBCount = eliminatedPlayers.filter((p) => p.team === 'B').length;

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName.trim()) return;
    onAddPlayer(singleName.trim(), singleTeam);
    setSingleName('');
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;
    // Split by line break or comma
    const names = bulkText
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length > 0) {
      onBulkAddPlayers(names, bulkTeam);
      setBulkText('');
      setActiveTab('active');
    }
  };

  return (
    <div
      id="player-management-panel"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full"
    >
      {/* Quick Add Form */}
      <form onSubmit={handleSingleSubmit} className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor={singleInputId} className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            เพิ่มชื่อผู้เล่นใหม่
          </label>
          {/* Team Switcher for new player */}
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setSingleTeam('A')}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition cursor-pointer ${
                singleTeam === 'A'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ทีม A
            </button>
            <button
              type="button"
              onClick={() => setSingleTeam('B')}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition cursor-pointer ${
                singleTeam === 'B'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ทีม B
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            id={singleInputId}
            type="text"
            value={singleName}
            onChange={(e) => setSingleName(e.target.value)}
            placeholder={`พิมพ์ชื่อผู้เล่นเข้าสู่ ${singleTeam === 'A' ? 'ทีม A' : 'ทีม B'}...`}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
          <button
            id="btn-add-single-player"
            type="submit"
            disabled={!singleName.trim()}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              singleName.trim()
                ? singleTeam === 'A'
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20'
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่ม</span>
          </button>
        </div>
      </form>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 mb-4 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
            activeTab === 'active'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>ในวงล้อ ({activePlayers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('eliminated')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
            activeTab === 'eliminated'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserX className="w-3.5 h-3.5" />
          <span>คัดออกแล้ว ({eliminatedPlayers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bulk')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
            activeTab === 'bulk'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>เพิ่มทีละหลายคน</span>
        </button>
      </div>

      {/* Tab 1: Active Players */}
      {activeTab === 'active' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Subheader with Team Stats */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-sky-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                ทีม A: {teamACount} คน
              </span>
              <span className="text-slate-600">|</span>
              <span className="inline-flex items-center gap-1 text-orange-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                ทีม B: {teamBCount} คน
              </span>
            </div>
            <span className="text-[11px] text-slate-500">รวม {activePlayers.length} คน</span>
          </div>

          {/* List Container */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[320px]">
            {activePlayers.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <p>ยังไม่มีผู้เล่นในวงล้อ</p>
                <p className="text-xs text-slate-600 mt-1">
                  พิมพ์ชื่อด้านบนเพื่อเพิ่ม หรือกู้คืนผู้เล่นที่ถูกคัดออก
                </p>
              </div>
            ) : (
              activePlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between px-3 py-2 bg-slate-950/70 border border-slate-800/70 rounded-xl hover:border-slate-700 transition group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                        player.team === 'A'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                      }`}
                    >
                      ทีม {player.team}
                    </span>
                    <span className="text-sm font-medium text-slate-200 truncate">
                      {player.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle Team */}
                    <button
                      type="button"
                      onClick={() => onToggleTeam(player.id)}
                      title={`ย้ายไปทีม ${player.team === 'A' ? 'B' : 'A'}`}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                    {/* Delete Player */}
                    <button
                      type="button"
                      onClick={() => onRemovePlayer(player.id)}
                      title="ลบผู้เล่นนี้ถาวร"
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Eliminated Players */}
      {activeTab === 'eliminated' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header with Restore All actions */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
              <UserX className="w-3.5 h-3.5 text-rose-400" />
              คัดออกแล้ว {eliminatedPlayers.length} คน
            </span>

            {eliminatedPlayers.length > 0 && (
              <div className="flex gap-1.5">
                <button
                  id="btn-restore-all"
                  type="button"
                  onClick={() => onRestoreAllEliminated()}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 shadow-sm transition cursor-pointer"
                  title="คืนชื่อผู้เล่นที่ถูกคัดออกทั้งหมดกลับเข้าสู่วงล้อ"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>คืนชื่อทั้งหมด</span>
                </button>
              </div>
            )}
          </div>

          {/* Eliminated List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[320px]">
            {eliminatedPlayers.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                <p>ยังไม่มีผู้เล่นโดนคัดออก</p>
                <p className="text-xs text-slate-600 mt-1">
                  เมื่อหมุนวงล้อแล้ว ชื่อที่ถูกเลือกจะมาอยู่ที่นี่
                </p>
              </div>
            ) : (
              eliminatedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-slate-700/80 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 opacity-80 ${
                        player.team === 'A'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                      }`}
                    >
                      ทีม {player.team}
                    </span>
                    <span className="text-sm font-medium text-slate-400 line-through truncate">
                      {player.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onRestorePlayer(player.id)}
                      className="px-2 py-1 text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      title="คืนชื่อกลับเข้าวงล้อ"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>คืนชื่อ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemovePlayer(player.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                      title="ลบถาวร"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Bulk Add */}
      {activeTab === 'bulk' && (
        <form onSubmit={handleBulkSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">วางรายชื่อ (1 บรรทัด หรือคั่นด้วยลูกน้ำ)</span>
            <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setBulkTeam('A')}
                className={`px-2 py-0.5 text-xs font-bold rounded-md transition cursor-pointer ${
                  bulkTeam === 'A'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                เข้าทีม A
              </button>
              <button
                type="button"
                onClick={() => setBulkTeam('B')}
                className={`px-2 py-0.5 text-xs font-bold rounded-md transition cursor-pointer ${
                  bulkTeam === 'B'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                เข้าทีม B
              </button>
            </div>
          </div>

          <textarea
            id={bulkTextareaId}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={5}
            placeholder={`ตัวอย่าง:\nสมชาย\nวิภาดา\nอัครพล\nเกรียงศักดิ์`}
            className="w-full flex-1 bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3 resize-none font-mono"
          />

          <button
            id="btn-confirm-bulk-add"
            type="submit"
            disabled={!bulkText.trim()}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition cursor-pointer"
          >
            บันทึกรายชื่อเข้า {bulkTeam === 'A' ? 'ทีม A' : 'ทีม B'}
          </button>
        </form>
      )}

      {/* Footer Utility Actions */}
      <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <button
          type="button"
          onClick={onLoadPreset}
          className="flex items-center gap-1.5 hover:text-sky-400 transition cursor-pointer"
          title="โหลดรายชื่อเริ่มต้นสำหรับทดสอบ"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>โหลดชื่อตัวอย่าง</span>
        </button>

        <button
          type="button"
          onClick={onResetAllPlayers}
          className="flex items-center gap-1 hover:text-rose-400 transition cursor-pointer"
          title="ลบรายชื่อผู้เล่นทั้งหมด"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>ล้างรายชื่อทั้งหมด</span>
        </button>
      </div>
    </div>
  );
}
