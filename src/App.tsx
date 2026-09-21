import { useState, useEffect, useCallback } from 'react';
import { Player, TeamId, WheelMode, MatchupRecord } from './types';
import { INITIAL_PLAYERS } from './data/defaultPlayers';
import { triggerWinnerConfetti } from './utils/confetti';
import { WheelCanvas } from './components/WheelCanvas';
import { WinnerModal } from './components/WinnerModal';
import { PlayerManagement } from './components/PlayerManagement';
import { Header } from './components/Header';
import { HistoryAndMatchups } from './components/HistoryAndMatchups';
import { Play, RotateCcw, Users, Swords, AlertCircle } from 'lucide-react';
import shuttlecockImg from './assets/images/badminton_shuttlecock_1789983259796.jpg';

const STORAGE_PLAYERS_KEY = 'lucky_wheel_players_v2';
const STORAGE_SOUND_KEY = 'lucky_wheel_sound_v1';

export default function App() {
  // Load saved players or fallback to defaults
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PLAYERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PLAYERS;
  });

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SOUND_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Current Wheel Mode
  const [mode, setMode] = useState<WheelMode>('ALL');

  // Spinning status
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Winner modal & results
  const [winner, setWinner] = useState<Player | null>(null);
  const [winnerModalOpen, setWinnerModalOpen] = useState<boolean>(false);
  const [roundNumber, setRoundNumber] = useState<number>(1);

  // Versus duel state
  const [pendingDuelA, setPendingDuelA] = useState<Player | null>(null);
  const [pendingDuelB, setPendingDuelB] = useState<Player | null>(null);
  const [matchups, setMatchups] = useState<MatchupRecord[]>([]);

  // Persist players
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PLAYERS_KEY, JSON.stringify(players));
    } catch {
      // ignore
    }
  }, [players]);

  // Persist sound
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SOUND_KEY, JSON.stringify(soundEnabled));
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  // Active & Eliminated stats
  const activePlayers = players.filter((p) => !p.isEliminated);
  const eliminatedPlayers = players
    .filter((p) => p.isEliminated)
    .sort((a, b) => (b.eliminatedAt || 0) - (a.eliminatedAt || 0));

  const activeInCurrentMode = activePlayers.filter((p) => {
    if (mode === 'TEAM_A') return p.team === 'A';
    if (mode === 'TEAM_B') return p.team === 'B';
    if (mode === 'VERSUS') {
      // In versus mode: if waiting for Team A, filter to Team A. If waiting for Team B, filter to Team B.
      if (!pendingDuelA) return p.team === 'A';
      return p.team === 'B';
    }
    return true; // 'ALL'
  });

  // Handlers for spinning
  const handleSpinStart = useCallback(() => {
    setIsSpinning(true);
  }, []);

  const handleSpinEnd = useCallback(
    (winningPlayer: Player) => {
      setIsSpinning(false);
      setWinner(winningPlayer);

      // Automatically eliminate this player from the active wheel pool
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === winningPlayer.id
            ? {
                ...p,
                isEliminated: true,
                eliminatedAt: Date.now(),
                eliminationOrder: roundNumber,
              }
            : p
        )
      );

      // Handle Versus duel pairing logic if in VERSUS mode
      if (mode === 'VERSUS') {
        if (!pendingDuelA && winningPlayer.team === 'A') {
          setPendingDuelA(winningPlayer);
        } else if (pendingDuelA && winningPlayer.team === 'B') {
          setPendingDuelB(winningPlayer);
          const newMatch: MatchupRecord = {
            id: 'match-' + Date.now(),
            playerA: pendingDuelA,
            playerB: winningPlayer,
            timestamp: Date.now(),
          };
          setMatchups((prev) => [newMatch, ...prev]);
          // Reset pending pair after short delay
          setTimeout(() => {
            setPendingDuelA(null);
            setPendingDuelB(null);
          }, 2500);
        }
      }

      // Trigger visual celebrations
      triggerWinnerConfetti();
      setWinnerModalOpen(true);
      setRoundNumber((r) => r + 1);
    },
    [mode, pendingDuelA, roundNumber]
  );

  // Undo elimination / Keep in wheel
  const handleKeepInWheel = (playerToKeep: Player) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerToKeep.id ? { ...p, isEliminated: false, eliminatedAt: undefined } : p
      )
    );
    if (pendingDuelA?.id === playerToKeep.id) setPendingDuelA(null);
    if (pendingDuelB?.id === playerToKeep.id) setPendingDuelB(null);
    setWinnerModalOpen(false);
  };

  // Spin Next button in modal
  const handleSpinNext = () => {
    setWinnerModalOpen(false);
  };

  // Add single player
  const handleAddPlayer = (name: string, team: TeamId) => {
    const newPlayer: Player = {
      id: 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name,
      team,
      isEliminated: false,
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  // Bulk add players
  const handleBulkAddPlayers = (names: string[], team: TeamId) => {
    const newPlayers: Player[] = names.map((name, i) => ({
      id: 'p-' + (Date.now() + i) + '-' + Math.random().toString(36).substring(2, 6),
      name,
      team,
      isEliminated: false,
    }));
    setPlayers((prev) => [...prev, ...newPlayers]);
  };

  // Remove player permanently
  const handleRemovePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  // Restore single player back to wheel
  const handleRestorePlayer = (id: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isEliminated: false, eliminatedAt: undefined } : p))
    );
  };

  // Restore all eliminated players
  const handleRestoreAllEliminated = (team?: TeamId) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (!p.isEliminated) return p;
        if (team && p.team !== team) return p;
        return { ...p, isEliminated: false, eliminatedAt: undefined };
      })
    );
  };

  // Reset all players to empty or confirmation
  const handleResetAllPlayers = () => {
    if (window.confirm('คุณต้องการล้างรายชื่อผู้เล่นทั้งหมดใช่หรือไม่?')) {
      setPlayers([]);
      setMatchups([]);
      setPendingDuelA(null);
      setPendingDuelB(null);
    }
  };

  // Load preset sample players
  const handleLoadPreset = () => {
    setPlayers(INITIAL_PLAYERS);
    setMatchups([]);
    setPendingDuelA(null);
    setPendingDuelB(null);
  };

  // Toggle player team between A and B
  const handleToggleTeam = (id: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, team: p.team === 'A' ? 'B' : 'A' } : p))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Prompt',sans-serif]">
      {/* Top Header & Mode Navigation */}
      <Header
        mode={mode}
        onSelectMode={setMode}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((s) => !s)}
        activeCount={activePlayers.length}
        eliminatedCount={eliminatedPlayers.length}
        onRestoreAll={() => handleRestoreAllEliminated()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Wheel & Controls (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col items-center gap-4">
          {/* Wheel Card */}
          <div className="w-full bg-slate-900/80 border border-slate-800/90 rounded-3xl p-4 sm:p-8 shadow-2xl relative flex flex-col items-center">
            {/* Status Badge above wheel */}
            <div className="flex items-center justify-between w-full mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">โหมดปัจจุบัน:</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    mode === 'TEAM_A'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      : mode === 'TEAM_B'
                      ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                      : mode === 'VERSUS'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  }`}
                >
                  {mode === 'TEAM_A'
                    ? 'เฉพาะทีม A'
                    : mode === 'TEAM_B'
                    ? 'เฉพาะทีม B'
                    : mode === 'VERSUS'
                    ? !pendingDuelA
                      ? 'ดวล A vs B (หมุนทีม A)'
                      : 'ดวล A vs B (หมุนทีม B)'
                    : 'รวมทุกทีม (A + B)'}
                </span>
              </div>

              <div className="text-xs text-slate-400">
                เหลือในวงล้อ:{' '}
                <span className="font-bold text-white text-sm">
                  {activeInCurrentMode.length}
                </span>{' '}
                คน
              </div>
            </div>

            {/* The Canvas Spinner Wheel */}
            <WheelCanvas
              players={players}
              mode={
                mode === 'VERSUS' ? (!pendingDuelA ? 'TEAM_A' : 'TEAM_B') : mode
              }
              isSpinning={isSpinning}
              onSpinStart={handleSpinStart}
              onSpinEnd={handleSpinEnd}
              soundEnabled={soundEnabled}
            />

            {/* Bottom Controls under wheel */}
            <div className="w-full mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Quick info or warning */}
              {activeInCurrentMode.length === 0 ? (
                <div className="flex items-center gap-2 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    ไม่มีผู้เล่นในโหมดนี้ กรุณากดคืนชื่อหรือเพิ่มผู้เล่นใหม่
                  </span>
                </div>
              ) : (
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>กดที่ลูกแบดมินตันตรงกลางวงล้อ หรือกดปุ่มหมุนด้านล่าง</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {eliminatedPlayers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRestoreAllEliminated()}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    title="คืนชื่อทั้งหมดเข้าสู่วงล้อ"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>คืนชื่อทั้งหมด ({eliminatedPlayers.length})</span>
                  </button>
                )}

                <button
                  id="btn-main-spin"
                  type="button"
                  disabled={isSpinning || activeInCurrentMode.length === 0}
                  onClick={() => {
                    const centerBtn = document.getElementById('center-wheel-spin-btn');
                    if (centerBtn) centerBtn.click();
                  }}
                  className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition cursor-pointer ${
                    isSpinning || activeInCurrentMode.length === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-sky-500 via-indigo-600 to-orange-500 hover:from-sky-400 hover:to-orange-400 text-white shadow-indigo-500/25 active:scale-95'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full overflow-hidden border border-white/60 shrink-0 ${isSpinning ? 'animate-spin' : ''}`}>
                    <img
                      src={shuttlecockImg}
                      alt="ลูกแบดมินตัน"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover scale-110"
                    />
                  </div>
                  <span>{isSpinning ? 'กำลังสุ่ม...' : 'หมุนวงล้อสุ่ม (ลูกแบด)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Rules / Instructions Card */}
          <div className="w-full bg-slate-900/50 border border-slate-800/60 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <span>กติกาการสุ่ม:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>เมื่อชื่อผู้เล่นถูกวงล้อสุ่มเลือก จะถูก <strong className="text-rose-400">คัดออกจากวงล้อทันที</strong></li>
              <li>ผู้เล่นที่ถูกคัดออกจะไม่ถูกสุ่มซ้ำ จนกว่าคุณจะกด <strong className="text-emerald-400">"คืนชื่อ"</strong> ในแท็บคัดออกแล้ว</li>
              <li>สามารถสลับโหมดเป็นรวมทุกทีม, เฉพาะทีม A, เฉพาะทีม B หรือโหมดดวลคู่ A vs B ได้จากเมนูด้านบน</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Player Management & History (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-4 h-full">
          {/* Player Management Panel */}
          <PlayerManagement
            players={players}
            onAddPlayer={handleAddPlayer}
            onBulkAddPlayers={handleBulkAddPlayers}
            onRemovePlayer={handleRemovePlayer}
            onRestorePlayer={handleRestorePlayer}
            onRestoreAllEliminated={handleRestoreAllEliminated}
            onResetAllPlayers={handleResetAllPlayers}
            onLoadPreset={handleLoadPreset}
            onToggleTeam={handleToggleTeam}
          />

          {/* History & Matchups Tracker */}
          <HistoryAndMatchups
            mode={mode}
            eliminatedPlayers={eliminatedPlayers}
            matchups={matchups}
            onRestorePlayer={handleRestorePlayer}
            pendingDuelA={pendingDuelA}
            pendingDuelB={pendingDuelB}
            onClearMatchups={() => setMatchups([])}
          />
        </div>
      </main>

      {/* Winner Announcement Popup */}
      <WinnerModal
        winner={winner}
        roundNumber={roundNumber - 1}
        isOpen={winnerModalOpen}
        onClose={() => setWinnerModalOpen(false)}
        onKeepInWheel={handleKeepInWheel}
        onSpinNext={handleSpinNext}
        remainingActiveCount={activeInCurrentMode.length}
      />
    </div>
  );
}
