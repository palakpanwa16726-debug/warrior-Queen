import React from 'react';
import { X, Volume2, VolumeX, Shield, Trash2, Keyboard, Smartphone } from 'lucide-react';
import { DIFFICULTY_MODIFIERS, Difficulty } from '../gameData';
import { soundEngine } from '../audioEngine';

interface SettingsModalProps {
  isMuted: boolean;
  onToggleMute: () => void;
  currentDifficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isMuted,
  onToggleMute,
  currentDifficulty,
  onChangeDifficulty,
  onResetProgress,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <h2 className="font-cinzel text-lg font-bold text-amber-300">GAME SETTINGS</h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
          <div>
            <h4 className="text-xs font-bold text-neutral-200">GAME AUDIO FX</h4>
            <p className="text-[10px] text-neutral-400">Sword clashes, roars & synthesized fanfares</p>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleMute();
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${
              isMuted
                ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                : 'bg-amber-500 text-neutral-950 shadow-md'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? 'MUTED' : 'ENABLED'}</span>
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="space-y-2 p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-200">
            <span>COMBAT DIFFICULTY</span>
            <span className="text-amber-400 font-mono">{currentDifficulty}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  soundEngine.playClick();
                  onChangeDifficulty(diff);
                }}
                className={`py-2 rounded-lg text-[11px] font-bold font-mono transition-all ${
                  currentDifficulty === diff
                    ? 'bg-amber-500 text-neutral-950 shadow-md'
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-neutral-400 pt-1">
            {DIFFICULTY_MODIFIERS[currentDifficulty].desc}
          </p>
        </div>

        {/* Controls Guide */}
        <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2 text-[11px] text-neutral-300">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Keyboard className="w-4 h-4" /> <span>KEYBOARD SHORTCUTS</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-neutral-400">
            <div>A / D or ← / → : Move</div>
            <div>SPACE / SHIFT : Dash</div>
            <div>1 or J : Sword Slash (15 DMG)</div>
            <div>2 or K : Power Strike (30 DMG)</div>
            <div>3 or L : Special Cyclone (50 DMG)</div>
            <div>P or ESC : Pause Game</div>
          </div>
        </div>

        {/* Reset Progress */}
        <div className="pt-2 border-t border-neutral-800 flex justify-between items-center">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all progress, coins, and unlocks?')) {
                onResetProgress();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Save Data</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
