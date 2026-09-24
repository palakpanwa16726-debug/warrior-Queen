// ============================================================================
// WARRIOR QUEEN - PROCEDURAL WEB AUDIO SYNTHESIZER
// High-fidelity sound effects generated with Web Audio API (0 dependencies)
// ============================================================================

export class AudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    // Lazy initialize on first user gesture
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // 1. Sword Swing (Whoosh)
  public playSlash(weight: 'light' | 'heavy' | 'whirlwind' = 'light') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (weight === 'light') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(680, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.12);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.Q.setValueAtTime(3, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.12);
    } else if (weight === 'heavy') {
      // Deep downward cleave
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.28);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.28);
    } else {
      // Whirlwind spin
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(700, t + 0.25);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.5);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.5);
    }
  }

  // 2. Sword Clash / Hit
  public playHit(isCrit: boolean = false, isBlocked: boolean = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    if (isBlocked) {
      // Metallic shield deflection 'clink'
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.18);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.18);
      return;
    }

    // Flesh & blade impact
    const osc = this.ctx.createOscillator();
    osc.type = isCrit ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(isCrit ? 940 : 540, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + (isCrit ? 0.2 : 0.14));

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isCrit ? 0.45 : 0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isCrit ? 0.2 : 0.14));

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + (isCrit ? 0.2 : 0.14));

    if (isCrit) {
      // Ringing high metallic resonance
      const bell = this.ctx.createOscillator();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(1480, t);
      bell.frequency.exponentialRampToValueAtTime(320, t + 0.3);

      const bellGain = this.ctx.createGain();
      bellGain.gain.setValueAtTime(0.25, t);
      bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      bell.connect(bellGain);
      bellGain.connect(this.masterGain);
      bell.start(t);
      bell.stop(t + 0.3);
    }
  }

  // 3. Enemy Damaged Grunt / Impact
  public playEnemyHurt() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.16);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  // 4. Dash / Evasion
  public playDash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.16);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  // 5. Boss Roar / Phase Shift
  public playBossRoar() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.linearRampToValueAtTime(160, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.85);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.85);
  }

  // 6. Combo Fanfare
  public playCombo(comboCount: number) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const pitch = Math.min(1200, 440 + comboCount * 65);
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, t + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // 7. Victory Fanfare
  public playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const notes = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G, C, E, G, High C
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const st = t + idx * 0.14;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, st);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(st);
      osc.stop(st + 0.35);
    });
  }

  // 8. Defeat Sound
  public playDefeat() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const notes = [311.13, 293.66, 261.63, 196.0]; // Eb, D, C, G
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const st = t + idx * 0.22;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(st);
      osc.stop(st + 0.45);
    });
  }

  // 9. Button Click
  public playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.05);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // 10. Coin / Upgrade Chime
  public playUpgrade() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    [659.25, 880.0, 1174.66].forEach((f, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const st = t + idx * 0.08;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, st);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(st);
      osc.stop(st + 0.2);
    });
  }
}

export const soundEngine = new AudioEngine();
