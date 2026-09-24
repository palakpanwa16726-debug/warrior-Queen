import React from 'react';
import { ArrowLeft, ArrowRight, Zap, Shield, Sparkles, Wind } from 'lucide-react';
import { soundEngine } from '../audioEngine';

interface CombatControlsProps {
  cooldowns: {
    slash: number;
    power_strike: number;
    special: number;
    dash: number;
  };
  onAttack: (attackId: 'slash' | 'power_strike' | 'special') => void;
  onDash: () => void;
  onMoveStart: (direction: -1 | 1) => void;
  onMoveEnd: () => void;
  isMovingLeft: boolean;
  isMovingRight: boolean;
  isAttacking: boolean;
  isInAttackRange: boolean;
  slashDamage: number;
  powerDamage: number;
  specialDamage: number;
}

export const CombatControls: React.FC<CombatControlsProps> = ({
  cooldowns,
  onAttack,
  onDash,
  onMoveStart,
  onMoveEnd,
  isMovingLeft,
  isMovingRight,
  isAttacking,
  isInAttackRange,
  slashDamage,
  powerDamage,
  specialDamage,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-5 flex flex-col items-center gap-2">
      {/* Target Range Status Badge */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-950/85 backdrop-blur-md border border-neutral-800 text-[11px] font-mono">
        <span
          className={`w-2 h-2 rounded-full ${
            isInAttackRange ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'
          }`}
        />
        <span>
          Target Range:{' '}
          <strong className={isInAttackRange ? 'text-emerald-400 font-bold' : 'text-neutral-400 font-normal'}>
            {isInAttackRange ? 'IN MELEE RANGE' : 'TOO FAR (MOVE CLOSER)'}
          </strong>
        </span>
      </div>

      {/* Main Controls Dock */}
      <div className="w-full max-w-4xl mx-auto flex items-end justify-between gap-2 sm:gap-6">
        {/* Left Side: Movement D-Pad & Dash */}
        <div className="pointer-events-auto flex items-center gap-2 bg-neutral-950/85 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-neutral-800 shadow-2xl">
          {/* Move Left */}
          <button
            onPointerDown={() => onMoveStart(-1)}
            onPointerUp={onMoveEnd}
            onPointerLeave={onMoveEnd}
            aria-label="Move Left"
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center transition-all select-none ${
              isMovingLeft
                ? 'bg-amber-500 text-neutral-950 scale-95 shadow-lg shadow-amber-500/30'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-700/60'
            }`}
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[9px] font-mono text-neutral-400 hidden sm:inline">A / ←</span>
          </button>

          {/* Move Right */}
          <button
            onPointerDown={() => onMoveStart(1)}
            onPointerUp={onMoveEnd}
            onPointerLeave={onMoveEnd}
            aria-label="Move Right"
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center transition-all select-none ${
              isMovingRight
                ? 'bg-amber-500 text-neutral-950 scale-95 shadow-lg shadow-amber-500/30'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-700/60'
            }`}
          >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[9px] font-mono text-neutral-400 hidden sm:inline">D / →</span>
          </button>

          {/* Dash Button */}
          <button
            onClick={() => onDash()}
            disabled={cooldowns.dash > 0}
            aria-label="Dash"
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center transition-all select-none relative ${
              cooldowns.dash > 0
                ? 'bg-neutral-900/60 text-neutral-600 border border-neutral-800 cursor-not-allowed'
                : 'bg-gradient-to-b from-sky-950/70 to-neutral-900 border border-sky-500/50 text-sky-400 hover:border-sky-400 active:scale-95'
            }`}
          >
            <Wind className="w-5 h-5" />
            <span className="text-[9px] font-mono">DASH</span>
          </button>
        </div>

        {/* Right Side: 3 Attack Buttons Tabs */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          {/* 1. SWORD SLASH */}
          <button
            onClick={() => onAttack('slash')}
            disabled={cooldowns.slash > 0 || isAttacking}
            className={`relative group flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-2xl border transition-all active:scale-95 select-none ${
              cooldowns.slash > 0 || isAttacking
                ? 'bg-neutral-900/90 border-neutral-800 opacity-60 cursor-not-allowed'
                : 'bg-gradient-to-b from-amber-950/60 to-neutral-950/90 hover:from-amber-900/60 border-amber-500/60 shadow-lg shadow-amber-950/50 hover:border-amber-400'
            } w-20 sm:w-26 h-20 sm:h-22`}
          >
            {cooldowns.slash > 0 && (
              <div className="absolute inset-0 bg-neutral-950/80 rounded-2xl flex items-center justify-center text-xs font-mono font-bold text-amber-400">
                {cooldowns.slash.toFixed(1)}s
              </div>
            )}
            <div className="flex items-center justify-between w-full">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-[9px] font-mono text-neutral-400">[1 / J]</span>
            </div>
            <div className="text-center">
              <div className="font-cinzel text-[11px] sm:text-xs font-bold text-neutral-100">SLASH</div>
              <div className="text-[9px] text-amber-400 font-mono font-semibold">{slashDamage} DMG</div>
            </div>
            <span className="text-[8px] text-neutral-400 tracking-wider">FAST</span>
          </button>

          {/* 2. POWER STRIKE */}
          <button
            onClick={() => onAttack('power_strike')}
            disabled={cooldowns.power_strike > 0 || isAttacking}
            className={`relative group flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-2xl border transition-all active:scale-95 select-none ${
              cooldowns.power_strike > 0 || isAttacking
                ? 'bg-neutral-900/90 border-neutral-800 opacity-60 cursor-not-allowed'
                : 'bg-gradient-to-b from-orange-950/60 to-neutral-950/90 hover:from-orange-900/60 border-orange-500/60 shadow-lg shadow-orange-950/50 hover:border-orange-400'
            } w-20 sm:w-26 h-20 sm:h-22`}
          >
            {cooldowns.power_strike > 0 && (
              <div className="absolute inset-0 bg-neutral-950/80 rounded-2xl flex items-center justify-center text-xs font-mono font-bold text-orange-400">
                {cooldowns.power_strike.toFixed(1)}s
              </div>
            )}
            <div className="flex items-center justify-between w-full">
              <Shield className="w-4 h-4 text-orange-400" />
              <span className="text-[9px] font-mono text-neutral-400">[2 / K]</span>
            </div>
            <div className="text-center">
              <div className="font-cinzel text-[11px] sm:text-xs font-bold text-neutral-100">POWER</div>
              <div className="text-[9px] text-orange-400 font-mono font-semibold">{powerDamage} DMG</div>
            </div>
            <span className="text-[8px] text-neutral-400 tracking-wider">HEAVY</span>
          </button>

          {/* 3. SPECIAL ATTACK */}
          <button
            onClick={() => onAttack('special')}
            disabled={cooldowns.special > 0 || isAttacking}
            className={`relative group flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-2xl border transition-all active:scale-95 select-none ${
              cooldowns.special > 0 || isAttacking
                ? 'bg-neutral-900/90 border-neutral-800 opacity-60 cursor-not-allowed'
                : 'bg-gradient-to-b from-rose-950/70 to-neutral-950/90 hover:from-rose-900/70 border-rose-500/60 shadow-lg shadow-rose-950/50 hover:border-rose-400 glow-gold'
            } w-20 sm:w-26 h-20 sm:h-22`}
          >
            {cooldowns.special > 0 && (
              <div className="absolute inset-0 bg-neutral-950/80 rounded-2xl flex items-center justify-center text-xs font-mono font-bold text-rose-400">
                {cooldowns.special.toFixed(1)}s
              </div>
            )}
            <div className="flex items-center justify-between w-full">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="text-[9px] font-mono text-neutral-400">[3 / L]</span>
            </div>
            <div className="text-center">
              <div className="font-cinzel text-[11px] sm:text-xs font-bold text-neutral-100">CYCLONE</div>
              <div className="text-[9px] text-rose-400 font-mono font-semibold">{specialDamage} DMG</div>
            </div>
            <span className="text-[8px] text-neutral-400 tracking-wider">ULTIMATE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
