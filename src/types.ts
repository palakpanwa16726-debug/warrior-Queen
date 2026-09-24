export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'DEFEAT';

export type PlayerAnimation = 
  | 'idle' 
  | 'run_forward' 
  | 'run_backward' 
  | 'slash' 
  | 'power_strike' 
  | 'special_attack' 
  | 'damage' 
  | 'defeat';

export type EnemyAnimation = 
  | 'idle' 
  | 'walk' 
  | 'attack' 
  | 'damage' 
  | 'defeat';

export interface AttackConfig {
  id: 'slash' | 'power_strike' | 'special';
  name: string;
  subtitle: string;
  damage: number;
  cooldown: number; // in seconds
  range: number; // in pixels
  duration: number; // in ms
  hitTiming: number; // percentage of duration when hit occurs (0 to 1)
  keyHint: string;
  description: string;
  color: string;
  iconName: string;
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

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'spark' | 'ember' | 'smoke' | 'blood' | 'ring' | 'shockwave' | 'slash_arc';
  angle?: number;
  radius?: number;
  maxRadius?: number;
}

export interface PlayerState {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  facing: 1 | -1; // 1 = right, -1 = left
  animation: PlayerAnimation;
  animTimer: number;
  animDuration: number;
  activeAttack: AttackConfig | null;
  hasHitThisAttack: boolean;
  cooldowns: {
    slash: number;
    power_strike: number;
    special: number;
  };
  combo: number;
  comboTimer: number;
  isHurt: boolean;
  invincibleTimer: number;
}

export interface EnemyState {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  facing: 1 | -1;
  animation: EnemyAnimation;
  animTimer: number;
  animDuration: number;
  aiTimer: number;
  attackCooldown: number;
  isAttacking: boolean;
  telegraphTimer: number;
  isHurt: boolean;
  invincibleTimer: number;
}

export interface BattleStats {
  damageDealt: number;
  maxCombo: number;
  hitsLanded: number;
  battleDuration: number; // in seconds
  slashesUsed: number;
  powerStrikesUsed: number;
  specialsUsed: number;
}
