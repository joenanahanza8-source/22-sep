import { useEffect, useRef, useState, useCallback } from 'react';
import { Player, WheelMode } from '../types';
import { TEAM_COLORS } from '../data/defaultPlayers';
import { playTickSound, playWinSound } from '../utils/audio';
import shuttlecockImg from '../assets/images/badminton_shuttlecock_1789983259796.jpg';

interface WheelCanvasProps {
  players: Player[];
  mode: WheelMode;
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winner: Player) => void;
  soundEnabled: boolean;
}

export function WheelCanvas({
  players,
  mode,
  isSpinning,
  onSpinStart,
  onSpinEnd,
  soundEnabled,
}: WheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickWedgeRef = useRef<number>(-1);
  const rotationRef = useRef<number>(0);

  // Filter players based on active wheel mode
  const activePlayers = players.filter((p) => {
    if (p.isEliminated) return false;
    if (mode === 'TEAM_A') return p.team === 'A';
    if (mode === 'TEAM_B') return p.team === 'B';
    return true; // 'ALL' or 'VERSUS'
  });

  const numSlices = activePlayers.length;
  const sliceAngle = numSlices > 0 ? (2 * Math.PI) / numSlices : 0;

  // Pointer position is at Top (12 o'clock: -PI / 2)
  const POINTER_ANGLE = -Math.PI / 2;

  // Draw wheel on canvas
  const drawWheel = useCallback(
    (rotation: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 18;

      if (numSlices === 0) {
        // Draw empty state wheel
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = '#475569';
        ctx.stroke();
        ctx.setLineDash([]);

        // Center message
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 16px "Prompt", sans-serif';
        ctx.fillText('ไม่มีผู้เล่นในวงล้อ', centerX, centerY - 14);
        ctx.fillStyle = '#64748b';
        ctx.font = '400 13px "Prompt", sans-serif';
        ctx.fillText('กรุณาเติมชื่อ หรือกู้คืนผู้เล่นที่ถูกคัดออก', centerX, centerY + 14);

        ctx.restore();
        return;
      }

      // Outer rim shadow / bevel
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      // Outer decorative border ring with LED studs
      const studCount = Math.max(16, numSlices * 2);
      for (let i = 0; i < studCount; i++) {
        const studAngle = (i * 2 * Math.PI) / studCount;
        const studX = centerX + (radius + 5) * Math.cos(studAngle);
        const studY = centerY + (radius + 5) * Math.sin(studAngle);
        ctx.beginPath();
        ctx.arc(studX, studY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#fb923c';
        ctx.fill();
      }

      // Draw Slices
      for (let i = 0; i < numSlices; i++) {
        const player = activePlayers[i];
        const startAngle = rotation + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        // Wedge fill color
        const teamConf = TEAM_COLORS[player.team];
        const palette = teamConf.slicePalette;
        const sliceColor = palette[i % palette.length];

        ctx.fillStyle = sliceColor;
        ctx.fill();

        // Wedge separator
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.stroke();

        // Slice Text (Player Name & Team Tag)
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);

        // Adjust font size based on number of players and distance
        let fontSize = 15;
        if (numSlices > 16) fontSize = 12;
        if (numSlices > 24) fontSize = 11;
        if (numSlices > 36) fontSize = 9;

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = `600 ${fontSize}px "Prompt", sans-serif`;

        // Text shadow for high legibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Truncate player name if too long
        let displayName = player.name;
        if (displayName.length > 14 && numSlices > 12) {
          displayName = displayName.substring(0, 12) + '...';
        }

        // Draw team badge prefix if in 'ALL' or 'VERSUS' mode
        const showTeamPrefix = mode === 'ALL' || mode === 'VERSUS';
        const fullLabel = showTeamPrefix ? `[${player.team}] ${displayName}` : displayName;

        ctx.fillStyle = '#ffffff';
        ctx.fillText(fullLabel, radius - 18, 0);

        ctx.restore();
      }

      // Center Hub Circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
      ctx.fillStyle = '#090d16';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      // Center Hub Inner Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
      const hubGrad = ctx.createLinearGradient(centerX - 24, centerY - 24, centerX + 24, centerY + 24);
      hubGrad.addColorStop(0, '#0284c7');
      hubGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = hubGrad;
      ctx.fill();

      // Hub icon or sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
      ctx.fill();

      ctx.restore();
    },
    [activePlayers, numSlices, sliceAngle, mode]
  );

  // Redraw when rotation, players, or resize changes
  useEffect(() => {
    drawWheel(currentRotation);
  }, [currentRotation, drawWheel]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      drawWheel(rotationRef.current);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawWheel]);

  // Spin Logic
  const startSpin = () => {
    if (isSpinning || numSlices === 0) return;

    onSpinStart();

    // Random winner index
    const targetWinnerIndex = Math.floor(Math.random() * numSlices);

    // Calculate rotation required so that targetWinnerIndex lands exactly at Top pointer (POINTER_ANGLE: -PI/2)
    // When slice i lands under pointer:
    // pointerAngle = rotation + i * sliceAngle + sliceAngle / 2 (mod 2PI)
    // rotation = pointerAngle - (i * sliceAngle + sliceAngle / 2)
    const targetWedgeAngle = targetWinnerIndex * sliceAngle + sliceAngle / 2;
    // Add 0.1 to 0.9 jitter within the wedge so it doesn't always hit dead center
    const randomJitter = (Math.random() - 0.5) * 0.7 * sliceAngle;
    const finalTargetInCircle = (POINTER_ANGLE - (targetWedgeAngle + randomJitter)) % (2 * Math.PI);

    // Add 6 to 9 full spins for dramatic effect
    const fullSpins = (6 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
    const startAngle = rotationRef.current;
    // Ensure we always rotate forward (positive delta)
    const currentModulo = startAngle % (2 * Math.PI);
    let delta = finalTargetInCircle - currentModulo;
    while (delta < 0) {
      delta += 2 * Math.PI;
    }
    const totalRotationDelta = fullSpins + delta;
    const finalRotation = startAngle + totalRotationDelta;

    const duration = 5000 + Math.random() * 1200; // 5 - 6.2 seconds
    const startTime = performance.now();

    // Easing: Quintic Out for realistic long deceleration
    const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

    lastTickWedgeRef.current = -1;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuint(progress);

      const currentRot = startAngle + totalRotationDelta * easedProgress;
      rotationRef.current = currentRot;
      setCurrentRotation(currentRot);

      // Check current wedge under pointer to trigger tick sound
      if (soundEnabled && numSlices > 0) {
        // Find which wedge is at pointer
        let angleUnderPointer = (POINTER_ANGLE - currentRot) % (2 * Math.PI);
        if (angleUnderPointer < 0) angleUnderPointer += 2 * Math.PI;
        const currentWedge = Math.floor(angleUnderPointer / sliceAngle) % numSlices;

        if (currentWedge !== lastTickWedgeRef.current) {
          lastTickWedgeRef.current = currentWedge;
          // Scale tick volume based on speed (progress)
          playTickSound(Math.max(0.08, 0.28 * (1 - progress * 0.7)));
        }
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Completed spin
        if (soundEnabled) {
          playWinSound();
        }
        const winningPlayer = activePlayers[targetWinnerIndex];
        onSpinEnd(winningPlayer);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center w-full max-w-[460px] aspect-square mx-auto select-none"
    >
      {/* Top Pointer Needle Indicator */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none drop-shadow-xl">
        <div className="w-7 h-9 bg-gradient-to-b from-amber-300 via-amber-400 to-rose-500 rounded-t-md shadow-lg border-2 border-white [clip-path:polygon(0%_0%,100%_0%,50%_100%)] animate-pulse" />
        <div className="w-3 h-3 rounded-full bg-amber-200 border-2 border-amber-500 -mt-8" />
      </div>

      {/* Wheel Canvas */}
      <canvas
        id="lucky-wheel-canvas"
        ref={canvasRef}
        className="w-full h-full cursor-pointer transition-transform duration-200 active:scale-[0.99]"
        onClick={startSpin}
      />

      {/* Center Overlay Button for Quick Touch/Click to Spin - Badminton Shuttlecock Shape */}
      {numSlices > 0 && (
        <button
          id="center-wheel-spin-btn"
          type="button"
          onClick={startSpin}
          disabled={isSpinning}
          className={`absolute z-10 w-22 h-22 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 group ${
            isSpinning
              ? 'scale-95 opacity-90 cursor-not-allowed'
              : 'hover:scale-110 active:scale-95 cursor-pointer'
          }`}
          title="คลิกที่ลูกแบดมินตันเพื่อหมุนวงล้อ"
        >
          {/* Outer glowing ring */}
          <div
            className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
              isSpinning
                ? 'border-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-pulse'
                : 'border-white/80 shadow-[0_0_25px_rgba(56,189,248,0.5)] group-hover:border-amber-300 group-hover:shadow-[0_0_30px_rgba(251,146,60,0.7)]'
            }`}
          />

          {/* Shuttlecock circular icon container with animation */}
          <div
            className={`relative w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-slate-700/80 shadow-inner flex items-center justify-center ${
              isSpinning ? 'animate-[spin_0.8s_linear_infinite]' : 'group-hover:rotate-6 transition-transform duration-300'
            }`}
          >
            <img
              src={shuttlecockImg}
              alt="ลูกแบดมินตันหมุนสุ่ม"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-110 pointer-events-none"
            />
          </div>

          {/* SPIN label badge overlay */}
          <div className="absolute -bottom-2 z-20 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-500 via-indigo-600 to-orange-500 text-white font-black text-[11px] tracking-wider shadow-md border border-white/90 uppercase drop-shadow flex items-center gap-1">
            {isSpinning ? (
              <span className="text-[10px] animate-pulse">สุ่ม...</span>
            ) : (
              <span>SPIN!</span>
            )}
          </div>
        </button>
      )}
    </div>
  );
}
