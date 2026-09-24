import React from 'react';
import { Pause, Volume2, VolumeX, Shield, Swords, Skull, ShieldAlert } from 'lucide-react';
import queenPortrait from '../assets/images/warrior_queen_portrait_1790233503010.jpg';
import warlordPortrait from '../assets/images/warlord_enemy_portrait_1790233515540.jpg';
import { LevelConfig } from '../gameData';

interface HUDProps {
  playerHealth: number;
  playerMaxHealth: number;
  enemyHealth: number;
  enemyMaxHealth: number;
  enemyName: string;
  combo: number;
  level: LevelConfig;
  bossPhase?: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  playerHealth,
  playerMaxHealth,
  enemyHealth,
  enemyMaxHealth,
  enemyName,
  combo,
  level,
  bossPhase = 1,
  isMuted,
  onToggleMute,
  onPause,
}) => {
  const playerPct = Math.max(0, Math.min(100, Math.round((playerHealth / playerMaxHealth) * 100)));
  const enemyPct = Math.max(0, Math.min(100, Math.round((enemyHealth / enemyMaxHealth) * 100)));

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-5 flex flex-col gap-2">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        {/* Left: Audio Toggle & Level Badge */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-10 h-10 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-neutral-800 hover:border-amber-500/50 text-amber-400 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-neutral-500" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <div className="bg-neutral-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-neutral-800 text-[11px] font-mono flex items-center gap-2">
            <span className="font-bold text-amber-400">LVL 0{level.level}</span>
            <span className="text-neutral-500 hidden sm:inline">|</span>
            <span className="text-neutral-300 font-cinzel hidden sm:inline font-bold truncate max-w-[140px]">
              {level.name}
            </span>
          </div>
        </div>

        {/* Center: Dynamic Combo Badge */}
        <div className="flex items-center justify-center min-h-[36px]">
          {combo >= 2 && (
            <div className="animate-bounce flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/20 border border-amber-400 rounded-full backdrop-blur-md shadow-lg shadow-amber-500/20">
              <Swords className="w-4 h-4 text-amber-400" />
              <span className="font-cinzel text-xs sm:text-sm font-black tracking-wider text-amber-300">
                {combo >= 8 ? 'MAX COMBO!' : `COMBO x${combo}!`}
              </span>
            </div>
          )}
        </div>

        {/* Right: Pause Game */}
        <div className="pointer-events-auto">
          <button
            onClick={onPause}
            aria-label="Pause Game"
            className="w-10 h-10 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-neutral-800 hover:border-amber-500/50 text-neutral-300 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Dual Health Bars */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-4xl mx-auto w-full items-start">
        {/* PLAYER (Warrior Queen) */}
        <div className="flex items-center gap-2.5 sm:gap-3 bg-neutral-950/85 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-amber-500/40 shadow-2xl">
          <div className="relative shrink-0">
            <img
              src={queenPortrait}
              alt="Warrior Queen"
              referrerPolicy="no-referrer"
              className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl object-cover border-2 border-amber-400 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-neutral-950 rounded p-0.5 shadow">
              <Shield className="w-3 h-3 stroke-[2.5]" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-cinzel font-bold text-amber-300 truncate text-[11px] sm:text-xs">
                WARRIOR QUEEN
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-neutral-300 font-bold">
                {playerHealth} / {playerMaxHealth}
              </span>
            </div>

            {/* Health Bar Track */}
            <div className="w-full h-3 sm:h-3.5 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-150"
                style={{ width: `${playerPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* ENEMY */}
        <div className="flex items-center gap-2.5 sm:gap-3 bg-neutral-950/85 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-rose-500/40 shadow-2xl flex-row-reverse">
          <div className="relative shrink-0">
            <img
              src={warlordPortrait}
              alt={enemyName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl object-cover border-2 border-rose-500 shadow-md"
            />
            <div className="absolute -bottom-1 -left-1 bg-rose-600 text-white rounded p-0.5 shadow">
              {level.isFinalBoss ? (
                <Skull className="w-3 h-3" />
              ) : level.isMiniBoss ? (
                <ShieldAlert className="w-3 h-3" />
              ) : (
                <Swords className="w-3 h-3 stroke-[2.5]" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center justify-between text-xs mb-1 flex-row-reverse">
              <div className="flex items-center gap-1">
                {level.isFinalBoss && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono font-bold">
                    PHASE {bossPhase}/3
                  </span>
                )}
                <span className="font-cinzel font-bold text-rose-300 truncate text-[11px] sm:text-xs">
                  {enemyName}
                </span>
              </div>
              <span className="font-mono text-[10px] sm:text-xs text-neutral-300 font-bold">
                {enemyHealth} / {enemyMaxHealth}
              </span>
            </div>

            {/* Health Bar Track */}
            <div className="w-full h-3 sm:h-3.5 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-neutral-800">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  level.isFinalBoss
                    ? bossPhase === 3
                      ? 'bg-gradient-to-l from-purple-500 to-indigo-400'
                      : 'bg-gradient-to-l from-rose-600 to-orange-500'
                    : 'bg-gradient-to-l from-rose-600 to-rose-400'
                }`}
                style={{ width: `${enemyPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
