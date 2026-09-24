import React from 'react';
import { ArrowLeft, Lock, CheckCircle2, Swords, Skull, ShieldAlert } from 'lucide-react';
import { LEVELS, DIFFICULTY_MODIFIERS, Difficulty, LevelConfig } from '../gameData';
import { soundEngine } from '../audioEngine';

interface LevelsScreenProps {
  highestCompletedLevel: number;
  currentDifficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  onSelectLevel: (levelNum: number) => void;
  onBack: () => void;
}

export const LevelsScreen: React.FC<LevelsScreenProps> = ({
  highestCompletedLevel,
  currentDifficulty,
  onChangeDifficulty,
  onSelectLevel,
  onBack,
}) => {
  return (
    <div className="relative w-full h-full min-h-screen flex flex-col p-4 sm:p-6 bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <button
          onClick={() => {
            soundEngine.playClick();
            onBack();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-300 hover:border-amber-500/50 transition-all text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO MENU</span>
        </button>

        {/* Difficulty Selector Tabs */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => {
                soundEngine.playClick();
                onChangeDifficulty(diff);
              }}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold font-mono transition-all ${
                currentDifficulty === diff
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="my-6 text-center max-w-xl mx-auto">
        <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">
          CAMPAIGN CHAPTERS (10 ARENAS)
        </span>
        <h2 className="font-cinzel text-3xl font-black text-amber-300">SELECT BATTLEFIELD</h2>
        <p className="text-xs text-neutral-400 mt-1">
          {DIFFICULTY_MODIFIERS[currentDifficulty].desc}
        </p>
      </div>

      {/* 10 Levels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 max-w-6xl mx-auto w-full">
        {LEVELS.map((lvl) => {
          const isCompleted = lvl.level <= highestCompletedLevel;
          const isCurrent = lvl.level === highestCompletedLevel + 1;
          const isLocked = lvl.level > highestCompletedLevel + 1;

          return (
            <div
              key={lvl.level}
              onClick={() => {
                if (!isLocked) {
                  soundEngine.playClick();
                  onSelectLevel(lvl.level);
                }
              }}
              className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-left ${
                isCurrent
                  ? 'border-amber-400 bg-gradient-to-b from-amber-950/40 to-neutral-900/90 shadow-xl shadow-amber-500/10 scale-102 cursor-pointer ring-2 ring-amber-500/40'
                  : isCompleted
                  ? 'border-emerald-500/40 bg-neutral-900/70 hover:border-emerald-400 cursor-pointer'
                  : 'border-neutral-900 bg-neutral-950/60 opacity-55 cursor-not-allowed'
              }`}
            >
              {/* Header Badges */}
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-mono font-bold text-amber-400">
                  LEVEL 0{lvl.level}
                </span>

                {isCompleted ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
                  </span>
                ) : isCurrent ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-neutral-950 animate-pulse">
                    CURRENT
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-500">
                    <Lock className="w-3 h-3" /> LOCKED
                  </span>
                )}
              </div>

              {/* Level Title & Details */}
              <div>
                <h4 className="font-cinzel text-sm font-bold text-neutral-100 leading-snug">
                  {lvl.name}
                </h4>
                <p className="text-[10px] text-neutral-400">{lvl.location}</p>
              </div>

              {/* Enemy Info */}
              <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800 text-[10px] space-y-1">
                <div className="flex items-center gap-1 text-neutral-300 font-semibold truncate">
                  {lvl.isFinalBoss ? (
                    <Skull className="w-3 h-3 text-rose-500 shrink-0" />
                  ) : lvl.isMiniBoss ? (
                    <ShieldAlert className="w-3 h-3 text-amber-500 shrink-0" />
                  ) : (
                    <Swords className="w-3 h-3 text-neutral-400 shrink-0" />
                  )}
                  <span className="truncate">{lvl.enemyName}</span>
                </div>
                <div className="flex justify-between text-neutral-400 font-mono text-[9px]">
                  <span>HP: {lvl.enemyHp}</span>
                  <span>ATK: {lvl.enemyDamage}</span>
                </div>
              </div>

              {/* Action / State */}
              <button
                disabled={isLocked}
                className={`w-full py-2 rounded-xl font-cinzel font-bold text-[10px] uppercase transition-all ${
                  isCurrent
                    ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-md'
                    : isCompleted
                    ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    : 'bg-neutral-900 text-neutral-600 cursor-not-allowed'
                }`}
              >
                {isLocked ? '🔒 LOCKED' : isCurrent ? 'ENTER ARENA' : 'REPLAY'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
