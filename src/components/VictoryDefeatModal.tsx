import React from 'react';
import { Trophy, Skull, RotateCcw, Home, ArrowRight, Award, Coins, Sparkles, Shield, Swords } from 'lucide-react';
import { soundEngine } from '../audioEngine';
import { LevelConfig, Outfit, Sword } from '../gameData';

interface VictoryDefeatModalProps {
  isVictory: boolean;
  level: LevelConfig;
  unlockedOutfit?: Outfit;
  unlockedSword?: Sword;
  coinsEarned: number;
  xpEarned: number;
  totalDamageDealt: number;
  maxCombo: number;
  onNextLevel: () => void;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const VictoryDefeatModal: React.FC<VictoryDefeatModalProps> = ({
  isVictory,
  level,
  unlockedOutfit,
  unlockedSword,
  coinsEarned,
  xpEarned,
  totalDamageDealt,
  maxCombo,
  onNextLevel,
  onRetry,
  onMainMenu,
}) => {
  const isFinalBoss = level.isFinalBoss;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center text-neutral-100">
        {/* Glow backdrop behind icon */}
        <div
          className={`absolute -top-12 p-4 rounded-full border-2 shadow-2xl ${
            isVictory
              ? 'bg-amber-500 border-amber-300 text-neutral-950 shadow-amber-500/40 glow-gold'
              : 'bg-rose-600 border-rose-400 text-white shadow-rose-600/40'
          }`}
        >
          {isVictory ? <Trophy className="w-8 h-8 fill-current" /> : <Skull className="w-8 h-8" />}
        </div>

        {/* Title */}
        <div className="mt-7 mb-4 space-y-1">
          {isVictory ? (
            isFinalBoss ? (
              <>
                <span className="text-[11px] font-bold tracking-widest uppercase text-amber-400">
                  SUPREME TRIUMPH
                </span>
                <h2 className="font-cinzel text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                  VICTORY!
                </h2>
                <p className="text-xs text-amber-200 font-cinzel font-semibold tracking-wide">
                  THE WARRIOR HAS CONQUERED THE BATTLEFIELD!
                </p>
              </>
            ) : (
              <>
                <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400">
                  LEVEL 0{level.level} CLEARED
                </span>
                <h2 className="font-cinzel text-2xl font-black text-amber-300">LEVEL COMPLETE!</h2>
                <p className="text-xs text-neutral-400">
                  {level.enemyName} has fallen before your royal blade.
                </p>
              </>
            )
          ) : (
            <>
              <span className="text-[11px] font-bold tracking-widest uppercase text-rose-400">
                FALLEN IN COMBAT
              </span>
              <h2 className="font-cinzel text-2xl font-black text-rose-500">YOU ARE DEFEATED</h2>
              <p className="text-xs text-neutral-400">
                Rise again, Queen. Adjust your timing and strike true!
              </p>
            </>
          )}
        </div>

        {/* Victory Rewards & Statistics */}
        {isVictory && (
          <div className="w-full space-y-3 mb-5">
            {/* Rewards Pill */}
            <div className="grid grid-cols-2 gap-2 bg-neutral-950/80 p-3 rounded-2xl border border-neutral-800">
              <div className="flex items-center justify-center gap-2 text-amber-300 font-mono text-sm font-bold">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>+{coinsEarned} COINS</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-indigo-300 font-mono text-sm font-bold">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>+{xpEarned} XP</span>
              </div>
            </div>

            {/* Combat Stats */}
            <div className="flex justify-between items-center text-xs text-neutral-400 px-3 py-2 bg-neutral-950/50 rounded-xl border border-neutral-800/80 font-mono">
              <span>Damage: <strong className="text-neutral-200">{totalDamageDealt}</strong></span>
              <span>Max Combo: <strong className="text-amber-400">{maxCombo} Hits</strong></span>
            </div>

            {/* Unlock Notification Banners */}
            {unlockedOutfit && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/50 rounded-2xl flex items-center gap-3 text-left animate-pulse">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    NEW ARMOR UNLOCKED!
                  </div>
                  <div className="font-cinzel text-xs font-bold text-neutral-100">
                    {unlockedOutfit.name}
                  </div>
                </div>
              </div>
            )}

            {unlockedSword && (
              <div className="p-3 bg-yellow-950/40 border border-yellow-500/50 rounded-2xl flex items-center gap-3 text-left animate-pulse">
                <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400 shrink-0">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
                    NEW SWORD UNLOCKED!
                  </div>
                  <div className="font-cinzel text-xs font-bold text-neutral-100">
                    {unlockedSword.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {isVictory ? (
            level.level < 10 ? (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onNextLevel();
                }}
                className="w-full py-3.5 rounded-xl font-cinzel font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <span>NEXT CHAPTER (LEVEL 0{level.level + 1})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onMainMenu();
                }}
                className="w-full py-3.5 rounded-xl font-cinzel font-bold text-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 hover:brightness-110 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <span>CLAIM ULTIMATE VICTORY</span>
              </button>
            )
          ) : (
            <button
              onClick={() => {
                soundEngine.playClick();
                onRetry();
              }}
              className="w-full py-3.5 rounded-xl font-cinzel font-bold text-sm bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:brightness-110 shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RETRY LEVEL 0{level.level}</span>
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playClick();
              onMainMenu();
            }}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>RETURN TO MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
