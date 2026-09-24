// ============================================================================
// WARRIOR QUEEN - PROCEDURAL CANVAS RENDERING ENGINE
// 10 Distinct Battlegrounds, 10 Warrior Outfits, 10 Swords, 7 Enemy Architectures
// ============================================================================

import { LevelConfig, Outfit, Sword } from './gameData';

export interface CombatEntity {
  x: number;
  y: number;
  facing: 1 | -1;
  health: number;
  maxHealth: number;
  animation: 'idle' | 'walk' | 'slash' | 'power_strike' | 'special' | 'damage' | 'defeat';
  animTimer: number;
  animDuration: number;
  isHurt: boolean;
  isDashing?: boolean;
  activeAttack?: string | null;
  isAttacking?: boolean;
  telegraphTimer?: number;
  isBlocking?: boolean;
  role?: string;
  name?: string;
  phase?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'spark' | 'ember' | 'blood' | 'ring' | 'shockwave' | 'magic' | 'fissure';
  radius?: number;
  maxRadius?: number;
}

export interface DamageNumber {
  id: number;
  x: number;
  y: number;
  value: number;
  isCrit: boolean;
  color: string;
  life: number;
  maxLife: number;
  label?: string;
}

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private groundCracks: Array<{ x: number; y: number; alpha: number }> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get canvas 2d context');
    this.ctx = context;
  }

  public addGroundCrack(x: number, y: number) {
    this.groundCracks.push({ x, y, alpha: 1.0 });
    if (this.groundCracks.length > 8) this.groundCracks.shift();
  }

  public render(
    player: CombatEntity,
    enemies: CombatEntity[],
    level: LevelConfig,
    outfit: Outfit,
    sword: Sword,
    particles: Particle[],
    damageNumbers: DamageNumber[],
    shake: { x: number; y: number },
    time: number,
    combo: number
  ) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const groundY = 475;

    ctx.save();
    ctx.translate(shake.x, shake.y);

    // 1. Draw 1 of 10 Procedural Backgrounds
    this.drawBackground(ctx, w, h, groundY, level.bgTheme, time, level.level);

    // 2. Draw Ground Cracks from Power Strikes
    this.drawGroundCracks(ctx, groundY);

    // 3. Shadows
    this.drawShadow(ctx, player.x, groundY, 46, 12);
    enemies.forEach((e) => {
      const radius = e.role === 'finalboss' ? 70 : e.role === 'miniboss' ? 56 : 46;
      this.drawShadow(ctx, e.x, groundY, radius, 13);
    });

    // 4. Draw Enemies
    enemies.forEach((e) => {
      this.drawEnemy(ctx, e, level, time, groundY);
    });

    // 5. Draw Player (Warrior Queen)
    this.drawPlayer(ctx, player, outfit, sword, time, groundY);

    // 6. Active Attack Auras (Special Cyclone, etc.)
    if (player.activeAttack === 'special') {
      this.drawCycloneAura(ctx, player, sword, time);
    }

    // 7. Particles
    this.drawParticles(ctx, particles);

    // 8. Damage Numbers
    this.drawDamageNumbers(ctx, damageNumbers);

    // 9. Floating Combo Alert Banner
    if (combo >= 2) {
      this.drawComboBanner(ctx, player.x, player.y - 110, combo, time);
    }

    ctx.restore();
  }

  // ==========================================================================
  // PROCEDURAL BACKGROUNDS (10 DISTINCT THEMES)
  // ==========================================================================
  private drawBackground(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    groundY: number,
    theme: LevelConfig['bgTheme'],
    time: number,
    levelNum: number
  ) {
    ctx.save();

    if (theme === 'training_ground') {
      // 1. Courtyard Training Grounds
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#1e1b2e');
      skyGrad.addColorStop(1, '#3b2d54');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, groundY);

      // Distant fortress walls & battlements
      ctx.fillStyle = '#181326';
      for (let i = 0; i < 9; i++) {
        const bx = i * 120 - 20;
        ctx.fillRect(bx, 150, 70, groundY - 150);
        ctx.fillRect(bx + 15, 130, 40, 20); // crenellations
      }

      // Wooden training dummies on the far edges
      this.drawTrainingDummy(ctx, 110, groundY - 80);
      this.drawTrainingDummy(ctx, w - 120, groundY - 80);

      // Floor
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, h);
      floorGrad.addColorStop(0, '#2d2438');
      floorGrad.addColorStop(1, '#130f1c');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, w, h - groundY);

      // Flagstone grid
      ctx.strokeStyle = '#221a2c';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x - 40, h);
        ctx.stroke();
      }
    } else if (theme === 'emerald_forest') {
      // 2. Emerald Forest
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#062817');
      skyGrad.addColorStop(1, '#14532d');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, groundY);

      // Sunbeams filtering through canopy
      ctx.fillStyle = 'rgba(234, 179, 8, 0.05)';
      ctx.beginPath();
      ctx.moveTo(200, 0);
      ctx.lineTo(340, groundY);
      ctx.lineTo(440, groundY);
      ctx.lineTo(260, 0);
      ctx.fill();

      // Ancient towering tree trunks
      ctx.fillStyle = '#052e16';
      for (let i = 0; i < 6; i++) {
        const tx = i * 190 + 30;
        ctx.fillRect(tx, 0, 50, groundY);
        // Hanging moss
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(tx + 25, 120, 20, 0, Math.PI);
        ctx.stroke();
      }

      // Forest Floor with moss & loam
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, h);
      floorGrad.addColorStop(0, '#14532d');
      floorGrad.addColorStop(1, '#052e16');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, w, h - groundY);
    } else if (theme === 'ancient_temple') {
      // 3. Ancient Sun Temple
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#451a03');
      skyGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, groundY);

      // Carved stone pillars
      ctx.fillStyle = '#291404';
      for (let i = 0; i < 6; i++) {
        const px = i * 180 + 40;
        ctx.fillRect(px, 80, 55, groundY - 80);
        ctx.fillRect(px - 10, 80, 75, 15); // capital
        ctx.fillRect(px - 8, groundY - 15, 71, 15); // base
      }

      // Temple Braziers
      this.drawBrazier(ctx, 80, groundY - 55, time);
      this.drawBrazier(ctx, w - 80, groundY - 55, time + 1000);

      // Floor
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, h);
      floorGrad.addColorStop(0, '#3b1c08');
      floorGrad.addColorStop(1, '#1b0c03');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, w, h - groundY);
    } else if (theme === 'mountain_crag') {
      // 4. Mist Crag Mountain
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#0c1a2e');
      skyGrad.addColorStop(1, '#1e3a5f');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, groundY);

      // Snow-capped mountain peaks
      ctx.fillStyle = '#0f243d';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(200, 110);
      ctx.lineTo(400, groundY);
      ctx.lineTo(650, 80);
      ctx.lineTo(900, groundY);
      ctx.lineTo(w, 180);
      ctx.lineTo(w, groundY);
      ctx.fill();

      // Snow caps
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.moveTo(200, 110);
      ctx.lineTo(170, 150);
      ctx.lineTo(230, 150);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(650, 80);
      ctx.lineTo(610, 130);
      ctx.lineTo(690, 130);
      ctx.fill();

      // Cold rock floor
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, h);
      floorGrad.addColorStop(0, '#1e293b');
      floorGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, w, h - groundY);
    } else if (theme === 'castle_arena') {
      // 5. Castle Arena (Mini-Boss Arena)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#1c1917');
      skyGrad.addColorStop(1, '#44403c');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, groundY);

      // Grand archways and royal red banners
      ctx.fillStyle = '#292524';
      for (let i = 0; i < 7; i++) {
        const ax = i * 150 + 20;
        ctx.beginPath();
        ctx.roundRect(ax, 110, 95, groundY - 110, [45, 45, 0, 0]);
        ctx.fill();

        // Royal crimson banner
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(ax + 25, 150, 45, 120);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(ax + 30, 155, 35, 4);
        ctx.fillStyle = '#292524';
      }

      // Royal stone floor
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, h);
      floorGrad.addColorStop(0, '#44403c');
      floorGrad.addColorStop(1, '#1c1917');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, w, h - groundY);
    } else if (theme === 'burning_field') {
      // 6. Burning Battlefield
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#450a0a');
      skyGrad.addColorStop(0.5, '#7f1d1d');
      skyGrad.addColorStop(1, '#c2410c');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, groundY);

      // Flaming wreckage silhouettes
      ctx.fillStyle = '#1c0707';
      for (let i = 0; i < 5; i++) {
        const sx = i * 220 + 40;
        ctx.fillRect(sx, groundY - 120, 60, 120);
        ctx.beginPath();
        ctx.moveTo(sx - 20, groundY);
        ctx.lineTo(sx + 30, groundY - 160);
        ctx.lineTo(sx + 80, groundY);
        ctx.fill();
      }

      // Scorched earth floor
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, h);
      floorGrad.addColorStop(0, '#291008');
      floorGrad.addColorStop(1, '#0f0502');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, w, h - groundY);
    } else if (theme === 'dark_forest') {
      // 7. Dark Ethereal Forest
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#1e1035');
      skyGrad.addColorStop(1, '#3b0764');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, groundY);

      // Ethereal Moon
      ctx.fillStyle = '#f3e8ff';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(w - 180, 90, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Gnarled trees
      ctx.fillStyle = '#120722';
      for (let i = 0; i < 6; i++) {
        const gx = i * 180 + 30;
        ctx.fillRect(gx, 0, 40, groundY);
      }

      // Floor
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, h);
      floorGrad.addColorStop(0, '#240f3e');
      floorGrad.addColorStop(1, '#0c0414');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, w, h - groundY);
    } else if (theme === 'ancient_ruins') {
      // 8. Ancient Ruins
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#064e3b');
      skyGrad.addColorStop(1, '#065f46');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, groundY);

      // Crumbling monolithic pillars
      ctx.fillStyle = '#062d23';
      for (let i = 0; i < 7; i++) {
        const rx = i * 160 + 20;
        const colHeight = 140 + (i % 3) * 60;
        ctx.fillRect(rx, groundY - colHeight, 50, colHeight);
      }

      // Overgrown floor
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, h);
      floorGrad.addColorStop(0, '#047857');
      floorGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, w, h - groundY);
    } else if (theme === 'dark_fortress') {
      // 9. Dark Royal Fortress
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#09090b');
      skyGrad.addColorStop(0.5, '#450a0a');
      skyGrad.addColorStop(1, '#18181b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, groundY);

      // Crimson Blood Moon
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(220, 85, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Fortress Spikes & Towers
      ctx.fillStyle = '#09090b';
      for (let i = 0; i < 6; i++) {
        const fx = i * 190 + 30;
        ctx.fillRect(fx, 90, 70, groundY - 90);
        ctx.beginPath();
        ctx.moveTo(fx - 10, 90);
        ctx.lineTo(fx + 35, 30);
        ctx.lineTo(fx + 80, 90);
        ctx.fill();
      }

      // Obsidian floor
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, h);
      floorGrad.addColorStop(0, '#1c1917');
      floorGrad.addColorStop(1, '#000000');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, w, h - groundY);
    } else {
      // 10. Volcanic Throne of Ashva (FINAL BOSS ARENA)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#2e0202');
      skyGrad.addColorStop(0.4, '#7f1d1d');
      skyGrad.addColorStop(0.8, '#ea580c');
      skyGrad.addColorStop(1, '#fbbf24');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, groundY);

      // Cosmic / Molten lightning bolts occasionally
      if (Math.sin(time * 0.003) > 0.94) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2 - 30, 80);
        ctx.lineTo(w / 2 + 20, 160);
        ctx.lineTo(w / 2 - 15, groundY);
        ctx.stroke();
      }

      // Massive obsidian demon horns on flanks
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(120, groundY);
      ctx.quadraticCurveTo(80, 100, 20, 40);
      ctx.lineTo(0, 60);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w, groundY);
      ctx.lineTo(w - 120, groundY);
      ctx.quadraticCurveTo(w - 80, 100, w - 20, 40);
      ctx.lineTo(w, 60);
      ctx.fill();

      // Cracked obsidian floor with glowing lava veins
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, h);
      floorGrad.addColorStop(0, '#180703');
      floorGrad.addColorStop(1, '#050101');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, w, h - groundY);

      // Molten magma fissures
      ctx.strokeStyle = '#ea580c';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(100, groundY + 20);
      ctx.lineTo(350, groundY + 45);
      ctx.lineTo(600, groundY + 25);
      ctx.lineTo(880, groundY + 50);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Vignette top & bottom
    const vGrad = ctx.createLinearGradient(0, 0, 0, h);
    vGrad.addColorStop(0, 'rgba(0,0,0,0.5)');
    vGrad.addColorStop(0.3, 'rgba(0,0,0,0)');
    vGrad.addColorStop(0.85, 'rgba(0,0,0,0.3)');
    vGrad.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  // Draw training dummy
  private drawTrainingDummy(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 5, y, 10, 80); // pole
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(x - 18, y + 15, 36, 40); // straw body
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(x, y + 8, 10, 0, Math.PI * 2); // head
    ctx.fill();
  }

  // Draw Torch Brazier
  private drawBrazier(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(x - 12, y + 15, 24, 40);
    ctx.beginPath();
    ctx.arc(x, y + 15, 18, Math.PI, 0);
    ctx.fill();

    // Fire flame
    const flicker = Math.sin(time * 0.02) * 4;
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(x + flicker * 0.4, y + 5, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(x, y + 8, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw Shadow
  private drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y + 4, rx, ry, 0, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(x, y + 4, 0, x, y + 4, rx);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // Draw Ground Cracks
  private drawGroundCracks(ctx: CanvasRenderingContext2D, groundY: number) {
    for (let i = this.groundCracks.length - 1; i >= 0; i--) {
      const crack = this.groundCracks[i];
      crack.alpha -= 0.003;
      if (crack.alpha <= 0) {
        this.groundCracks.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.strokeStyle = `rgba(245, 158, 11, ${crack.alpha * 0.8})`;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(crack.x - 35, groundY);
      ctx.lineTo(crack.x - 12, groundY + 10);
      ctx.lineTo(crack.x + 14, groundY - 4);
      ctx.lineTo(crack.x + 35, groundY + 8);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ==========================================================================
  // WARRIOR QUEEN PROCEDURAL DRAWING (10 OUTFITS & 10 SWORDS)
  // ==========================================================================
  public drawPlayer(
    ctx: CanvasRenderingContext2D,
    player: CombatEntity,
    outfit: Outfit,
    sword: Sword,
    time: number,
    groundY: number
  ) {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(player.facing, 1);

    if (player.isDashing) {
      ctx.globalAlpha = 0.55;
    }

    const breath = Math.sin(time * 0.005) * 2;
    let torsoY = -42 + breath;
    let torsoAngle = 0;
    let swordAngle = 0.4;
    let swordX = 22;
    let swordY = -35;
    let capeWave = Math.sin(time * 0.008) * 8;
    const prog = player.animDuration > 0 ? player.animTimer / player.animDuration : 0;

    if (player.animation === 'defeat') {
      torsoY = 12;
      torsoAngle = 0.7;
      swordY = 32;
      swordAngle = 1.6;
    } else if (player.animation === 'damage') {
      torsoAngle = -0.3;
      torsoY -= 6;
      capeWave = -18;
    } else if (player.animation === 'walk') {
      torsoAngle = 0.12;
      capeWave = -20 + Math.sin(time * 0.02) * 8;
    } else if (player.activeAttack === 'slash') {
      if (prog < 0.3) {
        torsoAngle = -0.2;
        swordAngle = -1.1;
        swordX = -10;
        swordY = -40;
      } else {
        torsoAngle = 0.3;
        swordAngle = 1.3;
        swordX = 35;
        swordY = -28;

        // Slash Crescent Arc
        this.drawSlashCrescent(ctx, 25, -30, 72, -0.6, 1.4, sword.trailColor, sword.edgeColor);
      }
    } else if (player.activeAttack === 'power_strike') {
      if (prog < 0.45) {
        torsoAngle = -0.2;
        torsoY -= 16;
        swordAngle = -2.2;
        swordX = 0;
        swordY = -72;
      } else {
        torsoAngle = 0.4;
        swordAngle = 1.4;
        swordX = 36;
        swordY = 22;

        // Heavy Cleave Arc
        this.drawSlashCrescent(ctx, 32, -20, 90, -1.8, 1.2, '#ea580c', '#fef08a');
      }
    } else if (player.activeAttack === 'special') {
      const spin = prog * Math.PI * 4;
      torsoAngle = Math.sin(spin) * 0.3;
      swordAngle = spin;
      swordX = Math.cos(spin) * 42;
      swordY = -35 + Math.sin(spin) * 22;
      capeWave = Math.sin(spin) * 30;

      // Whirlwind Slash Arc
      this.drawSlashCrescent(ctx, 0, -35, 82, spin - 1.2, spin + 1.2, sword.trailColor, sword.edgeColor);
    }

    // Divine / Mythic Aura (Level 5+)
    if (outfit.auraColor) {
      ctx.save();
      ctx.shadowColor = outfit.auraColor;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(0, torsoY + 10, 48, 0, Math.PI * 2);
      ctx.fillStyle = outfit.auraColor;
      ctx.fill();
      ctx.restore();
    }

    // 1. Cape
    ctx.save();
    ctx.fillStyle = outfit.capeColor;
    ctx.beginPath();
    ctx.moveTo(-10, torsoY - 10);
    ctx.quadraticCurveTo(-35 + capeWave, torsoY + 15, -42 + capeWave, torsoY + 52);
    ctx.lineTo(-16 + capeWave * 0.5, torsoY + 56);
    ctx.quadraticCurveTo(-15, torsoY + 25, 0, torsoY - 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Legs / Skirt
    ctx.fillStyle = outfit.secondaryColor;
    ctx.fillRect(-12, torsoY + 34, 10, 24);
    ctx.fillRect(2, torsoY + 34, 10, 24);

    // Boots / Greaves
    ctx.fillStyle = outfit.primaryColor;
    ctx.fillRect(-13, torsoY + 46, 12, 14);
    ctx.fillRect(1, torsoY + 46, 12, 14);

    // 3. Torso / Breastplate
    ctx.save();
    ctx.translate(0, torsoY);
    ctx.rotate(torsoAngle);

    ctx.fillStyle = outfit.primaryColor;
    ctx.beginPath();
    ctx.roundRect(-12, -10, 24, 32, [6, 6, 2, 2]);
    ctx.fill();

    // Jewel or Filigree
    ctx.fillStyle = outfit.accentColor;
    ctx.beginPath();
    ctx.arc(0, 4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Head & Face
    const isDevi = outfit.id === 'outfit_10';
    ctx.fillStyle = isDevi ? '#c7d2fe' : '#d49767';
    ctx.beginPath();
    ctx.roundRect(-7, -22, 15, 16, [6, 6, 4, 4]);
    ctx.fill();

    // Crown / Mukut Variations
    this.drawCrown(ctx, outfit.crownType, outfit.accentColor);

    // Long Braid
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-8, -15);
    ctx.quadraticCurveTo(-18, 0, -15 + capeWave * 0.3, 24);
    ctx.lineTo(-10, 22);
    ctx.quadraticCurveTo(-12, 0, -3, -15);
    ctx.fill();

    ctx.restore(); // end torso

    // 5. Sword Rendering
    this.drawEquippedSword(ctx, swordX, swordY, swordAngle, sword);

    ctx.restore();
  }

  // Draw Crown Types
  private drawCrown(ctx: CanvasRenderingContext2D, type: Outfit['crownType'], color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();

    if (type === 'band') {
      ctx.fillRect(-8, -22, 17, 3);
    } else if (type === 'bronze' || type === 'tiara') {
      ctx.moveTo(-8, -20);
      ctx.lineTo(8, -20);
      ctx.lineTo(10, -26);
      ctx.lineTo(0, -29);
      ctx.lineTo(-10, -26);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'gold_spire' || type === 'crested') {
      ctx.moveTo(-9, -20);
      ctx.lineTo(9, -20);
      ctx.lineTo(12, -28);
      ctx.lineTo(0, -36); // tall spire
      ctx.lineTo(-12, -28);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'mystic_horns') {
      ctx.moveTo(-8, -20);
      ctx.lineTo(8, -20);
      ctx.lineTo(14, -32);
      ctx.lineTo(6, -26);
      ctx.lineTo(0, -34);
      ctx.lineTo(-6, -26);
      ctx.lineTo(-14, -32);
      ctx.closePath();
      ctx.fill();
    } else {
      // Celestial Devi Crown
      ctx.moveTo(-10, -20);
      ctx.lineTo(10, -20);
      ctx.lineTo(15, -34);
      ctx.lineTo(4, -28);
      ctx.lineTo(0, -42); // divine halo spire
      ctx.lineTo(-4, -28);
      ctx.lineTo(-15, -34);
      ctx.closePath();
      ctx.fill();

      // Glowing third eye bindi
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-1.5, -18, 3, 3);
    }
  }

  // Draw Sword
  private drawEquippedSword(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    sword: Sword
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    if (sword.glowColor) {
      ctx.shadowColor = sword.glowColor;
      ctx.shadowBlur = 18;
    }

    // Blade
    ctx.fillStyle = sword.bladeColor;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.quadraticCurveTo(-4, -32, 6, -68);
    ctx.quadraticCurveTo(2, -32, 3, 0);
    ctx.closePath();
    ctx.fill();

    // Edge
    ctx.strokeStyle = sword.edgeColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(3, 0);
    ctx.quadraticCurveTo(2, -32, 6, -68);
    ctx.stroke();

    // Crossguard & Hilt
    ctx.fillStyle = sword.hiltColor;
    ctx.fillRect(-7, 0, 14, 3.5);
    ctx.fillRect(-2, 3, 4, 11);
    ctx.beginPath();
    ctx.ellipse(0, 14, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Crescent Arc
  private drawSlashCrescent(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    start: number,
    end: number,
    outer: string,
    inner: string
  ) {
    ctx.save();
    ctx.strokeStyle = outer;
    ctx.shadowColor = outer;
    ctx.shadowBlur = 18;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, end);
    ctx.stroke();

    ctx.strokeStyle = inner;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 4, start, end);
    ctx.stroke();
    ctx.restore();
  }

  // Draw Special Cyclone Aura
  private drawCycloneAura(ctx: CanvasRenderingContext2D, player: CombatEntity, sword: Sword, time: number) {
    ctx.save();
    ctx.translate(player.x, player.y - 20);
    const rot = time * 0.008;
    ctx.rotate(rot);

    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.ellipse(0, 0, 95, 32, 0, 0, Math.PI * 2);
      ctx.strokeStyle = sword.glowColor || 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================================================
  // ENEMY PROCEDURAL DRAWING (7 ENEMY TYPES + BOSS PHASES)
  // ==========================================================================
  public drawEnemy(
    ctx: CanvasRenderingContext2D,
    enemy: CombatEntity,
    lvl: LevelConfig,
    time: number,
    groundY: number
  ) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.scale(enemy.facing, 1);

    const scale = lvl.isFinalBoss ? 1.4 : lvl.isMiniBoss ? 1.25 : 1.0;
    ctx.scale(scale, scale);

    const breath = Math.sin(time * 0.005 + 1) * 2;
    let torsoY = -42 + breath;
    let torsoAngle = 0;
    let bladeAngle = 0.5;
    let bladeX = 24;
    let bladeY = -30;
    const prog = enemy.animDuration > 0 ? enemy.animTimer / enemy.animDuration : 0;

    if (enemy.animation === 'defeat') {
      torsoY = 16;
      torsoAngle = 0.7;
      bladeY = 32;
      bladeAngle = 1.6;
    } else if (enemy.animation === 'damage') {
      torsoAngle = -0.35;
      torsoY -= 8;
    } else if (enemy.isAttacking) {
      if (prog < 0.4) {
        torsoAngle = -0.25;
        bladeAngle = -2.1;
        bladeX = -8;
        bladeY = -68;
      } else {
        torsoAngle = 0.35;
        bladeAngle = 1.3;
        bladeX = 35;
        bladeY = 15;

        // Enemy cleave arc
        this.drawSlashCrescent(ctx, 25, -20, lvl.isFinalBoss ? 100 : 75, -1.2, 1.2, '#dc2626', '#fca5a5');
      }
    }

    // Telegraph alert mark
    if (enemy.telegraphTimer && enemy.telegraphTimer > 0 && enemy.animation !== 'defeat') {
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, torsoY - 50, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, torsoY - 50);
      ctx.restore();
    }

    // Boss Phase Auras (Level 10)
    if (lvl.isFinalBoss && enemy.phase && enemy.phase >= 2) {
      ctx.save();
      const auraColor = enemy.phase === 3 ? 'rgba(168, 85, 247, 0.5)' : 'rgba(239, 68, 68, 0.5)';
      ctx.shadowColor = auraColor;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(0, torsoY + 10, 60, 0, Math.PI * 2);
      ctx.fillStyle = auraColor;
      ctx.fill();
      ctx.restore();
    }

    // Armor Color styling
    const armorColor = lvl.isFinalBoss ? '#09090b' : lvl.isMiniBoss ? '#27272a' : enemy.role === 'shadow' ? '#1e1b4b' : '#334155';
    const trimColor = lvl.isFinalBoss ? '#b91c1c' : lvl.isMiniBoss ? '#d97706' : '#94a3b8';

    // 1. Legs
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-14, torsoY + 32, 11, 24);
    ctx.fillRect(3, torsoY + 32, 11, 24);

    // 2. Torso
    ctx.save();
    ctx.translate(0, torsoY);
    ctx.rotate(torsoAngle);

    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.roundRect(-15, -12, 30, 36, [4, 4, 2, 2]);
    ctx.fill();

    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(-13, -10, 26, 32);

    // Shield (Armored Enemies)
    if (enemy.isBlocking || lvl.enemyType === 'armored') {
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(14, -14, 14, 42, 4);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(16, -12, 10, 38);
    }

    // 3. Horned Helmet or Mask
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.roundRect(-10, -26, 20, 18, [6, 6, 2, 2]);
    ctx.fill();

    // Glowing Eyes
    ctx.fillStyle = lvl.isFinalBoss ? '#ef4444' : '#f59e0b';
    ctx.fillRect(1, -20, 4, 2);
    ctx.fillRect(-6, -20, 4, 2);

    // Boss Horns
    if (lvl.isFinalBoss || lvl.isMiniBoss) {
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(-10, -22);
      ctx.lineTo(-24, -36);
      ctx.lineTo(-12, -28);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(10, -22);
      ctx.lineTo(24, -36);
      ctx.lineTo(12, -28);
      ctx.fill();
    }

    ctx.restore(); // end torso

    // 4. Enemy Weapon
    ctx.save();
    ctx.translate(bladeX, bladeY);
    ctx.rotate(bladeAngle);

    ctx.fillStyle = '#52525b';
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-7, -48);
    ctx.lineTo(8, -78);
    ctx.lineTo(6, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = trimColor;
    ctx.fillRect(-8, 0, 16, 4);

    ctx.restore();

    ctx.restore();
  }

  // Draw Particles
  private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'ring' && p.radius !== undefined && p.maxRadius !== undefined) {
        p.radius += 2.5;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Draw Floating Damage Numbers
  private drawDamageNumbers(ctx: CanvasRenderingContext2D, damageNumbers: DamageNumber[]) {
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
      const d = damageNumbers[i];
      d.life--;
      d.y -= 1.2;

      if (d.life <= 0) {
        damageNumbers.splice(i, 1);
        continue;
      }

      const alpha = d.life / d.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = d.color;
      ctx.font = d.isCrit ? 'bold 22px Cinzel, sans-serif' : 'bold 16px sans-serif';
      ctx.shadowColor = d.color;
      ctx.shadowBlur = d.isCrit ? 10 : 4;
      ctx.textAlign = 'center';

      const text = d.label ? `${d.label} -${d.value}` : `-${d.value}`;
      ctx.fillText(text, d.x, d.y);
      ctx.restore();
    }
  }

  // Draw Dramatic Combo Banner
  private drawComboBanner(ctx: CanvasRenderingContext2D, x: number, y: number, combo: number, time: number) {
    ctx.save();
    ctx.translate(x, y);
    const pulse = 1 + Math.sin(time * 0.02) * 0.08;
    ctx.scale(pulse, pulse);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 15;
    ctx.font = '900 18px Cinzel, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`COMBO x${combo}!`, 0, 0);

    ctx.restore();
  }
}
