import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Home } from 'lucide-react';
import { soundEngine } from '../audioEngine';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onReturnToMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onReturnToMenu,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md">
      <div className="max-w-sm w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center shadow-2xl space-y-5 text-neutral-100">
        <h3 className="font-cinzel text-xl font-black text-amber-300 tracking-wider">
          BATTLE PAUSED
        </h3>

        <div className="flex justify-center">
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleMute();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 transition-colors hover:border-amber-500/50"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            <span>SOUND FX: {isMuted ? 'MUTED' : 'ENABLED'}</span>
          </button>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => {
              soundEngine.playClick();
              onResume();
            }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-neutral-950 font-cinzel font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME FIGHT</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onRestart();
            }}
            className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-cinzel font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-neutral-700 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART LEVEL</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onReturnToMenu();
            }}
            className="w-full py-2.5 px-4 text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>RETURN TO MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
