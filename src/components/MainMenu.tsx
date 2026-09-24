import React from 'react';
import { Play, Shield, Swords, Sparkles, Settings, Map, Zap, Award } from 'lucide-react';
import { soundEngine } from '../audioEngine';
import queenPortrait from '../assets/images/warrior_queen_portrait_1790233503010.jpg';
import arenaBg from '../assets/images/battle_arena_bg_1790233490153.jpg';

interface MainMenuProps {
  onPlay: () => void;
  onOpenLevels: () => void;
  onOpenWarrior: () => void;
  onOpenUpgrades: () => void;
  onOpenSettings: () => void;
  playerLevel: number;
  playerCoins: number;
  highestCompletedLevel: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onOpenLevels,
  onOpenWarrior,
  onOpenUpgrades,
  onOpenSettings,
  playerLevel,
  playerCoins,
  highestCompletedLevel,
}) => {
  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center p-4 overflow-hidden bg-neutral-950 text-neutral-100">
      {/* Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={arenaBg}
          alt="Battlefield Arena"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-35 contrast-115"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/65 to-neutral-950/80" />
      </div>

      {/* Top Bar Stats */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 bg-neutral-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-800 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Award className="w-4 h-4" />
            <span>LVL {playerLevel}</span>
          </div>
          <span className="text-neutral-600">|</span>
          <div className="flex items-center gap-1 text-amber-300">
            <span>🪙 {playerCoins} COINS</span>
          </div>
        </div>

        <div className="pointer-events-auto">
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenSettings();
            }}
            className="w-10 h-10 rounded-full bg-neutral-950/80 backdrop-blur-md border border-neutral-800 hover:border-amber-500/50 flex items-center justify-center text-neutral-300 hover:text-amber-300 transition-all shadow-lg active:scale-95"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center">
        {/* Warrior Queen Avatar Showcase */}
        <div className="relative mb-5 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 rounded-full blur-xl opacity-75 group-hover:opacity-95 transition-opacity animate-pulse" />
          <img
            src={queenPortrait}
            alt="Warrior Queen"
            referrerPolicy="no-referrer"
            className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-amber-400 shadow-2xl"
          />
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 p-2 rounded-full border-2 border-neutral-950 shadow-lg">
            <Swords className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1 mb-6">
          <p className="text-xs font-semibold tracking-[0.35em] uppercase text-amber-400">
            Legend of the Royal Blade
          </p>
          <h1 className="font-cinzel text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 drop-shadow-lg">
            WARRIOR QUEEN
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto pt-1">
            Conquer 10 epic battle arenas, unlock mythic armor sets, and master the royal Talwar blade!
          </p>
        </div>

        {/* Main Action Buttons Grid */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          {/* PRIMARY: PLAY BUTTON */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onPlay();
            }}
            className="group relative w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 font-cinzel font-black text-lg rounded-2xl shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer glow-gold"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>
              {highestCompletedLevel === 0 ? 'START GAME' : `CONTINUE (LEVEL 0${Math.min(10, highestCompletedLevel + 1)})`}
            </span>
          </button>

          {/* SECONDARY ROW: LEVELS & WARRIOR */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenLevels();
              }}
              className="py-3 px-4 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 rounded-xl font-cinzel font-bold text-xs text-neutral-200 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
            >
              <Map className="w-4 h-4 text-amber-400" />
              <span>LEVELS (10)</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenWarrior();
              }}
              className="py-3 px-4 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 rounded-xl font-cinzel font-bold text-xs text-neutral-200 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>WARRIOR</span>
            </button>
          </div>

          {/* UPGRADES & SETTINGS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenUpgrades();
              }}
              className="py-3 px-4 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 rounded-xl font-cinzel font-bold text-xs text-neutral-200 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
            >
              <Zap className="w-4 h-4 text-sky-400" />
              <span>UPGRADES</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenSettings();
              }}
              className="py-3 px-4 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 rounded-xl font-cinzel font-bold text-xs text-neutral-200 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
            >
              <Settings className="w-4 h-4 text-neutral-400" />
              <span>SETTINGS</span>
            </button>
          </div>
        </div>

        {/* Combat Quick Legend */}
        <div className="mt-8 flex items-center justify-center gap-6 text-[11px] text-neutral-400 font-mono">
          <span>⚔️ 3 Combat Abilities</span>
          <span>⚡ Combos & Shockwaves</span>
          <span>👑 10 Unique Outfits & Swords</span>
        </div>
      </div>
    </div>
  );
};
