import { AttackConfig, DamageNumber, EnemyState, Particle, PlayerState } from './types';

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bgImage: HTMLImageElement | null = null;
  private groundCracks: Array<{ x: number; y: number; alpha: number }> = [];

  constructor(canvas: HTMLCanvasElement, bgSrc?: string) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get canvas 2d context');
    this.ctx = context;

    if (bgSrc) {
      this.bgImage = new Image();
      this.bgImage.src = bgSrc;
    }
  }

  public addGroundCrack(x: number, y: number) {
    this.groundCracks.push({ x, y, alpha: 1.0 });
    if (this.groundCracks.length > 8) {
      this.groundCracks.shift();
    }
  }

  public render(
    player: PlayerState,
    enemy: EnemyState,
    particles: Particle[],
    damageNumbers: DamageNumber[],
    shakeOffset: { x: number; y: number },
    time: number
  ) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    // Screen shake
    ctx.translate(shakeOffset.x, shakeOffset.y);

    // 1. Clear background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    // 2. Draw Battle Arena Background
    if (this.bgImage && this.bgImage.complete && this.bgImage.naturalWidth > 0) {
      ctx.drawImage(this.bgImage, 0, 0, w, h);
    } else {
      // Fallback stylized dark ancient Indian temple fortress arena
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0f0c1b');
      grad.addColorStop(0.5, '#1e162a');
      grad.addColorStop(1, '#0d0914');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Distant palace arches
      ctx.fillStyle = '#140f22';
      for (let i = 0; i < 7; i++) {
        const archX = i * (w / 6) - 30;
        ctx.beginPath();
        ctx.roundRect(archX, 100, 110, 380, [50, 50, 0, 0]);
        ctx.fill();
      }
    }

    // Atmospheric dark vignette and twilight mist
    const mistGrad = ctx.createLinearGradient(0, 320, 0, h);
    mistGrad.addColorStop(0, 'rgba(15, 10, 25, 0)');
    mistGrad.addColorStop(0.7, 'rgba(18, 12, 30, 0.45)');
    mistGrad.addColorStop(1, 'rgba(10, 6, 18, 0.85)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, 320, w, h - 320);

    // Floor horizon line & subtle stone floor tiles
    const groundY = player.y + 40;
    ctx.save();
    ctx.fillStyle = 'rgba(28, 18, 40, 0.6)';
    ctx.fillRect(0, groundY - 20, w, h - groundY + 20);

    // Ground cracks from Power Strikes
    for (let i = this.groundCracks.length - 1; i >= 0; i--) {
      const crack = this.groundCracks[i];
      crack.alpha -= 0.002;
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
      ctx.moveTo(crack.x - 30, groundY);
      ctx.lineTo(crack.x - 10, groundY + 8);
      ctx.lineTo(crack.x + 15, groundY - 3);
      ctx.lineTo(crack.x + 35, groundY + 6);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // 3. Torch Braziers on Arena Flanks
    this.drawTorchBrazier(ctx, 60, groundY - 60, time);
    this.drawTorchBrazier(ctx, w - 60, groundY - 60, time + 2000);

    // 4. Combat Range Guidance Circle / Floor Highlights
    this.drawCombatDistanceGuide(ctx, player, enemy, groundY);

    // 5. Draw Characters Shadows
    this.drawShadow(ctx, player.x, groundY, 45, 12);
    this.drawShadow(ctx, enemy.x, groundY, 50, 14);

    // 6. Draw Characters (sorted by y or attack priority)
    // Draw Enemy
    this.drawEnemy(ctx, enemy, time);

    // Draw Warrior Queen
    this.drawPlayer(ctx, player, time);

    // 7. Draw Active Attack Special Visuals (Ground cleavage, cyclone aura)
    if (player.activeAttack && player.activeAttack.id === 'special') {
      this.drawSpecialAttackAura(ctx, player, time);
    }

    // 8. Draw Particles (sparks, embers, blood, shockwaves)
    this.drawParticles(ctx, particles);

    // 9. Draw Floating Damage Numbers
    this.drawDamageNumbers(ctx, damageNumbers);

    ctx.restore();
  }

  // Combat distance guide ring on floor
  private drawCombatDistanceGuide(ctx: CanvasRenderingContext2D, player: PlayerState, enemy: EnemyState, groundY: number) {
    const dist = Math.abs(player.x - enemy.x);
    const inRange = dist <= 165 && enemy.health > 0 && player.health > 0;

    if (inRange) {
      ctx.save();
      const midX = (player.x + enemy.x) / 2;
      ctx.beginPath();
      ctx.ellipse(midX, groundY + 5, dist / 2 + 15, 14, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.stroke();

      // Subtle pulse
      ctx.fillStyle = 'rgba(234, 179, 8, 0.04)';
      ctx.fill();
      ctx.restore();
    }
  }

  // Ellipse shadow on stone floor
  private drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    const shadowGrad = ctx.createRadialGradient(x, y, 0, x, y, rx);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.fill();
    ctx.restore();
  }

  // Ancient Bronze Torch Brazier with animated fire
  private drawTorchBrazier(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
    ctx.save();

    // Pillar / Brazier bowl
    ctx.fillStyle = '#261b2e';
    ctx.fillRect(x - 6, y + 20, 12, 40);
    ctx.fillStyle = '#4a3728';
    ctx.beginPath();
    ctx.moveTo(x - 22, y + 20);
    ctx.lineTo(x + 22, y + 20);
    ctx.lineTo(x + 12, y + 36);
    ctx.lineTo(x - 12, y + 36);
    ctx.closePath();
    ctx.fill();

    // Fire glow
    const flicker = Math.sin(time * 0.008) * 4 + Math.cos(time * 0.015) * 3;
    const fireGrad = ctx.createRadialGradient(x, y + 10, 4, x, y + 5, 45 + flicker);
    fireGrad.addColorStop(0, 'rgba(255, 200, 80, 0.85)');
    fireGrad.addColorStop(0.3, 'rgba(245, 120, 20, 0.5)');
    fireGrad.addColorStop(0.7, 'rgba(200, 40, 10, 0.15)');
    fireGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.arc(x, y + 10, 50 + flicker, 0, Math.PI * 2);
    ctx.fill();

    // Fire flame tongue
    ctx.fillStyle = '#ffeedd';
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 20);
    ctx.quadraticCurveTo(x - 14 + flicker * 0.5, y + 5, x + flicker * 0.3, y - 18 + flicker);
    ctx.quadraticCurveTo(x + 14 - flicker * 0.5, y + 5, x + 8, y + 20);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // WARRIOR QUEEN RENDERING
  // ==========================================
  private drawPlayer(ctx: CanvasRenderingContext2D, player: PlayerState, time: number) {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(player.facing, 1);

    const animProgress = player.animDuration > 0 ? player.animTimer / player.animDuration : 0;
    const isAttacking = player.activeAttack !== null;
    const breath = Math.sin(time * 0.005) * 2.5;

    // Red tint flash if hurt
    if (player.isHurt || (player.invincibleTimer > 0 && Math.floor(time / 80) % 2 === 0)) {
      ctx.filter = 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.8)) hue-rotate(-20deg)';
    }

    // Coordinate anchor: (0, 0) is roughly waist height
    let torsoY = -40 + (player.animation.startsWith('run') ? Math.sin(time * 0.015) * 4 : breath);
    let torsoAngle = 0;
    let swordAngle = 0.4;
    let swordX = 22;
    let swordY = -35;
    let armFrontAngle = 0.3;
    let armBackAngle = -0.2;
    let headAngle = 0;
    let capeFlutter = Math.sin(time * 0.006) * 6;

    // Posture & animation logic
    if (player.animation === 'defeat') {
      torsoY = 10;
      torsoAngle = 0.6;
      headAngle = 0.8;
      armFrontAngle = 0.9;
      swordY = 35;
      swordX = 30;
      swordAngle = 1.5;
    } else if (player.animation === 'damage') {
      torsoAngle = -0.35;
      torsoY -= 6;
      headAngle = -0.4;
      armFrontAngle = -0.8;
      swordAngle = -0.6;
      capeFlutter = -15;
    } else if (player.animation === 'run_forward' || player.animation === 'run_backward') {
      const runCycle = Math.sin(time * 0.018);
      torsoAngle = player.animation === 'run_forward' ? 0.15 : -0.15;
      capeFlutter = -20 + Math.sin(time * 0.02) * 10;
      armFrontAngle = runCycle * 0.7;
      armBackAngle = -runCycle * 0.7;
      swordAngle = 0.6 + runCycle * 0.2;
    } else if (isAttacking) {
      const attackId = player.activeAttack!.id;

      if (attackId === 'slash') {
        // Fast horizontal 180° slash
        if (animProgress < 0.25) {
          // Windup back
          torsoAngle = -0.2;
          swordAngle = -1.2;
          swordX = -15;
          swordY = -45;
          armFrontAngle = -1.0;
        } else if (animProgress < 0.7) {
          // Lightning horizontal slash through
          const p = (animProgress - 0.25) / 0.45;
          torsoAngle = 0.3;
          swordAngle = -1.2 + p * 2.8;
          swordX = 10 + p * 30;
          swordY = -30 - Math.sin(p * Math.PI) * 15;
          armFrontAngle = 0.8;
          capeFlutter = 18;

          // Render glowing sword slash crescent arc
          this.drawSlashCrescent(ctx, 20, -35, 75, -0.6, 1.8, 'rgba(245, 158, 11, 0.85)', 'rgba(255, 230, 150, 0.95)');
        } else {
          // Recovery
          torsoAngle = 0.1;
          swordAngle = 1.4;
          swordX = 35;
          swordY = -25;
        }
      } else if (attackId === 'power_strike') {
        // Leaps up, raises sword overhead with both hands, slams downward
        if (animProgress < 0.4) {
          // Windup: leap and raise blade high
          const leap = Math.sin((animProgress / 0.4) * Math.PI) * 18;
          torsoY -= leap;
          torsoAngle = -0.15;
          swordAngle = -2.2;
          swordX = -5;
          swordY = -75;
          armFrontAngle = -2.1;
          armBackAngle = -2.0;

          // Charge glow on sword
          ctx.save();
          ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
          ctx.beginPath();
          ctx.arc(-5, -75, 25, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (animProgress < 0.75) {
          // Downward violent cleave
          const p = (animProgress - 0.4) / 0.35;
          torsoAngle = 0.4;
          torsoY += 4;
          swordAngle = -2.2 + p * 3.4;
          swordX = 10 + p * 30;
          swordY = -75 + p * 105;
          armFrontAngle = 1.2;

          // Heavy cleave arc trail
          this.drawSlashCrescent(ctx, 30, -20, 95, -1.8, 1.4, 'rgba(225, 29, 72, 0.9)', 'rgba(254, 240, 138, 1)');
        } else {
          // Follow-through in deep lunge
          torsoAngle = 0.3;
          swordAngle = 1.3;
          swordX = 40;
          swordY = 25;
        }
      } else if (attackId === 'special') {
        // Royal Cyclone Combo - rapid spinning dance with multi-crescents
        const spinPhase = (animProgress * 3.5) % 1;
        const spinAngle = animProgress * Math.PI * 4;
        torsoAngle = Math.sin(spinAngle) * 0.3;
        swordAngle = spinAngle;
        swordX = Math.cos(spinAngle) * 45;
        swordY = -40 + Math.sin(spinAngle) * 25;
        armFrontAngle = spinAngle;
        capeFlutter = Math.sin(spinAngle) * 35;

        // Multiple golden cyclone rings
        this.drawSlashCrescent(ctx, 0, -40, 85, spinAngle - 1.2, spinAngle + 1.2, 'rgba(234, 179, 8, 0.95)', 'rgba(254, 249, 195, 1)');
        this.drawSlashCrescent(ctx, 0, -40, 65, spinAngle - 2.4, spinAngle, 'rgba(225, 29, 72, 0.85)', 'rgba(245, 158, 11, 0.9)');
      }
    }

    // --- DRAWING QUEEN'S BODY PARTS ---

    // 1. Fluttering Royal Crimson Cape / Dupatta (drawn behind back)
    ctx.save();
    ctx.fillStyle = '#991b1b'; // Royal crimson
    ctx.beginPath();
    ctx.moveTo(-10, torsoY - 15);
    ctx.quadraticCurveTo(-35 + capeFlutter * 0.7, torsoY + 10, -45 + capeFlutter, torsoY + 55);
    ctx.lineTo(-20 + capeFlutter * 0.5, torsoY + 58);
    ctx.quadraticCurveTo(-15, torsoY + 25, 0, torsoY - 10);
    ctx.closePath();
    ctx.fill();

    // Cape golden embroidery hem
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-45 + capeFlutter, torsoY + 55);
    ctx.lineTo(-20 + capeFlutter * 0.5, torsoY + 58);
    ctx.stroke();
    ctx.restore();

    // 2. Back Arm
    ctx.save();
    ctx.translate(-4, torsoY - 12);
    ctx.rotate(armBackAngle);
    // Upper arm
    ctx.fillStyle = '#b45309'; // Gold armor armlet
    ctx.fillRect(-3, 0, 7, 16);
    // Lower arm
    ctx.fillStyle = '#c88a58'; // Skin tone
    ctx.fillRect(-2.5, 15, 6, 15);
    // Gold bracer
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-3, 20, 7, 8);
    ctx.restore();

    // 3. Legs / Dhoti Pants (Pleated royal silk & gold boots)
    if (player.animation === 'defeat') {
      // Kneeling pose
      ctx.fillStyle = '#b91c1c'; // Saffron/crimson silk
      ctx.beginPath();
      ctx.roundRect(-15, 10, 32, 22, 6);
      ctx.fill();
      // Gold greaves
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-10, 26, 25, 10);
    } else {
      const legRun = player.animation.startsWith('run') ? Math.sin(time * 0.018) * 12 : 0;
      // Left leg
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(-14 - legRun * 0.5, torsoY + 36, 12, 28);
      // Right leg
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(2 + legRun * 0.5, torsoY + 36, 12, 28);

      // Gold engraved battle greaves / boots
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-15 - legRun * 0.5, torsoY + 50, 14, 18);
      ctx.fillRect(1 + legRun * 0.5, torsoY + 50, 14, 18);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-13 - legRun * 0.5, torsoY + 54, 10, 4);
      ctx.fillRect(3 + legRun * 0.5, torsoY + 54, 10, 4);
    }

    // 4. Torso & Golden Kavach (Breastplate)
    ctx.save();
    ctx.translate(0, torsoY);
    ctx.rotate(torsoAngle);

    // Saffron waist sash / Kamarbandh
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-12, 22, 24, 14);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-13, 26, 26, 3); // Gold sash belt

    // Gold Breastplate / Kavach
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.roundRect(-13, -10, 26, 34, [6, 6, 2, 2]);
    ctx.fill();

    // Breastplate filigree & central ruby jewel
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 5, 8, 0, Math.PI);
    ctx.stroke();

    // Central Ruby
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Neck / Choker
    ctx.fillStyle = '#c88a58';
    ctx.fillRect(-5, -20, 10, 12);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-6, -14, 12, 4); // Gold necklace

    // 5. Head, Braided Hair & Golden Mukut Crown
    ctx.save();
    ctx.translate(0, -22);
    ctx.rotate(headAngle);

    // Dark braided hair hanging down back
    ctx.fillStyle = '#18121e';
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.quadraticCurveTo(-22 + capeFlutter * 0.3, 10, -18 + capeFlutter * 0.5, 32);
    ctx.lineTo(-11, 30);
    ctx.quadraticCurveTo(-14, 10, -4, -5);
    ctx.fill();

    // Face
    ctx.fillStyle = '#d49767'; // Warm golden skin tone
    ctx.beginPath();
    ctx.roundRect(-8, -14, 17, 18, [8, 8, 6, 6]);
    ctx.fill();

    // Eyes & Bindi
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(1, -7, 4, 2); // Focused warrior eye
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(4, -10, 1.5, 0, Math.PI * 2); // Crimson bindi
    ctx.fill();

    // Ornate Golden Mukut (Crown)
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(-9, -12);
    ctx.lineTo(9, -12);
    ctx.lineTo(12, -22);
    ctx.lineTo(4, -16);
    ctx.lineTo(0, -26); // Tall central spire
    ctx.lineTo(-4, -16);
    ctx.lineTo(-12, -22);
    ctx.closePath();
    ctx.fill();
    // Crown jewel
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -17, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // end head

    ctx.restore(); // end torso

    // 6. Front Arm & Hand
    ctx.save();
    ctx.translate(6, torsoY - 10);
    ctx.rotate(armFrontAngle);

    // Upper arm with gold Bajuband
    ctx.fillStyle = '#c88a58';
    ctx.fillRect(-3, 0, 7, 16);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-4, 4, 9, 5); // Bajuband armlet

    // Forearm with battle vambrace
    ctx.fillStyle = '#c88a58';
    ctx.fillRect(-3, 16, 6, 14);
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-3.5, 18, 7, 10); // Gold wrist bracer
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-4, 26, 8, 3);

    // Hand gripping sword hilt
    ctx.fillStyle = '#b47846';
    ctx.beginPath();
    ctx.arc(0, 30, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // end front arm

    // 7. Royal Talwar Sword
    this.drawTalwarSword(ctx, swordX, swordY, swordAngle, isAttacking);

    ctx.restore();
  }

  // Draw Ornate Indian Talwar Sword
  private drawTalwarSword(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    isGlowing: boolean
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Glowing aura if attacking
    if (isGlowing) {
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 18;
    }

    // Disk Pommel & Golden Knuckle-Bow Hilt
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.ellipse(0, 14, 6, 3, 0, 0, Math.PI * 2); // Disk pommel
    ctx.fill();

    // Hilt grip
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, 0, 4, 14);

    // Crossguard & knuckle guard
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-8, -2, 16, 4);
    ctx.beginPath();
    ctx.arc(4, 5, 8, -Math.PI / 2, Math.PI / 2);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Curved Damascus Steel Blade
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(-3, -2);
    ctx.quadraticCurveTo(-4, -35, 6, -72); // Curved point tip
    ctx.quadraticCurveTo(2, -35, 3, -2);
    ctx.closePath();
    ctx.fill();

    // Razor edge highlight
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(3, -2);
    ctx.quadraticCurveTo(2, -35, 6, -72);
    ctx.stroke();

    // Blade fuller / gold engraving near hilt
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-1, -16, 2, 14);

    ctx.restore();
  }

  // Glowing sword slash crescent trail
  private drawSlashCrescent(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    outerColor: string,
    innerColor: string
  ) {
    ctx.save();
    ctx.shadowColor = outerColor;
    ctx.shadowBlur = 20;

    // Outer glow crescent
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.arc(cx, cy, radius - 24, endAngle, startAngle, true);
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx, cy, radius - 24, cx, cy, radius);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(0.6, outerColor);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Bright core line
    ctx.strokeStyle = innerColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 10, startAngle, endAngle);
    ctx.stroke();

    ctx.restore();
  }

  // Special attack cyclone aura
  private drawSpecialAttackAura(ctx: CanvasRenderingContext2D, player: PlayerState, time: number) {
    ctx.save();
    ctx.translate(player.x, player.y - 20);

    const pulse = Math.sin(time * 0.02) * 10;
    const rot = time * 0.008;

    ctx.rotate(rot);
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.ellipse(0, 0, 90 + pulse, 30, 0, 0, Math.PI * 2);
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(225, 29, 72, 0.35)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================
  // ENEMY WARLORD RENDERING
  // ==========================================
  private drawEnemy(ctx: CanvasRenderingContext2D, enemy: EnemyState, time: number) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.scale(enemy.facing, 1);

    const animProgress = enemy.animDuration > 0 ? enemy.animTimer / enemy.animDuration : 0;
    const breath = Math.sin(time * 0.004 + 1) * 2;

    // Red tint flash if hurt
    if (enemy.isHurt || (enemy.invincibleTimer > 0 && Math.floor(time / 80) % 2 === 0)) {
      ctx.filter = 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.9)) brightness(1.4)';
    }

    let torsoY = -42 + breath;
    let torsoAngle = 0;
    let bladeAngle = 0.5;
    let bladeX = 24;
    let bladeY = -30;
    let armFrontAngle = 0.4;
    let armBackAngle = -0.3;

    if (enemy.animation === 'defeat') {
      torsoY = 15;
      torsoAngle = 0.7;
      armFrontAngle = 1.0;
      bladeAngle = 1.6;
      bladeX = 35;
      bladeY = 35;
    } else if (enemy.animation === 'damage') {
      torsoAngle = -0.4;
      torsoY -= 8;
      armFrontAngle = -0.7;
      bladeAngle = -0.7;
    } else if (enemy.animation === 'walk') {
      const walkCycle = Math.sin(time * 0.012);
      torsoAngle = 0.1;
      armFrontAngle = walkCycle * 0.5;
      armBackAngle = -walkCycle * 0.5;
      bladeAngle = 0.5 + walkCycle * 0.15;
    } else if (enemy.isAttacking) {
      if (animProgress < 0.35) {
        // Wind-up: raise heavy blade high overhead
        torsoAngle = -0.25;
        bladeAngle = -2.1;
        bladeX = -8;
        bladeY = -70;
        armFrontAngle = -1.8;

        // Warning telegraph flash on blade
        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.beginPath();
        ctx.arc(-8, -70, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (animProgress < 0.75) {
        // Heavy slash forward
        const p = (animProgress - 0.35) / 0.4;
        torsoAngle = 0.35;
        bladeAngle = -2.1 + p * 3.3;
        bladeX = 15 + p * 30;
        bladeY = -70 + p * 95;
        armFrontAngle = 0.9;

        // Red cleave arc
        this.drawSlashCrescent(ctx, 25, -25, 85, -1.2, 1.2, 'rgba(185, 28, 28, 0.85)', 'rgba(254, 202, 202, 0.95)');
      } else {
        torsoAngle = 0.15;
        bladeAngle = 1.2;
        bladeX = 35;
        bladeY = 20;
      }
    }

    // Telegraph alert icon if enemy preparing attack
    if (enemy.telegraphTimer > 0 && enemy.animation !== 'defeat') {
      ctx.save();
      ctx.translate(0, torsoY - 55);
      const pulse = Math.sin(time * 0.02) * 3;
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 10 + pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, 0);
      ctx.restore();
    }

    // --- DRAWING ENEMY BODY PARTS ---

    // 1. Heavy Black Spiked Pauldron & Cape (Back)
    ctx.save();
    ctx.fillStyle = '#1e1b2e';
    ctx.beginPath();
    ctx.moveTo(-15, torsoY - 10);
    ctx.lineTo(-40, torsoY + 45);
    ctx.lineTo(-18, torsoY + 50);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Heavy Armored Legs
    if (enemy.animation === 'defeat') {
      ctx.fillStyle = '#27272a';
      ctx.fillRect(-16, 12, 34, 24);
    } else {
      const legRun = enemy.animation === 'walk' ? Math.sin(time * 0.012) * 10 : 0;
      ctx.fillStyle = '#18181b'; // Dark damascus steel
      ctx.fillRect(-16 - legRun * 0.5, torsoY + 38, 14, 30);
      ctx.fillRect(4 + legRun * 0.5, torsoY + 38, 14, 30);

      // Brass greaves
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-17 - legRun * 0.5, torsoY + 52, 16, 16);
      ctx.fillRect(3 + legRun * 0.5, torsoY + 52, 16, 16);
    }

    // 3. Torso & Menacing Dark Cuirass
    ctx.save();
    ctx.translate(0, torsoY);
    ctx.rotate(torsoAngle);

    // Dark armor plate
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.roundRect(-16, -12, 32, 38, [4, 4, 2, 2]);
    ctx.fill();

    // Brass trim details
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.strokeRect(-14, -10, 28, 34);

    // Dark Spiked Pauldrons (Shoulders)
    ctx.fillStyle = '#3f3f46';
    ctx.beginPath();
    ctx.moveTo(-18, -12);
    ctx.lineTo(-26, -22); // Spike
    ctx.lineTo(-12, -18);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(14, -12);
    ctx.lineTo(26, -22); // Spike
    ctx.lineTo(18, -18);
    ctx.closePath();
    ctx.fill();

    // 4. Horned War Helmet & Glowing Eyes
    ctx.save();
    ctx.translate(0, -25);

    // Helmet dome
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.roundRect(-11, -16, 22, 20, [8, 8, 4, 4]);
    ctx.fill();

    // Brass battle horns
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.quadraticCurveTo(-24, -20, -20, -32);
    ctx.quadraticCurveTo(-14, -22, -8, -14);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10, -10);
    ctx.quadraticCurveTo(24, -20, 20, -32);
    ctx.quadraticCurveTo(14, -22, 8, -14);
    ctx.fill();

    // Glowing Amber Eyes through helmet visor slit
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.fillRect(1, -7, 4, 2.5);
    ctx.fillRect(-6, -7, 4, 2.5);

    ctx.restore(); // end head

    ctx.restore(); // end torso

    // 5. Front Arm
    ctx.save();
    ctx.translate(8, torsoY - 8);
    ctx.rotate(armFrontAngle);
    ctx.fillStyle = '#27272a';
    ctx.fillRect(-4, 0, 9, 18);
    ctx.fillStyle = '#78350f'; // Brass bracer
    ctx.fillRect(-5, 12, 11, 12);

    // Hand
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(0, 26, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Heavy Curved Warlord Blade (Khanda / Scimitar)
    this.drawWarlordBlade(ctx, bladeX, bladeY, bladeAngle, enemy.isAttacking);

    ctx.restore();
  }

  // Draw Heavy Warlord Blade
  private drawWarlordBlade(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, isAttacking: boolean) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    if (isAttacking) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
    }

    // Heavy brass pommel
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.arc(0, 16, 5, 0, Math.PI * 2);
    ctx.fill();

    // Grip
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-3, 0, 6, 16);

    // Jagged crossguard
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-10, -2, 20, 5);

    // Heavy cleaver blade
    ctx.fillStyle = '#3f3f46';
    ctx.beginPath();
    ctx.moveTo(-5, -2);
    ctx.lineTo(-7, -50);
    ctx.lineTo(8, -80); // Heavy broad tip
    ctx.lineTo(7, -2);
    ctx.closePath();
    ctx.fill();

    // Jagged blade notch
    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath();
    ctx.moveTo(-7, -28);
    ctx.lineTo(-3, -33);
    ctx.lineTo(-7, -38);
    ctx.fill();

    // Edge highlight
    ctx.strokeStyle = '#e4e4e7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(7, -2);
    ctx.lineTo(8, -80);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================
  // PARTICLES (Sparks, Embers, Blood, Shockwaves)
  // ==========================================
  private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === 'shockwave') {
        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius || 10, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'blood') {
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 1.5, p.size, 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'ember') {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // ==========================================
  // FLOATING DAMAGE NUMBERS
  // ==========================================
  private drawDamageNumbers(ctx: CanvasRenderingContext2D, damageNumbers: DamageNumber[]) {
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
      const d = damageNumbers[i];
      const progress = 1 - d.life / d.maxLife;
      const alpha = Math.max(0, d.life / d.maxLife);
      const currentY = d.y - progress * 40;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (d.isCrit) {
        ctx.font = '900 24px "Cinzel", Georgia, serif';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#fef08a';
        ctx.fillText(`${d.value} CRIT!`, d.x, currentY);
      } else {
        ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = d.color;
        ctx.fillText(`-${d.value}`, d.x, currentY);
      }

      if (d.label) {
        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(d.label, d.x, currentY - 18);
      }

      ctx.restore();
    }
  }
}
