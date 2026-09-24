import React from 'react';
import { ArrowLeft, Shield, Swords, Zap, Sparkles, Heart, Check, Plus } from 'lucide-react';
import { UPGRADES, UpgradeConfig } from '../gameData';
import { soundEngine } from '../audioEngine';

interface UpgradesScreenProps {
  playerCoins: number;
  upgradeRanks: Record<string, number>;
  onBuyUpgrade: (upgradeId: string, cost: number) => void;
  onBack: () => void;
}

export const UpgradesScreen: React.FC<UpgradesScreenProps> = ({
  playerCoins,
  upgradeRanks,
  onBuyUpgrade,
  onBack,
}) => {
  const getUpgradeCost = (cfg: UpgradeConfig, currentRank: number) => {
    return Math.round(cfg.baseCost * Math.pow(cfg.costMultiplier, currentRank));
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'heart':
        return <Heart className="w-5 h-5 text-emerald-400" />;
      case 'swords':
        return <Swords className="w-5 h-5 text-amber-400" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-sky-400" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-rose-400" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  const getRankDescription = (id: string, rank: number) => {
    switch (id) {
      case 'health':
        return `Current: ${100 + rank * 25} HP → Next: ${100 + (rank + 1) * 25} HP`;
      case 'attack':
        return `Current: +${rank * 12}% DMG → Next: +${(rank + 1) * 12}% DMG`;
      case 'sword_power':
        return `Current: +${rank * 4}% Crit Chance → Next: +${(rank + 1) * 4}% Crit`;
      case 'special_attack':
        return `Current: +${rank * 20}% Power → Next: +${(rank + 1) * 20}% Power`;
      case 'defense':
        return `Current: +${rank * 5}% Damage Reduction → Next: +${(rank + 1) * 5}%`;
      default:
        return `Rank ${rank} → Rank ${rank + 1}`;
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col p-4 sm:p-6 bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Header */}
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

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono">
          <span>🪙 COINS: {playerCoins}</span>
        </div>
      </div>

      {/* Title */}
      <div className="my-6 text-center max-w-xl mx-auto">
        <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">
          ROYAL ARMORY & ACADEMY
        </span>
        <h2 className="font-cinzel text-3xl font-black text-amber-300">UPGRADE ABILITIES</h2>
        <p className="text-xs text-neutral-400 mt-1">
          Invest collected spoils of war to permanently fortify the Warrior Queen's combat prowess.
        </p>
      </div>

      {/* Upgrades List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
        {UPGRADES.map((cfg) => {
          const rank = upgradeRanks[cfg.id] || 0;
          const isMaxed = rank >= cfg.maxRank;
          const cost = getUpgradeCost(cfg, rank);
          const canAfford = playerCoins >= cost && !isMaxed;

          return (
            <div
              key={cfg.id}
              className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between gap-4 hover:border-neutral-700 transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 shrink-0">
                  {getIcon(cfg.icon)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-cinzel text-sm font-bold text-neutral-100">{cfg.name}</h3>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      RANK {rank} / {cfg.maxRank}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{cfg.description}</p>
                </div>
              </div>

              {/* Progress bars & next tier stat preview */}
              <div className="space-y-2 bg-neutral-950/80 p-3 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <span>{isMaxed ? 'MAXIMUM RANK ACHIEVED' : getRankDescription(cfg.id, rank)}</span>
                </div>

                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden flex gap-0.5">
                  {Array.from({ length: cfg.maxRank }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-full flex-1 transition-all ${
                        idx < rank ? 'bg-amber-400' : 'bg-neutral-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                disabled={isMaxed || !canAfford}
                onClick={() => {
                  soundEngine.playUpgrade();
                  onBuyUpgrade(cfg.id, cost);
                }}
                className={`w-full py-2.5 rounded-xl font-cinzel font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${
                  isMaxed
                    ? 'bg-neutral-800 text-neutral-500 cursor-default'
                    : canAfford
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-95'
                    : 'bg-neutral-800/80 text-neutral-500 border border-neutral-700/40 cursor-not-allowed'
                }`}
              >
                {isMaxed ? (
                  <>
                    <Check className="w-4 h-4" /> COMPLETED
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> UPGRADE (🪙 {cost} COINS)
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
