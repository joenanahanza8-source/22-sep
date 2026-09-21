import { Player } from '../types';

export const INITIAL_PLAYERS: Player[] = [
  // Team A (ทีม A)
  { id: 'a1', name: 'กานต์ (Karn)', team: 'A', isEliminated: false },
  { id: 'a2', name: 'มิ้นต์ (Mint)', team: 'A', isEliminated: false },
  { id: 'a3', name: 'บอส (Boss)', team: 'A', isEliminated: false },
  { id: 'a4', name: 'ฟ้า (Fah)', team: 'A', isEliminated: false },
  { id: 'a5', name: 'แบงค์ (Bank)', team: 'A', isEliminated: false },
  { id: 'a6', name: 'พิม (Pim)', team: 'A', isEliminated: false },

  // Team B (ทีม B)
  { id: 'b1', name: 'บีม (Beam)', team: 'B', isEliminated: false },
  { id: 'b2', name: 'นัท (Nut)', team: 'B', isEliminated: false },
  { id: 'b3', name: 'ต้า (Taa)', team: 'B', isEliminated: false },
  { id: 'b4', name: 'ปอนด์ (Pond)', team: 'B', isEliminated: false },
  { id: 'b5', name: 'เจมส์ (James)', team: 'B', isEliminated: false },
  { id: 'b6', name: 'ฝน (Fon)', team: 'B', isEliminated: false },
];

export const TEAM_COLORS = {
  A: {
    name: 'ทีม A (สีฟ้า/น้ำเงิน)',
    primary: '#0284c7', // Sky 600
    accent: '#38bdf8', // Sky 400
    dark: '#0369a1',
    slicePalette: [
      '#0284c7', // Sky
      '#2563eb', // Blue
      '#0d9488', // Teal
      '#06b6d4', // Cyan
      '#4f46e5', // Indigo
      '#0891b2', // Cyan dark
      '#1d4ed8', // Deep blue
      '#0e7490', // Deep cyan
    ],
    badgeBg: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  },
  B: {
    name: 'ทีม B (สีส้ม/ชมพู)',
    primary: '#ea580c', // Orange 600
    accent: '#fb923c', // Orange 400
    dark: '#c2410c',
    slicePalette: [
      '#ea580c', // Orange
      '#e11d48', // Rose
      '#d97706', // Amber
      '#db2777', // Pink
      '#f97316', // Bright orange
      '#f43f5e', // Bright rose
      '#b45309', // Deep amber
      '#be123c', // Deep rose
    ],
    badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
};
