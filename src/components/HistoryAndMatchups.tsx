import { Player, MatchupRecord, WheelMode } from '../types';
import { History, Swords, RotateCcw, Clock } from 'lucide-react';

interface HistoryAndMatchupsProps {
  mode: WheelMode;
  eliminatedPlayers: Player[];
  matchups: MatchupRecord[];
  onRestorePlayer: (id: string) => void;
  pendingDuelA: Player | null;
  pendingDuelB: Player | null;
  onClearMatchups: () => void;
}

export function HistoryAndMatchups({
  mode,
  eliminatedPlayers,
  matchups,
  onRestorePlayer,
  pendingDuelA,
  pendingDuelB,
  onClearMatchups,
}: HistoryAndMatchupsProps) {
  const isVersus = mode === 'VERSUS';

  return (
    <div
      id="history-matchups-card"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isVersus ? (
            <Swords className="w-4 h-4 text-rose-400" />
          ) : (
            <History className="w-4 h-4 text-indigo-400" />
          )}
          <h3 className="text-sm font-bold text-slate-200">
            {isVersus ? 'การจับคู่ดวล (Matchups A vs B)' : 'ประวัติการสุ่ม & คัดออก'}
          </h3>
        </div>

        {isVersus && matchups.length > 0 && (
          <button
            type="button"
            onClick={onClearMatchups}
            className="text-xs text-slate-500 hover:text-rose-400 transition cursor-pointer"
          >
            ล้างผลจับคู่
          </button>
        )}
      </div>

      {/* If in Versus Mode: Display Active Duel Status */}
      {isVersus && (
        <div className="mb-4 p-3 bg-slate-950 border border-slate-800 rounded-xl">
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>คู่ดวลปัจจุบัน:</span>
            <span className="text-[11px] text-indigo-400">
              {pendingDuelA && !pendingDuelB
                ? 'รอสุ่มตัวแทนทีม B...'
                : !pendingDuelA
                ? 'เริ่มสุ่มตัวแทนทีม A'
                : 'จับคู่เรียบร้อย!'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Team A candidate */}
            <div
              className={`flex-1 p-2.5 rounded-lg border text-center transition ${
                pendingDuelA
                  ? 'bg-sky-500/10 border-sky-500/40 text-sky-200'
                  : 'bg-slate-900 border-dashed border-slate-800 text-slate-500'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-sky-400">ทีม A</div>
              <div className="text-sm font-bold truncate">
                {pendingDuelA ? pendingDuelA.name : 'ยังไม่เลือก'}
              </div>
            </div>

            <span className="font-black text-xs text-slate-600">VS</span>

            {/* Team B candidate */}
            <div
              className={`flex-1 p-2.5 rounded-lg border text-center transition ${
                pendingDuelB
                  ? 'bg-orange-500/10 border-orange-500/40 text-orange-200'
                  : 'bg-slate-900 border-dashed border-slate-800 text-slate-500'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-orange-400">ทีม B</div>
              <div className="text-sm font-bold truncate">
                {pendingDuelB ? pendingDuelB.name : 'ยังไม่เลือก'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content List: Either Matchup Pairs or Elimination History */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[220px] pr-1">
        {isVersus ? (
          matchups.length === 0 ? (
            <div className="text-center py-6 text-slate-600 text-xs">
              ยังไม่มีคู่ที่จับสำเร็จ สุ่มผู้เล่นทีม A และ ทีม B เพื่อบันทึกคู่แข่งขัน
            </div>
          ) : (
            matchups.map((match, idx) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-slate-500">#{idx + 1}</span>
                  <span className="font-semibold text-sky-400 truncate max-w-[100px]">
                    {match.playerA.name}
                  </span>
                  <span className="text-slate-600 font-bold text-[10px]">VS</span>
                  <span className="font-semibold text-orange-400 truncate max-w-[100px]">
                    {match.playerB.name}
                  </span>
                </div>

                <span className="text-[10px] text-slate-500 shrink-0">
                  {new Date(match.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))
          )
        ) : eliminatedPlayers.length === 0 ? (
          <div className="text-center py-6 text-slate-600 text-xs">
            ประวัติการสุ่มจะแสดงที่นี่เมื่อเริ่มหมุนวงล้อ
          </div>
        ) : (
          eliminatedPlayers.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800/70 rounded-xl text-xs hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold text-slate-500">#{idx + 1}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                    player.team === 'A'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                  }`}
                >
                  ทีม {player.team}
                </span>
                <span className="font-medium text-slate-300 truncate">{player.name}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {player.eliminatedAt && (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(player.eliminatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRestorePlayer(player.id)}
                  className="px-2 py-0.5 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/40 rounded transition flex items-center gap-1 cursor-pointer"
                  title="คืนชื่อกลับเข้าวงล้อ"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>คืนชื่อ</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
