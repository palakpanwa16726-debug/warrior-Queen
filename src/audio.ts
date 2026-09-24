/**
 * Web Audio API synthesized sound generator for Warrior Queen.
 * Zero external audio file dependencies - instantaneous, lag-free, and works offline.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private musicInterval: number | null = null;
  private musicGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(0, this.ctx?.currentTime || 0, 0.1);
    } else if (!this.isMuted && !this.isMusicMuted && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(0.2, this.ctx?.currentTime || 0, 0.1);
    }
    return this.isMuted;
  }

  public toggleMusic(): boolean {
    this.isMusicMuted = !this.isMusicMuted;
    if (this.musicGain) {
      const targetVol = (this.isMusicMuted || this.isMuted) ? 0 : 0.2;
      this.musicGain.gain.setTargetAtTime(targetVol, this.ctx?.currentTime || 0, 0.1);
    }
    return this.isMusicMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  // SWORD SLASH: High-speed airy metallic whoosh
  public playSlash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Noise buffer for swoosh air
    const bufferSize = this.ctx.sampleRate * 0.15;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(3200, t + 0.08);
    filter.frequency.exponentialRampToValueAtTime(600, t + 0.15);
    filter.Q.setValueAtTime(3, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    // Subtle metallic overtone oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.12);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.12, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.15);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // POWER STRIKE: Deep heavy whoosh, then bass rumble and metal cleave
  public playPowerStrike() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Heavy bass oscillator
    const bass = this.ctx.createOscillator();
    bass.type = 'triangle';
    bass.frequency.setValueAtTime(140, t);
    bass.frequency.exponentialRampToValueAtTime(45, t + 0.35);

    const bassGain = this.ctx.createGain();
    bassGain.gain.setValueAtTime(0.4, t);
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    // Resonant ring
    const ring = this.ctx.createOscillator();
    ring.type = 'sawtooth';
    ring.frequency.setValueAtTime(420, t);
    ring.frequency.exponentialRampToValueAtTime(110, t + 0.25);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);

    const ringGain = this.ctx.createGain();
    ringGain.gain.setValueAtTime(0.25, t);
    ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    bass.connect(bassGain);
    bassGain.connect(this.ctx.destination);

    ring.connect(filter);
    filter.connect(ringGain);
    ringGain.connect(this.ctx.destination);

    bass.start(t);
    bass.stop(t + 0.35);
    ring.start(t);
    ring.stop(t + 0.25);
  }

  // SPECIAL ATTACK: Multi-layered royal cyclone blade flurry with rising magical harmonic
  public playSpecialAttack() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Swirling arpeggio
    const notes = [293.66, 369.99, 440.0, 587.33, 739.99, 880.0]; // D major / fantasy scale
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = t + idx * 0.08;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, noteTime + 0.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.22);
    });

    // Deep resonant energy surge
    const sub = this.ctx.createOscillator();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(90, t);
    sub.frequency.linearRampToValueAtTime(180, t + 0.4);
    sub.frequency.exponentialRampToValueAtTime(50, t + 0.7);

    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(450, t);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.3, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    sub.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.ctx.destination);

    sub.start(t);
    sub.stop(t + 0.7);
  }

  // HIT IMPACT: Blade slicing armor / flesh + sharp spark
  public playHit(isCrit: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Metal clash
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(isCrit ? 980 : 750, t);
    osc1.frequency.exponentialRampToValueAtTime(160, t + (isCrit ? 0.22 : 0.12));

    const oscGain1 = this.ctx.createGain();
    oscGain1.gain.setValueAtTime(isCrit ? 0.35 : 0.25, t);
    oscGain1.gain.exponentialRampToValueAtTime(0.001, t + (isCrit ? 0.22 : 0.12));

    // Thud / impact punch
    const thud = this.ctx.createOscillator();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(isCrit ? 130 : 100, t);
    thud.frequency.exponentialRampToValueAtTime(35, t + 0.18);

    const thudGain = this.ctx.createGain();
    thudGain.gain.setValueAtTime(isCrit ? 0.45 : 0.3, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc1.connect(oscGain1);
    oscGain1.connect(this.ctx.destination);

    thud.connect(thudGain);
    thudGain.connect(this.ctx.destination);

    osc1.start(t);
    osc1.stop(t + (isCrit ? 0.22 : 0.12));
    thud.start(t);
    thud.stop(t + 0.18);
  }

  // PLAYER HURT: Blunt hit + grunt tone
  public playPlayerHurt() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // ENEMY ATTACK TELEGRAPH / SWING
  public playEnemySwing() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.25);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // VICTORY FANFARE: Royal triumphant chords
  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chords = [
      { freqs: [293.66, 440.0, 587.33], time: 0, dur: 0.35 },      // D
      { freqs: [369.99, 440.0, 739.99], time: 0.35, dur: 0.35 },   // F#
      { freqs: [440.0, 554.37, 880.0], time: 0.7, dur: 0.4 },     // A
      { freqs: [587.33, 739.99, 1174.66], time: 1.1, dur: 0.8 },  // High D major
    ];

    chords.forEach(({ freqs, time, dur }) => {
      if (!this.ctx) return;
      const chordStart = t + time;
      freqs.forEach((f) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, chordStart);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.16, chordStart);
        gain.gain.exponentialRampToValueAtTime(0.001, chordStart + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(chordStart);
        osc.stop(chordStart + dur);
      });
    });
  }

  // DEFEAT SOUND
  public playDefeat() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [220, 196, 174.61, 146.83]; // A3, G3, F3, D3
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = t + idx * 0.45;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, noteTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }

  // START AMBIENT BATTLE MUSIC
  public startBattleMusic() {
    this.initCtx();
    if (!this.ctx || this.musicInterval) return;

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime((this.isMusicMuted || this.isMuted) ? 0 : 0.18, this.ctx.currentTime);
    this.musicGain.connect(this.ctx.destination);

    let step = 0;
    // War drum pulse rhythm + mystical tanpura drone
    const playBar = () => {
      if (!this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;

      // Drum pulse on beats 0, 2, 3
      if (step % 4 === 0 || step % 4 === 2) {
        const drum = this.ctx.createOscillator();
        drum.type = 'sine';
        drum.frequency.setValueAtTime(step % 4 === 0 ? 80 : 65, t);
        drum.frequency.exponentialRampToValueAtTime(35, t + 0.18);

        const drumGain = this.ctx.createGain();
        drumGain.gain.setValueAtTime(step % 4 === 0 ? 0.35 : 0.25, t);
        drumGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        drum.connect(drumGain);
        drumGain.connect(this.musicGain);

        drum.start(t);
        drum.stop(t + 0.18);
      }

      // Shaker/metal tambourine tap on 1 and 3
      if (step % 2 === 1) {
        const noise = this.ctx.createOscillator();
        noise.type = 'triangle';
        noise.frequency.setValueAtTime(1400, t);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.05, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        noise.connect(nGain);
        nGain.connect(this.musicGain);

        noise.start(t);
        noise.stop(t + 0.08);
      }

      // Drone notes (D - A - D - C)
      const droneNotes = [146.83, 220.0, 146.83, 261.63];
      if (step % 4 === 0) {
        const drone = this.ctx.createOscillator();
        drone.type = 'sine';
        drone.frequency.setValueAtTime(droneNotes[(step / 4) % droneNotes.length], t);

        const dGain = this.ctx.createGain();
        dGain.gain.setValueAtTime(0.08, t);
        dGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

        drone.connect(dGain);
        dGain.connect(this.musicGain);

        drone.start(t);
        drone.stop(t + 1.2);
      }

      step++;
    };

    this.musicInterval = window.setInterval(playBar, 300);
  }

  public stopBattleMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }
}

export const sounds = new SoundManager();
