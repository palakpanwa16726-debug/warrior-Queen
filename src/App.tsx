import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LEVELS,
  OUTFITS,
  SWORDS,
  UPGRADES,
  DIFFICULTY_MODIFIERS,
  Difficulty,
  LevelConfig,
  Outfit,
  Sword,
} from './gameData';
import { soundEngine } from './audioEngine';
import { CanvasEngine, CombatEntity, Particle, DamageNumber } from './canvasEngine';

// Components
import { MainMenu } from './components/MainMenu';
import { LevelsScreen } from './components/LevelsScreen';
import { WarriorScreen } from './components/WarriorScreen';
import { UpgradesScreen } from './components/UpgradesScreen';
import { SettingsModal } from './components/SettingsModal';
import { HUD } from './components/HUD';
import { CombatControls } from './components/CombatControls';
import { PauseModal } from './components/PauseModal';
import { VictoryDefeatModal } from './components/VictoryDefeatModal';

const GROUND_Y = 475;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 560;

export default function App() {
  // Navigation & Screens
  const [screen, setScreen] = useState<'menu' | 'battle' | 'levels' | 'warrior' | 'upgrades'>('menu');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Persistent Progress (localStorage)
  const [highestCompletedLevel, setHighestCompletedLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('wq_highest_lvl') || '0', 10);
  });
  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(1);
  const [playerCoins, setPlayerCoins] = useState<number>(() => {
    return parseInt(localStorage.getItem('wq_coins') || '100', 10);
  });
  const [playerXp, setPlayerXp] = useState<number>(() => {
    return parseInt(localStorage.getItem('wq_xp') || '0', 10);
  });
  const [equippedOutfitId, setEquippedOutfitId] = useState<string>(() => {
    return localStorage.getItem('wq_outfit') || 'outfit_1';
  });
  const [equippedSwordId, setEquippedSwordId] = useState<string>(() => {
    return localStorage.getItem('wq_sword') || 'sword_1';
  });
  const [upgradeRanks, setUpgradeRanks] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('wq_upgrades');
      return stored ? JSON.parse(stored) : { health: 0, attack: 0, sword_power: 0, special_attack: 0, defense: 0 };
    } catch {
      return { health: 0, attack: 0, sword_power: 0, special_attack: 0, defense: 0 };
    }
  });
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    return (localStorage.getItem('wq_difficulty') as Difficulty) || 'NORMAL';
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('wq_muted') === 'true';
  });

  // Calculate Player Stats based on level, outfit, and upgrades
  const currentOutfit = OUTFITS.find((o) => o.id === equippedOutfitId) || OUTFITS[0];
  const currentSword = SWORDS.find((s) => s.id === equippedSwordId) || SWORDS[0];
  const playerMaxHp = 100 + (upgradeRanks.health || 0) * 25 + currentOutfit.hpBonus;
  const playerLevel = Math.floor(playerXp / 150) + 1;

  // Active Level Config
  const activeLevelConfig = LEVELS.find((l) => l.level === selectedLevelNum) || LEVELS[0];

  // Combat State
  const [playerHp, setPlayerHp] = useState<number>(playerMaxHp);
  const [totalEnemyHp, setTotalEnemyHp] = useState<number>(activeLevelConfig.enemyHp);
  const [totalEnemyMaxHp, setTotalEnemyMaxHp] = useState<number>(activeLevelConfig.enemyHp);
  const [bossPhase, setBossPhase] = useState<number>(1);
  const [combo, setCombo] = useState<number>(0);
  const [cooldowns, setCooldowns] = useState({
    slash: 0,
    power_strike: 0,
    special: 0,
    dash: 0,
  });
  const [isMovingLeft, setIsMovingLeft] = useState(false);
  const [isMovingRight, setIsMovingRight] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isInAttackRange, setIsInAttackRange] = useState(false);

  // Victory statistics
  const [sessionDamage, setSessionDamage] = useState(0);
  const [sessionMaxCombo, setSessionMaxCombo] = useState(0);
  const [newlyUnlockedOutfit, setNewlyUnlockedOutfit] = useState<Outfit | undefined>(undefined);
  const [newlyUnlockedSword, setNewlyUnlockedSword] = useState<Sword | undefined>(undefined);

  // Canvas Refs & Systems
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasEngineRef = useRef<CanvasEngine | null>(null);

  // Entities & Particle systems kept in mutable refs for smooth 60fps loop
  const playerRef = useRef<CombatEntity>({
    x: 200,
    y: GROUND_Y,
    facing: 1,
    health: playerMaxHp,
    maxHealth: playerMaxHp,
    animation: 'idle',
    animTimer: 0,
    animDuration: 0,
    isHurt: false,
    isDashing: false,
    activeAttack: null,
  });

  const enemiesRef = useRef<CombatEntity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const damageNumbersRef = useRef<DamageNumber[]>([]);
  const screenShakeRef = useRef({ x: 0, y: 0, intensity: 0 });
  const comboTimerRef = useRef<number>(0);
  const nextDamageIdRef = useRef(1);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('wq_highest_lvl', highestCompletedLevel.toString());
  }, [highestCompletedLevel]);

  useEffect(() => {
    localStorage.setItem('wq_coins', playerCoins.toString());
  }, [playerCoins]);

  useEffect(() => {
    localStorage.setItem('wq_xp', playerXp.toString());
  }, [playerXp]);

  useEffect(() => {
    localStorage.setItem('wq_outfit', equippedOutfitId);
  }, [equippedOutfitId]);

  useEffect(() => {
    localStorage.setItem('wq_sword', equippedSwordId);
  }, [equippedSwordId]);

  useEffect(() => {
    localStorage.setItem('wq_upgrades', JSON.stringify(upgradeRanks));
  }, [upgradeRanks]);

  useEffect(() => {
    localStorage.setItem('wq_difficulty', difficulty);
  }, [difficulty]);

  useEffect(() => {
    localStorage.setItem('wq_muted', isMuted ? 'true' : 'false');
    soundEngine.isMuted = isMuted;
  }, [isMuted]);

  // Handle Audio Mute Toggle
  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  // Upgrades purchase handler
  const handleBuyUpgrade = (upgradeId: string, cost: number) => {
    if (playerCoins >= cost) {
      setPlayerCoins((prev) => prev - cost);
      setUpgradeRanks((prev) => ({
        ...prev,
        [upgradeId]: (prev[upgradeId] || 0) + 1,
      }));
    }
  };

  // Reset Progress
  const handleResetProgress = () => {
    localStorage.clear();
    setHighestCompletedLevel(0);
    setSelectedLevelNum(1);
    setPlayerCoins(100);
    setPlayerXp(0);
    setEquippedOutfitId('outfit_1');
    setEquippedSwordId('sword_1');
    setUpgradeRanks({ health: 0, attack: 0, sword_power: 0, special_attack: 0, defense: 0 });
    setDifficulty('NORMAL');
    setIsSettingsOpen(false);
    setScreen('menu');
  };

  // Helper to add particles
  const addParticles = useCallback((x: number, y: number, count: number, type: Particle['type'], color: string) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        type,
      });
    }
  }, []);

  // Helper to add damage floating numbers
  const addDamageNumber = useCallback((x: number, y: number, value: number, isCrit: boolean, label?: string) => {
    damageNumbersRef.current.push({
      id: nextDamageIdRef.current++,
      x: x + (Math.random() * 20 - 10),
      y: y - 25,
      value,
      isCrit,
      color: isCrit ? '#facc15' : '#ffffff',
      life: 45,
      maxLife: 45,
      label,
    });
  }, []);

  // Initialize Battle
  const initBattle = useCallback(
    (lvlNum: number) => {
      const lvl = LEVELS.find((l) => l.level === lvlNum) || LEVELS[0];
      const diffMod = DIFFICULTY_MODIFIERS[difficulty];

      const hp = 100 + (upgradeRanks.health || 0) * 25 + currentOutfit.hpBonus;
      playerRef.current = {
        x: 180,
        y: GROUND_Y,
        facing: 1,
        health: hp,
        maxHealth: hp,
        animation: 'idle',
        animTimer: 0,
        animDuration: 0,
        isHurt: false,
        isDashing: false,
        activeAttack: null,
      };
      setPlayerHp(hp);

      // Create Enemies based on Level Config (single or dual)
      const adjustedEnemyHp = Math.round(lvl.enemyHp * (lvl.enemyCount > 1 ? 0.75 : 1.0));
      const newEnemies: CombatEntity[] = [];

      for (let i = 0; i < lvl.enemyCount; i++) {
        const spawnX = lvl.enemyCount === 1 ? 750 : i === 0 ? 700 : 860;
        newEnemies.push({
          x: spawnX,
          y: GROUND_Y,
          facing: -1,
          health: adjustedEnemyHp,
          maxHealth: adjustedEnemyHp,
          animation: 'idle',
          animTimer: 0,
          animDuration: 0,
          isHurt: false,
          isAttacking: false,
          telegraphTimer: 0,
          role: lvl.enemyType,
          name: lvl.enemyName,
          phase: 1,
        });
      }

      enemiesRef.current = newEnemies;
      setTotalEnemyHp(adjustedEnemyHp * lvl.enemyCount);
      setTotalEnemyMaxHp(adjustedEnemyHp * lvl.enemyCount);
      setBossPhase(1);
      setCombo(0);
      comboTimerRef.current = 0;
      setSessionDamage(0);
      setSessionMaxCombo(0);
      setNewlyUnlockedOutfit(undefined);
      setNewlyUnlockedSword(undefined);
      setIsGameOverModalOpen(false);
      setIsVictory(false);
      setIsPaused(false);
      particlesRef.current = [];
      damageNumbersRef.current = [];
      setCooldowns({ slash: 0, power_strike: 0, special: 0, dash: 0 });
    },
    [difficulty, upgradeRanks, currentOutfit]
  );

  // Trigger attack from user input
  const handleAttack = useCallback(
    (attackId: 'slash' | 'power_strike' | 'special') => {
      if (cooldowns[attackId] > 0 || isAttacking || isPaused || isGameOverModalOpen) return;

      const player = playerRef.current;
      if (player.animation === 'defeat') return;

      // Base Damages
      let baseDmg = attackId === 'slash' ? 15 : attackId === 'power_strike' ? 30 : 50;
      const attackRank = upgradeRanks.attack || 0;
      baseDmg += attackRank * 2;
      baseDmg += currentSword.bonusDamage;
      baseDmg = Math.round(baseDmg * currentOutfit.atkBonus);

      if (attackId === 'special') {
        const specialRank = upgradeRanks.special_attack || 0;
        baseDmg += specialRank * 8;
      }

      // Combo Multiplier (+5% per combo hit up to +35%)
      const comboMult = 1 + Math.min(0.35, combo * 0.05);
      baseDmg = Math.round(baseDmg * comboMult);

      // Duration & Cooldowns
      const duration = attackId === 'slash' ? 0.35 : attackId === 'power_strike' ? 0.55 : 0.85;
      const cd =
        attackId === 'slash'
          ? 0.45
          : attackId === 'power_strike'
          ? 2.5
          : Math.max(3.5, 6.0 - (upgradeRanks.special_attack || 0) * 0.5);

      setCooldowns((prev) => ({ ...prev, [attackId]: cd }));
      setIsAttacking(true);

      player.animation = attackId;
      player.activeAttack = attackId;
      player.animTimer = 0;
      player.animDuration = duration;

      // Audio whoosh
      soundEngine.playSlash(attackId === 'slash' ? 'light' : attackId === 'power_strike' ? 'heavy' : 'whirlwind');

      // Check hits against in-range enemies
      const attackRange = attackId === 'special' ? 180 : 130;
      let hitAny = false;

      enemiesRef.current.forEach((enemy) => {
        if (enemy.animation === 'defeat') return;
        const dist = Math.abs(enemy.x - player.x);

        if (dist <= attackRange) {
          hitAny = true;
          // Check for Armored Block (Level 4 Shield captain)
          const isBlocked = enemy.role === 'armored' && enemy.facing !== player.facing && attackId === 'slash';

          if (isBlocked) {
            soundEngine.playHit(false, true);
            addDamageNumber(enemy.x, enemy.y - 40, 0, false, 'BLOCKED!');
            addParticles(enemy.x, enemy.y - 40, 6, 'spark', '#cbd5e1');
            return;
          }

          // Calculate Critical Hit
          const swordPowerRank = upgradeRanks.sword_power || 0;
          const critRate = currentSword.critChance + swordPowerRank * 0.04;
          const isCrit = Math.random() < critRate;
          const critMultiplier = isCrit ? 1.5 + swordPowerRank * 0.15 : 1.0;
          const finalDamage = Math.round(baseDmg * critMultiplier);

          enemy.health = Math.max(0, enemy.health - finalDamage);
          enemy.isHurt = true;
          enemy.animation = enemy.health <= 0 ? 'defeat' : 'damage';
          enemy.animTimer = 0;
          enemy.animDuration = 0.35;

          // Knocks back slightly
          enemy.x += player.facing * (attackId === 'power_strike' ? 24 : 14);

          soundEngine.playHit(isCrit);
          soundEngine.playEnemyHurt();
          addDamageNumber(enemy.x, enemy.y - 40, finalDamage, isCrit, isCrit ? 'CRITICAL!' : undefined);
          addParticles(
            enemy.x,
            enemy.y - 35,
            isCrit ? 16 : 8,
            'spark',
            currentSword.glowColor || currentSword.bladeColor
          );

          if (attackId === 'power_strike') {
            screenShakeRef.current = { x: 0, y: 0, intensity: 10 };
            canvasEngineRef.current?.addGroundCrack(enemy.x, GROUND_Y);
          }

          setSessionDamage((prev) => prev + finalDamage);

          // Update Boss Phase if Final Boss
          if (activeLevelConfig.isFinalBoss) {
            const hpRatio = enemy.health / enemy.maxHealth;
            if (hpRatio <= 0.3 && enemy.phase !== 3) {
              enemy.phase = 3;
              setBossPhase(3);
              soundEngine.playBossRoar();
              screenShakeRef.current = { x: 0, y: 0, intensity: 14 };
            } else if (hpRatio <= 0.65 && (enemy.phase || 1) < 2) {
              enemy.phase = 2;
              setBossPhase(2);
              soundEngine.playBossRoar();
              screenShakeRef.current = { x: 0, y: 0, intensity: 10 };
            }
          }
        }
      });

      // Combo System Handling
      if (hitAny) {
        setCombo((prev) => {
          const next = prev + 1;
          setSessionMaxCombo((max) => Math.max(max, next));
          soundEngine.playCombo(next);
          return next;
        });
        comboTimerRef.current = 2.4; // 2.4s window to maintain combo
      }
    },
    [
      cooldowns,
      isAttacking,
      isPaused,
      isGameOverModalOpen,
      upgradeRanks,
      currentSword,
      currentOutfit,
      combo,
      activeLevelConfig,
      addDamageNumber,
      addParticles,
    ]
  );

  // Trigger Dash
  const handleDash = useCallback(() => {
    if (cooldowns.dash > 0 || isPaused || isGameOverModalOpen) return;
    const player = playerRef.current;
    if (player.animation === 'defeat') return;

    soundEngine.playDash();
    player.isDashing = true;
    player.x += player.facing * 90;
    player.x = Math.max(80, Math.min(CANVAS_WIDTH - 80, player.x));
    setCooldowns((prev) => ({ ...prev, dash: 1.2 }));

    addParticles(player.x, player.y - 20, 10, 'ring', 'rgba(56, 189, 248, 0.8)');

    setTimeout(() => {
      player.isDashing = false;
    }, 220);
  }, [cooldowns.dash, isPaused, isGameOverModalOpen, addParticles]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'battle' || isPaused || isGameOverModalOpen) return;

      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        setIsMovingLeft(true);
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        setIsMovingRight(true);
      } else if (e.key === ' ' || e.key === 'Shift') {
        handleDash();
      } else if (e.key === '1' || e.key === 'j' || e.key === 'J') {
        handleAttack('slash');
      } else if (e.key === '2' || e.key === 'k' || e.key === 'K') {
        handleAttack('power_strike');
      } else if (e.key === '3' || e.key === 'l' || e.key === 'L') {
        handleAttack('special');
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setIsPaused((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        setIsMovingLeft(false);
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        setIsMovingRight(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen, isPaused, isGameOverModalOpen, handleAttack, handleDash]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    if (screen !== 'battle') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new CanvasEngine(canvas);
    canvasEngineRef.current = engine;

    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (!isPaused && !isGameOverModalOpen) {
        // 1. Update Cooldowns
        setCooldowns((prev) => ({
          slash: Math.max(0, prev.slash - dt),
          power_strike: Math.max(0, prev.power_strike - dt),
          special: Math.max(0, prev.special - dt),
          dash: Math.max(0, prev.dash - dt),
        }));

        // 2. Update Combo Timer
        if (comboTimerRef.current > 0) {
          comboTimerRef.current -= dt;
          if (comboTimerRef.current <= 0) {
            setCombo(0);
          }
        }

        // 3. Screen Shake Decay
        if (screenShakeRef.current.intensity > 0) {
          screenShakeRef.current.x = (Math.random() - 0.5) * screenShakeRef.current.intensity;
          screenShakeRef.current.y = (Math.random() - 0.5) * screenShakeRef.current.intensity;
          screenShakeRef.current.intensity -= dt * 25;
          if (screenShakeRef.current.intensity <= 0) {
            screenShakeRef.current = { x: 0, y: 0, intensity: 0 };
          }
        }

        // 4. Update Player Movement & State
        const player = playerRef.current;
        if (player.animation !== 'defeat') {
          const moveSpeed = (200 + (upgradeRanks.attack || 0) * 5) * currentOutfit.spdBonus;

          if (isMovingLeft && !player.activeAttack) {
            player.x -= moveSpeed * dt;
            player.facing = -1;
            player.animation = 'walk';
          } else if (isMovingRight && !player.activeAttack) {
            player.x += moveSpeed * dt;
            player.facing = 1;
            player.animation = 'walk';
          } else if (!player.activeAttack && player.animation !== 'damage') {
            player.animation = 'idle';
          }

          player.x = Math.max(80, Math.min(CANVAS_WIDTH - 80, player.x));

          // Player Animation Timer
          if (player.animDuration > 0) {
            player.animTimer += dt;
            if (player.animTimer >= player.animDuration) {
              player.animTimer = 0;
              player.animDuration = 0;
              player.activeAttack = null;
              player.isHurt = false;
              setIsAttacking(false);
              player.animation = 'idle';
            }
          }
        }

        // 5. Update Enemies AI & Combat Logic
        const diffMod = DIFFICULTY_MODIFIERS[difficulty];
        let totalRemainingEnemyHp = 0;
        let anyInRange = false;

        enemiesRef.current.forEach((enemy) => {
          if (enemy.animation === 'defeat') return;
          totalRemainingEnemyHp += enemy.health;

          const distToPlayer = Math.abs(player.x - enemy.x);
          const dirToPlayer = player.x < enemy.x ? -1 : 1;
          enemy.facing = dirToPlayer as 1 | -1;

          if (distToPlayer <= 140) {
            anyInRange = true;
          }

          // Enemy Approach Movement
          if (!enemy.isAttacking && enemy.animation !== 'damage' && player.animation !== 'defeat') {
            const attackDistance = activeLevelConfig.isFinalBoss ? 115 : 95;

            if (distToPlayer > attackDistance) {
              const speed = activeLevelConfig.enemySpeed * diffMod.spdMult;
              enemy.x += dirToPlayer * speed * dt;
              enemy.animation = 'walk';
            } else {
              enemy.animation = 'idle';
              // In attack range: countdown telegraph & attack
              if (!enemy.telegraphTimer) enemy.telegraphTimer = 0;
              enemy.telegraphTimer += dt;

              const attackThreshold = (activeLevelConfig.attackInterval / diffMod.spdMult) * 0.6;
              if (enemy.telegraphTimer >= attackThreshold) {
                // Launch Enemy Attack
                enemy.isAttacking = true;
                enemy.animation = 'slash';
                enemy.animTimer = 0;
                enemy.animDuration = 0.5;
                enemy.telegraphTimer = 0;
                soundEngine.playSlash('heavy');
              }
            }
          }

          // Process Enemy Attack Impact on Player
          if (enemy.isAttacking) {
            enemy.animTimer += dt;
            const progress = enemy.animTimer / enemy.animDuration;

            // Damage impact frame
            if (progress >= 0.5 && !enemy.isHurt && !player.isDashing && player.animation !== 'defeat') {
              if (distToPlayer <= (activeLevelConfig.isFinalBoss ? 135 : 110)) {
                // Calculate Player Damage with Defense Upgrade & Outfit Perk
                const rawDmg = activeLevelConfig.enemyDamage * diffMod.dmgMult;
                const defReduction = Math.min(0.4, (upgradeRanks.defense || 0) * 0.05);
                const finalDamageToPlayer = Math.max(1, Math.round(rawDmg * (1 - defReduction)));

                player.health = Math.max(0, player.health - finalDamageToPlayer);
                setPlayerHp(player.health);
                player.isHurt = true;
                player.animation = player.health <= 0 ? 'defeat' : 'damage';
                player.animTimer = 0;
                player.animDuration = 0.3;

                // Push player back
                player.x += (enemy.facing as number) * 20;
                screenShakeRef.current = { x: 0, y: 0, intensity: 8 };

                soundEngine.playHit();
                addDamageNumber(player.x, player.y - 45, finalDamageToPlayer, false, 'HERO HURT');
                addParticles(player.x, player.y - 35, 8, 'blood', '#ef4444');

                // Check Player Defeat
                if (player.health <= 0) {
                  soundEngine.playDefeat();
                  setTimeout(() => {
                    setIsVictory(false);
                    setIsGameOverModalOpen(true);
                  }, 900);
                }
              }
            }

            if (enemy.animTimer >= enemy.animDuration) {
              enemy.animTimer = 0;
              enemy.animDuration = 0;
              enemy.isAttacking = false;
              enemy.isHurt = false;
              enemy.animation = 'idle';
            }
          }

          // Enemy Hurt recovery
          if (enemy.animation === 'damage') {
            enemy.animTimer += dt;
            if (enemy.animTimer >= enemy.animDuration) {
              enemy.animTimer = 0;
              enemy.animation = 'idle';
              enemy.isHurt = false;
            }
          }
        });

        setIsInAttackRange(anyInRange);
        setTotalEnemyHp(totalRemainingEnemyHp);

        // 6. Check Level Victory (All enemies dead)
        if (totalRemainingEnemyHp <= 0 && player.health > 0) {
          const allEnemiesDefeated = enemiesRef.current.every((e) => e.health <= 0);
          if (allEnemiesDefeated) {
            soundEngine.playVictory();

            // Grant XP and Coins rewards
            const coins = activeLevelConfig.coinsReward;
            const xp = activeLevelConfig.xpReward;
            setPlayerCoins((prev) => prev + coins);
            setPlayerXp((prev) => prev + xp);

            // Unlock next items if this level completes a milestone
            if (activeLevelConfig.level >= highestCompletedLevel) {
              const nextOutfit = OUTFITS.find((o) => o.level === activeLevelConfig.level + 1);
              const nextSword = SWORDS.find((s) => s.level === activeLevelConfig.level + 1);
              setNewlyUnlockedOutfit(nextOutfit);
              setNewlyUnlockedSword(nextSword);
              setHighestCompletedLevel(activeLevelConfig.level);
            }

            setTimeout(() => {
              setIsVictory(true);
              setIsGameOverModalOpen(true);
            }, 1000);
          }
        }
      }

      // 7. Render Everything on Canvas
      engine.render(
        playerRef.current,
        enemiesRef.current,
        activeLevelConfig,
        currentOutfit,
        currentSword,
        particlesRef.current,
        damageNumbersRef.current,
        screenShakeRef.current,
        currentTime,
        combo
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    screen,
    isPaused,
    isGameOverModalOpen,
    difficulty,
    activeLevelConfig,
    currentOutfit,
    currentSword,
    highestCompletedLevel,
    isMovingLeft,
    isMovingRight,
    upgradeRanks,
    combo,
    addDamageNumber,
    addParticles,
  ]);

  // Action: Start Game / Select Level
  const handleStartLevel = (lvlNum: number) => {
    setSelectedLevelNum(lvlNum);
    initBattle(lvlNum);
    setScreen('battle');
  };

  const handleNextLevel = () => {
    const nextLvl = Math.min(10, selectedLevelNum + 1);
    setSelectedLevelNum(nextLvl);
    initBattle(nextLvl);
    setScreen('battle');
  };

  const handleRetry = () => {
    initBattle(selectedLevelNum);
    setScreen('battle');
  };

  const handleReturnToMenu = () => {
    setIsGameOverModalOpen(false);
    setIsPaused(false);
    setScreen('menu');
  };

  // Pre-calculated displayed attack damage values
  const slashDmg = Math.round(
    (15 + (upgradeRanks.attack || 0) * 2 + currentSword.bonusDamage) * currentOutfit.atkBonus
  );
  const powerDmg = Math.round(
    (30 + (upgradeRanks.attack || 0) * 2 + currentSword.bonusDamage) * currentOutfit.atkBonus
  );
  const specialDmg = Math.round(
    (50 + (upgradeRanks.special_attack || 0) * 8 + currentSword.bonusDamage * 1.5) * currentOutfit.atkBonus
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans select-none flex flex-col justify-center items-center">
      {/* 1. MAIN MENU SCREEN */}
      {screen === 'menu' && (
        <MainMenu
          onPlay={() => handleStartLevel(Math.min(10, highestCompletedLevel + 1))}
          onOpenLevels={() => setScreen('levels')}
          onOpenWarrior={() => setScreen('warrior')}
          onOpenUpgrades={() => setScreen('upgrades')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          playerLevel={playerLevel}
          playerCoins={playerCoins}
          highestCompletedLevel={highestCompletedLevel}
        />
      )}

      {/* 2. LEVELS MAP SCREEN */}
      {screen === 'levels' && (
        <LevelsScreen
          highestCompletedLevel={highestCompletedLevel}
          currentDifficulty={difficulty}
          onChangeDifficulty={setDifficulty}
          onSelectLevel={handleStartLevel}
          onBack={() => setScreen('menu')}
        />
      )}

      {/* 3. WARRIOR SCREEN (CHARACTER PROGRESSION & WARDROBE) */}
      {screen === 'warrior' && (
        <WarriorScreen
          playerLevel={playerLevel}
          playerXp={playerXp}
          playerCoins={playerCoins}
          highestCompletedLevel={highestCompletedLevel}
          equippedOutfitId={equippedOutfitId}
          equippedSwordId={equippedSwordId}
          upgradeRanks={upgradeRanks}
          onEquipOutfit={setEquippedOutfitId}
          onEquipSword={setEquippedSwordId}
          onBack={() => setScreen('menu')}
        />
      )}

      {/* 4. UPGRADES SHOP SCREEN */}
      {screen === 'upgrades' && (
        <UpgradesScreen
          playerCoins={playerCoins}
          upgradeRanks={upgradeRanks}
          onBuyUpgrade={handleBuyUpgrade}
          onBack={() => setScreen('menu')}
        />
      )}

      {/* 5. BATTLE ARENA SCREEN */}
      {screen === 'battle' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
          {/* Top HUD */}
          <HUD
            playerHealth={playerHp}
            playerMaxHealth={playerMaxHp}
            enemyHealth={totalEnemyHp}
            enemyMaxHealth={totalEnemyMaxHp}
            enemyName={activeLevelConfig.enemyName}
            combo={combo}
            level={activeLevelConfig}
            bossPhase={bossPhase}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={() => setIsPaused(true)}
          />

          {/* Interactive Battle Canvas (1000 x 560 virtual resolution, auto scaling) */}
          <div className="relative w-full max-w-5xl aspect-[1000/560] max-h-[85vh] flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full h-full object-contain rounded-xl shadow-2xl border border-neutral-900"
            />
          </div>

          {/* Bottom Combat Controls */}
          <CombatControls
            cooldowns={cooldowns}
            onAttack={handleAttack}
            onDash={handleDash}
            onMoveStart={(dir) => {
              if (dir === -1) setIsMovingLeft(true);
              if (dir === 1) setIsMovingRight(true);
            }}
            onMoveEnd={() => {
              setIsMovingLeft(false);
              setIsMovingRight(false);
            }}
            isMovingLeft={isMovingLeft}
            isMovingRight={isMovingRight}
            isAttacking={isAttacking}
            isInAttackRange={isInAttackRange}
            slashDamage={slashDmg}
            powerDamage={powerDmg}
            specialDamage={specialDmg}
          />
        </div>
      )}

      {/* PAUSE MODAL */}
      {isPaused && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestart={handleRetry}
          onReturnToMenu={handleReturnToMenu}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* VICTORY / DEFEAT MODAL */}
      {isGameOverModalOpen && (
        <VictoryDefeatModal
          isVictory={isVictory}
          level={activeLevelConfig}
          unlockedOutfit={newlyUnlockedOutfit}
          unlockedSword={newlyUnlockedSword}
          coinsEarned={activeLevelConfig.coinsReward}
          xpEarned={activeLevelConfig.xpReward}
          totalDamageDealt={sessionDamage}
          maxCombo={sessionMaxCombo}
          onNextLevel={handleNextLevel}
          onRetry={handleRetry}
          onMainMenu={handleReturnToMenu}
        />
      )}

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <SettingsModal
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          currentDifficulty={difficulty}
          onChangeDifficulty={setDifficulty}
          onResetProgress={handleResetProgress}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
