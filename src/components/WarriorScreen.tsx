import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Shield, Swords, Zap, Sparkles, Award, Lock, Check } from 'lucide-react';
import { OUTFITS, SWORDS, Outfit, Sword } from '../gameData';
import { soundEngine } from '../audioEngine';

interface WarriorScreenProps {
  playerLevel: number;
  playerXp: number;
  playerCoins: number;
  highestCompletedLevel: number;
  equippedOutfitId: string;
  equippedSwordId: string;
  upgradeRanks: Record<string, number>;
  onEquipOutfit: (outfitId: string) => void;
  onEquipSword: (swordId: string) => void;
  onBack: () => void;
}

export const WarriorScreen: React.FC<WarriorScreenProps> = ({
  playerLevel,
  playerXp,
  playerCoins,
  highestCompletedLevel,
  equippedOutfitId,
  equippedSwordId,
  upgradeRanks,
  onEquipOutfit,
  onEquipSword,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'outfits' | 'swords'>('outfits');
  const [selectedOutfitId, setSelectedOutfitId] = useState<string>(equippedOutfitId);
  const [selectedSwordId, setSelectedSwordId] = useState<string>(equippedSwordId);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentOutfit = OUTFITS.find((o) => o.id === selectedOutfitId) || OUTFITS[0];
  const currentSword = SWORDS.find((s) => s.id === selectedSwordId) || SWORDS[0];

  // Base and upgraded calculated stats
  const baseHp = 100 + (upgradeRanks.health || 0) * 25 + currentOutfit.hpBonus;
  const baseAtk = Math.round((15 + (upgradeRanks.attack || 0) * 2 + currentSword.bonusDamage) * currentOutfit.atkBonus);
  const specialAtk = Math.round(50 + (upgradeRanks.special_attack || 0) * 10 + currentSword.bonusDamage * 1.5);
  const defensePct = (upgradeRanks.defense || 0) * 5;

  // Draw real-time animated preview on canvas
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const startTime = performance.now();

    const renderPreview = (t: number) => {
      const time = t - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Radial pedestal glow
      const cx = canvas.width / 2;
      const cy = canvas.height * 0.75;
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 80);
      grad.addColorStop(0, currentOutfit.auraColor || 'rgba(245, 158, 11, 0.3)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 80, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw Warrior Queen preview
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1.5, 1.5);

      const breath = Math.sin(time * 0.005) * 2;
      const torsoY = -42 + breath;
      const capeWave = Math.sin(time * 0.008) * 8;

      // Aura
      if (currentOutfit.auraColor) {
        ctx.save();
        ctx.shadowColor = currentOutfit.auraColor;
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(0, torsoY + 10, 42, 0, Math.PI * 2);
        ctx.fillStyle = currentOutfit.auraColor;
        ctx.fill();
        ctx.restore();
      }

      // Cape
      ctx.fillStyle = currentOutfit.capeColor;
      ctx.beginPath();
      ctx.moveTo(-10, torsoY - 10);
      ctx.quadraticCurveTo(-35 + capeWave, torsoY + 15, -40 + capeWave, torsoY + 50);
      ctx.lineTo(-15 + capeWave * 0.5, torsoY + 54);
      ctx.quadraticCurveTo(-15, torsoY + 25, 0, torsoY - 5);
      ctx.closePath();
      ctx.fill();

      // Legs / Skirt
      ctx.fillStyle = currentOutfit.secondaryColor;
      ctx.fillRect(-12, torsoY + 34, 10, 24);
      ctx.fillRect(2, torsoY + 34, 10, 24);

      // Greaves
      ctx.fillStyle = currentOutfit.primaryColor;
      ctx.fillRect(-13, torsoY + 46, 12, 14);
      ctx.fillRect(1, torsoY + 46, 12, 14);

      // Torso
      ctx.fillStyle = currentOutfit.primaryColor;
      ctx.beginPath();
      ctx.roundRect(-12, torsoY - 10, 24, 32, [6, 6, 2, 2]);
      ctx.fill();

      // Jewel
      ctx.fillStyle = currentOutfit.accentColor;
      ctx.beginPath();
      ctx.arc(0, torsoY + 4, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = currentOutfit.id === 'outfit_10' ? '#c7d2fe' : '#d49767';
      ctx.beginPath();
      ctx.roundRect(-7, torsoY - 22, 15, 16, [6, 6, 4, 4]);
      ctx.fill();

      // Crown
      ctx.fillStyle = currentOutfit.accentColor;
      ctx.beginPath();
      ctx.moveTo(-8, torsoY - 20);
      ctx.lineTo(8, torsoY - 20);
      ctx.lineTo(12, torsoY - 30);
      ctx.lineTo(0, torsoY - 36);
      ctx.lineTo(-12, torsoY - 30);
      ctx.closePath();
      ctx.fill();

      // Sword
      ctx.save();
      ctx.translate(24, torsoY - 30);
      ctx.rotate(0.4 + Math.sin(time * 0.004) * 0.08);

      if (currentSword.glowColor) {
        ctx.shadowColor = currentSword.glowColor;
        ctx.shadowBlur = 18;
      }
      ctx.fillStyle = currentSword.bladeColor;
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.quadraticCurveTo(-4, -32, 6, -65);
      ctx.quadraticCurveTo(2, -32, 3, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = currentSword.hiltColor;
      ctx.fillRect(-7, 0, 14, 3.5);
      ctx.fillRect(-2, 3, 4, 11);
      ctx.restore();

      ctx.restore();

      animId = requestAnimationFrame(renderPreview);
    };

    animId = requestAnimationFrame(renderPreview);
    return () => cancelAnimationFrame(animId);
  }, [selectedOutfitId, selectedSwordId, currentOutfit, currentSword]);

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

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Award className="w-4 h-4" />
            <span>PLAYER LVL {playerLevel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300">
            <span>🪙 {playerCoins} COINS</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Preview & Stats, Right Equipment Select */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 flex-1 items-start">
        {/* Left Col: Live Preview & Hero Stats */}
        <div className="lg:col-span-5 flex flex-col items-center bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-2">
            <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">
              HERO PROGRESSION
            </span>
            <h2 className="font-cinzel text-2xl font-black text-amber-300">WARRIOR QUEEN</h2>
            <p className="text-xs text-neutral-400">{currentOutfit.title}</p>
          </div>

          {/* Interactive Canvas Avatar Preview */}
          <div className="relative w-full max-w-[280px] h-[260px] flex items-center justify-center my-2">
            <canvas ref={previewCanvasRef} width={280} height={260} className="w-full h-full object-contain" />
          </div>

          {/* Stat Meters */}
          <div className="w-full space-y-2.5 mt-2 bg-neutral-950/80 p-4 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Shield className="w-4 h-4" /> Health (HP)
              </span>
              <span className="font-bold text-neutral-100">{baseHp} HP</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Swords className="w-4 h-4" /> Attack Power
              </span>
              <span className="font-bold text-neutral-100">{baseAtk} DMG</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <Sparkles className="w-4 h-4" /> Special Power
              </span>
              <span className="font-bold text-neutral-100">{specialAtk} DMG</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <Zap className="w-4 h-4" /> Defense / Armor
              </span>
              <span className="font-bold text-neutral-100">+{defensePct}% DEF</span>
            </div>
          </div>

          {/* Equip Selected Item Action */}
          <div className="w-full mt-4">
            {activeTab === 'outfits' ? (
              <button
                disabled={selectedOutfitId === equippedOutfitId || currentOutfit.level > highestCompletedLevel + 1}
                onClick={() => {
                  soundEngine.playUpgrade();
                  onEquipOutfit(selectedOutfitId);
                }}
                className={`w-full py-3 rounded-xl font-cinzel font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${
                  selectedOutfitId === equippedOutfitId
                    ? 'bg-neutral-800 text-neutral-500 cursor-default'
                    : currentOutfit.level > highestCompletedLevel + 1
                    ? 'bg-rose-950/40 border border-rose-800/40 text-rose-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-95'
                }`}
              >
                {selectedOutfitId === equippedOutfitId ? (
                  <>
                    <Check className="w-4 h-4" /> CURRENTLY EQUIPPED
                  </>
                ) : currentOutfit.level > highestCompletedLevel + 1 ? (
                  <>
                    <Lock className="w-4 h-4" /> UNLOCK AT LEVEL {currentOutfit.level}
                  </>
                ) : (
                  'EQUIP THIS ARMOR'
                )}
              </button>
            ) : (
              <button
                disabled={selectedSwordId === equippedSwordId || currentSword.level > highestCompletedLevel + 1}
                onClick={() => {
                  soundEngine.playUpgrade();
                  onEquipSword(selectedSwordId);
                }}
                className={`w-full py-3 rounded-xl font-cinzel font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${
                  selectedSwordId === equippedSwordId
                    ? 'bg-neutral-800 text-neutral-500 cursor-default'
                    : currentSword.level > highestCompletedLevel + 1
                    ? 'bg-rose-950/40 border border-rose-800/40 text-rose-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-95'
                }`}
              >
                {selectedSwordId === equippedSwordId ? (
                  <>
                    <Check className="w-4 h-4" /> CURRENTLY EQUIPPED
                  </>
                ) : currentSword.level > highestCompletedLevel + 1 ? (
                  <>
                    <Lock className="w-4 h-4" /> UNLOCK AT LEVEL {currentSword.level}
                  </>
                ) : (
                  'EQUIP THIS SWORD'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Col: Equipment Browser (10 Outfits & 10 Swords) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Tab Switcher */}
          <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('outfits');
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-cinzel font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'outfits'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Shield className="w-4 h-4" /> WARRIOR OUTFITS (10)
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('swords');
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-cinzel font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'swords'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Swords className="w-4 h-4" /> BLADES & TALWARS (10)
            </button>
          </div>

          {/* List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
            {activeTab === 'outfits'
              ? OUTFITS.map((outfit) => {
                  const isUnlocked = outfit.level <= highestCompletedLevel + 1;
                  const isSelected = outfit.id === selectedOutfitId;
                  const isEquipped = outfit.id === equippedOutfitId;

                  return (
                    <div
                      key={outfit.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedOutfitId(outfit.id);
                      }}
                      className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/30 shadow-lg'
                          : isUnlocked
                          ? 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                          : 'border-neutral-900 bg-neutral-950/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-amber-500">LVL 0{outfit.level}</span>
                            {isEquipped && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500 text-neutral-950 font-bold">
                                EQUIPPED
                              </span>
                            )}
                          </div>
                          <h4 className="font-cinzel text-sm font-bold text-neutral-100">{outfit.name}</h4>
                          <p className="text-[10px] text-neutral-400">{outfit.title}</p>
                        </div>

                        {!isUnlocked && (
                          <div className="p-1 rounded bg-neutral-900 text-neutral-500">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-emerald-400 font-mono bg-neutral-950/60 p-2 rounded border border-neutral-800/80">
                        ⚡ {outfit.perk}
                      </div>

                      {!isUnlocked && (
                        <div className="text-[10px] text-rose-400 font-semibold">
                          🔒 Unlock at Level {outfit.level}
                        </div>
                      )}
                    </div>
                  );
                })
              : SWORDS.map((sword) => {
                  const isUnlocked = sword.level <= highestCompletedLevel + 1;
                  const isSelected = sword.id === selectedSwordId;
                  const isEquipped = sword.id === equippedSwordId;

                  return (
                    <div
                      key={sword.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedSwordId(sword.id);
                      }}
                      className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/30 shadow-lg'
                          : isUnlocked
                          ? 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                          : 'border-neutral-900 bg-neutral-950/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-amber-500">LVL 0{sword.level}</span>
                            {isEquipped && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500 text-neutral-950 font-bold">
                                EQUIPPED
                              </span>
                            )}
                          </div>
                          <h4 className="font-cinzel text-sm font-bold text-neutral-100">{sword.name}</h4>
                          <p className="text-[10px] text-neutral-400">{sword.title}</p>
                        </div>

                        {!isUnlocked && (
                          <div className="p-1 rounded bg-neutral-900 text-neutral-500">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-amber-300 font-mono bg-neutral-950/60 p-2 rounded border border-neutral-800/80 flex justify-between">
                        <span>+{sword.bonusDamage} DMG</span>
                        <span>{Math.round(sword.critChance * 100)}% CRIT</span>
                      </div>

                      {!isUnlocked && (
                        <div className="text-[10px] text-rose-400 font-semibold">
                          🔒 Unlock at Level {sword.level}
                        </div>
                      )}
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
};
