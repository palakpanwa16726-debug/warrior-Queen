// ============================================================================
// WARRIOR QUEEN - COMPREHENSIVE GAME DATA & CONFIGURATIONS
// 10 Levels, 10 Outfits, 10 Swords, 5 Upgrade Types, 7 Enemy Architectures
// ============================================================================

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

export interface Outfit {
  id: string;
  level: number;
  name: string;
  title: string;
  description: string;
  perk: string;
  hpBonus: number;
  atkBonus: number; // multiplier, e.g. 1.05 = +5%
  spdBonus: number;
  primaryColor: string;
  secondaryColor: string;
  capeColor: string;
  accentColor: string;
  auraColor?: string;
  crownType: 'band' | 'bronze' | 'tiara' | 'silver_mukut' | 'gold_spire' | 'crested' | 'mystic_horns' | 'sun_radiance' | 'dragon_crown' | 'celestial_devi';
}

export interface Sword {
  id: string;
  level: number;
  name: string;
  title: string;
  description: string;
  bonusDamage: number;
  critChance: number; // 0 to 1
  bladeColor: string;
  edgeColor: string;
  hiltColor: string;
  glowColor?: string;
  trailColor: string;
  specialEffectName: string;
}

export interface EnemyTypeConfig {
  id: string;
  name: string;
  role: 'basic' | 'fast' | 'armored' | 'dual' | 'elite' | 'miniboss' | 'finalboss';
  color: string;
  trimColor: string;
  weaponType: 'sword' | 'daggers' | 'greatsword' | 'scythe' | 'axe' | 'boss_blade';
  scale: number;
  canBlock: boolean;
  canDash: boolean;
  baseHp: number;
  baseDamage: number;
  baseSpeed: number;
  attackInterval: number;
}

export interface LevelConfig {
  level: number;
  name: string;
  location: string;
  description: string;
  enemyType: string;
  enemyName: string;
  enemyHp: number;
  enemyDamage: number;
  enemySpeed: number;
  attackInterval: number;
  enemyCount: number; // 1 or 2 (multi-enemy)
  isMiniBoss?: boolean;
  isFinalBoss?: boolean;
  coinsReward: number;
  xpReward: number;
  unlockedOutfitId: string;
  unlockedSwordId: string;
  bgTheme: 
    | 'training_ground' 
    | 'emerald_forest' 
    | 'ancient_temple' 
    | 'mountain_crag' 
    | 'castle_arena' 
    | 'burning_field' 
    | 'dark_forest' 
    | 'ancient_ruins' 
    | 'dark_fortress' 
    | 'final_boss_arena';
}

export interface UpgradeConfig {
  id: 'health' | 'attack' | 'sword_power' | 'special_attack' | 'defense';
  name: string;
  description: string;
  maxRank: number;
  baseCost: number;
  costMultiplier: number;
  icon: string;
}

// ----------------------------------------------------------------------------
// 10 UNIQUE WARRIOR OUTFITS (1 per level)
// ----------------------------------------------------------------------------
export const OUTFITS: Outfit[] = [
  {
    id: 'outfit_1',
    level: 1,
    name: 'Novice Linen Garb',
    title: 'Beginner Rajput Trainee',
    description: 'Simple woven earthen linen tunic bound with durable leather cords and bronze wrist guards.',
    perk: 'Standard combat agility & baseline endurance.',
    hpBonus: 0,
    atkBonus: 1.0,
    spdBonus: 1.0,
    primaryColor: '#b45309',
    secondaryColor: '#78350f',
    capeColor: '#991b1b',
    accentColor: '#d97706',
    crownType: 'band',
  },
  {
    id: 'outfit_2',
    level: 2,
    name: 'Hardened Leather Attire',
    title: 'Forest Scout Cuirass',
    description: 'Tough river-tanned bull leather studded with polished bronze rivets for flexible wilderness mobility.',
    perk: '+15 Max HP, +5% Movement Speed.',
    hpBonus: 15,
    atkBonus: 1.05,
    spdBonus: 1.05,
    primaryColor: '#854d0e',
    secondaryColor: '#14532d',
    capeColor: '#166534',
    accentColor: '#ca8a04',
    crownType: 'bronze',
  },
  {
    id: 'outfit_3',
    level: 3,
    name: 'Armored Vanguard Mail',
    title: 'Temple Sentinel Plate',
    description: 'Tempered iron breastplate layered with interwoven mail and ceremonial saffron silk tassels.',
    perk: '+30 Max HP, +8% Attack Power.',
    hpBonus: 30,
    atkBonus: 1.08,
    spdBonus: 1.0,
    primaryColor: '#64748b',
    secondaryColor: '#991b1b',
    capeColor: '#b91c1c',
    accentColor: '#e2e8f0',
    crownType: 'tiara',
  },
  {
    id: 'outfit_4',
    level: 4,
    name: 'Royal Sapphire Cuirass',
    title: 'Highland Sovereign Armor',
    description: 'Forged from deep mountain cobalt steel with royal lapis lazuli inlays and silvery shoulder guards.',
    perk: '+45 Max HP, +12% Attack Power, +5% Defense.',
    hpBonus: 45,
    atkBonus: 1.12,
    spdBonus: 1.02,
    primaryColor: '#3b82f6',
    secondaryColor: '#1e3a8a',
    capeColor: '#2563eb',
    accentColor: '#93c5fd',
    crownType: 'silver_mukut',
  },
  {
    id: 'outfit_5',
    level: 5,
    name: 'Elite Golden Kavach',
    title: 'Castle Champion Sovereign Plate',
    description: 'Polished solid gold breastplate engraved with solar mantras and crowned by a burning ruby heart-gem.',
    perk: '+65 Max HP, +18% Attack Power, +10% Speed.',
    hpBonus: 65,
    atkBonus: 1.18,
    spdBonus: 1.1,
    primaryColor: '#eab308',
    secondaryColor: '#78350f',
    capeColor: '#dc2626',
    accentColor: '#fef08a',
    auraColor: 'rgba(234, 179, 8, 0.35)',
    crownType: 'gold_spire',
  },
  {
    id: 'outfit_6',
    level: 6,
    name: 'Advanced Obsidian Battle Armor',
    title: 'Infernal Dreadplate',
    description: 'Blackened volcanic steel reinforced with fiery brass trim, designed to withstand hellish siege fires.',
    perk: '+85 Max HP, +22% Attack Power, Fire Resistance.',
    hpBonus: 85,
    atkBonus: 1.22,
    spdBonus: 1.05,
    primaryColor: '#18181b',
    secondaryColor: '#7f1d1d',
    capeColor: '#ea580c',
    accentColor: '#f97316',
    auraColor: 'rgba(249, 115, 22, 0.4)',
    crownType: 'crested',
  },
  {
    id: 'outfit_7',
    level: 7,
    name: 'Mystic Amethyst Robes',
    title: 'Arcane Shadow Empress',
    description: 'Ethereal velvet infused with crushed celestial amethyst and silver runes that distort incoming blades.',
    perk: '+110 Max HP, +28% Attack Power, -15% Skill Cooldowns.',
    hpBonus: 110,
    atkBonus: 1.28,
    spdBonus: 1.12,
    primaryColor: '#581c87',
    secondaryColor: '#3b0764',
    capeColor: '#7e22ce',
    accentColor: '#c084fc',
    auraColor: 'rgba(168, 85, 247, 0.45)',
    crownType: 'mystic_horns',
  },
  {
    id: 'outfit_8',
    level: 8,
    name: 'Royal Sunburst Armor',
    title: 'Ancient Ruin Sovereign',
    description: 'Relic armor unearthed from the Sun Dynasty, blazing with radiant solar filigree and emerald jewels.',
    perk: '+140 Max HP, +34% Attack Power, +15% Critical Chance.',
    hpBonus: 140,
    atkBonus: 1.34,
    spdBonus: 1.12,
    primaryColor: '#f59e0b',
    secondaryColor: '#065f46',
    capeColor: '#047857',
    accentColor: '#34d399',
    auraColor: 'rgba(52, 211, 153, 0.4)',
    crownType: 'sun_radiance',
  },
  {
    id: 'outfit_9',
    level: 9,
    name: 'Legendary Crimson Dragonscale',
    title: 'Fortress Breaker Mail',
    description: 'Mythic scales of the slumbering mountain dragon forged into impenetrable battle plates.',
    perk: '+175 Max HP, +40% Attack Power, +15% Speed, High Defense.',
    hpBonus: 175,
    atkBonus: 1.4,
    spdBonus: 1.15,
    primaryColor: '#991b1b',
    secondaryColor: '#450a0a',
    capeColor: '#b91c1c',
    accentColor: '#fbbf24',
    auraColor: 'rgba(239, 68, 68, 0.5)',
    crownType: 'dragon_crown',
  },
  {
    id: 'outfit_10',
    level: 10,
    name: 'Mythic Devi Celestial Avatar',
    title: 'Supreme Goddess of the Battlefield',
    description: 'The supreme ascended form: luminous stoles of liquid starlight and divine gold radiating an unstoppable aura.',
    perk: '+220 Max HP, +50% Attack Power, +20% Speed, Supreme Divine Aura.',
    hpBonus: 220,
    atkBonus: 1.5,
    spdBonus: 1.2,
    primaryColor: '#facc15',
    secondaryColor: '#4338ca',
    capeColor: '#6366f1',
    accentColor: '#a855f7',
    auraColor: 'rgba(168, 85, 247, 0.65)',
    crownType: 'celestial_devi',
  },
];

// ----------------------------------------------------------------------------
// 10 UNIQUE SWORDS (1 per level)
// ----------------------------------------------------------------------------
export const SWORDS: Sword[] = [
  {
    id: 'sword_1',
    level: 1,
    name: 'Basic Iron Talwar',
    title: 'Novice Recruit Blade',
    description: 'Sturdy curved iron talwar with a standard brass disk pommel.',
    bonusDamage: 0,
    critChance: 0.05,
    bladeColor: '#cbd5e1',
    edgeColor: '#f8fafc',
    hiltColor: '#78350f',
    trailColor: 'rgba(245, 158, 11, 0.7)',
    specialEffectName: 'Swift Slash',
  },
  {
    id: 'sword_2',
    level: 2,
    name: 'Decorated Bronze Sabre',
    title: 'Hunter Curved Edge',
    description: 'Etched with hunting motifs along the spine, balanced for agile swings.',
    bonusDamage: 5,
    critChance: 0.08,
    bladeColor: '#d97706',
    edgeColor: '#fef08a',
    hiltColor: '#854d0e',
    trailColor: 'rgba(217, 119, 6, 0.8)',
    specialEffectName: 'Bronze Whistle',
  },
  {
    id: 'sword_3',
    level: 3,
    name: 'Reinforced Steel Shamshir',
    title: 'Temple Guard Steel',
    description: 'Folded Damascus steel with a razor curve that slices cleanly through heavy gambesons.',
    bonusDamage: 10,
    critChance: 0.12,
    bladeColor: '#94a3b8',
    edgeColor: '#ffffff',
    hiltColor: '#ca8a04',
    trailColor: 'rgba(148, 163, 184, 0.85)',
    specialEffectName: 'Steel Razor Cleave',
  },
  {
    id: 'sword_4',
    level: 4,
    name: 'Enhanced Royal Khanda',
    title: 'Mountain Sovereign Broadsword',
    description: 'Reinforced spine plate and spiked pommel capable of crushing armor.',
    bonusDamage: 18,
    critChance: 0.15,
    bladeColor: '#60a5fa',
    edgeColor: '#dbeafe',
    hiltColor: '#1e3a8a',
    glowColor: '#3b82f6',
    trailColor: 'rgba(59, 130, 246, 0.85)',
    specialEffectName: 'Cobalt Armor Piercing',
  },
  {
    id: 'sword_5',
    level: 5,
    name: 'Glowing Sun Blade (Surya Astra)',
    title: 'Solar Champion Scimitar',
    description: 'Forged in sacred solar flames, casting bright amber sparks with every sweep.',
    bonusDamage: 26,
    critChance: 0.2,
    bladeColor: '#fbbf24',
    edgeColor: '#fef08a',
    hiltColor: '#b45309',
    glowColor: '#f59e0b',
    trailColor: 'rgba(245, 158, 11, 0.95)',
    specialEffectName: 'Solar Flare Arc',
  },
  {
    id: 'sword_6',
    level: 6,
    name: 'Inferno Sabre of Ashva',
    title: 'Hellfire Cleaver',
    description: 'Quenched in dragon oil; trails roaring fire embers that scorch the earth.',
    bonusDamage: 35,
    critChance: 0.22,
    bladeColor: '#ea580c',
    edgeColor: '#ffedd5',
    hiltColor: '#7c2d12',
    glowColor: '#f97316',
    trailColor: 'rgba(234, 88, 12, 0.95)',
    specialEffectName: 'Ignited Fissure Slash',
  },
  {
    id: 'sword_7',
    level: 7,
    name: 'Mystic Moon Edge (Chandra Talwar)',
    title: 'Arcane Ethereal Blade',
    description: 'Gleams with violet lunar ether, phase-shifting through enemy defenses.',
    bonusDamage: 45,
    critChance: 0.26,
    bladeColor: '#c084fc',
    edgeColor: '#f3e8ff',
    hiltColor: '#581c87',
    glowColor: '#a855f7',
    trailColor: 'rgba(168, 85, 247, 0.95)',
    specialEffectName: 'Ethereal Rift Wave',
  },
  {
    id: 'sword_8',
    level: 8,
    name: 'Ancient Radiant Khanda',
    title: 'Sanctuary Sun Cleaver',
    description: 'Carved with celestial hieroglyphs, releasing blinding emerald shockwaves.',
    bonusDamage: 56,
    critChance: 0.3,
    bladeColor: '#34d399',
    edgeColor: '#ecfdf5',
    hiltColor: '#065f46',
    glowColor: '#10b981',
    trailColor: 'rgba(16, 185, 129, 0.95)',
    specialEffectName: 'Emerald Storm Cleave',
  },
  {
    id: 'sword_9',
    level: 9,
    name: 'Void Slayer of Vikram',
    title: 'Fortress Dread Blade',
    description: 'Absorbs light itself; its edges hum with pure gravitational vortex power.',
    bonusDamage: 70,
    critChance: 0.35,
    bladeColor: '#e11d48',
    edgeColor: '#ffe4e6',
    hiltColor: '#881337',
    glowColor: '#f43f5e',
    trailColor: 'rgba(225, 29, 72, 0.95)',
    specialEffectName: 'Crimson Vortex Burst',
  },
  {
    id: 'sword_10',
    level: 10,
    name: 'Supreme Celestial Devi Astra',
    title: 'The God-Slayer Divine Blade',
    description: 'Divine gift from the cosmos, glowing with eternal golden brilliance and cosmic thunder.',
    bonusDamage: 90,
    critChance: 0.4,
    bladeColor: '#fef08a',
    edgeColor: '#ffffff',
    hiltColor: '#4338ca',
    glowColor: '#eab308',
    trailColor: 'rgba(250, 204, 21, 1)',
    specialEffectName: 'Celestial Judgment Nova',
  },
];

// ----------------------------------------------------------------------------
// 10 UNIQUE LEVELS (Complete Campaign)
// ----------------------------------------------------------------------------
export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: 'Training Grounds',
    location: 'Fortress Courtyard',
    description: 'Learn the fundamentals of swordplay against a rogue outlaw bandit.',
    enemyType: 'basic',
    enemyName: 'Outlaw Bandit',
    enemyHp: 100,
    enemyDamage: 12,
    enemySpeed: 100,
    attackInterval: 2.8,
    enemyCount: 1,
    coinsReward: 50,
    xpReward: 80,
    unlockedOutfitId: 'outfit_1',
    unlockedSwordId: 'sword_1',
    bgTheme: 'training_ground',
  },
  {
    level: 2,
    name: 'Emerald Forest',
    location: 'Border Woods',
    description: 'A nimble forest raider strikes with speed among the misty trees.',
    enemyType: 'fast',
    enemyName: 'Forest Raider',
    enemyHp: 130,
    enemyDamage: 16,
    enemySpeed: 130,
    attackInterval: 2.3,
    enemyCount: 1,
    coinsReward: 75,
    xpReward: 120,
    unlockedOutfitId: 'outfit_2',
    unlockedSwordId: 'sword_2',
    bgTheme: 'emerald_forest',
  },
  {
    level: 3,
    name: 'Ancient Sun Temple',
    location: 'Sacred Colonnade',
    description: 'Defend the sacred grounds against aggressive twin skirmishers!',
    enemyType: 'dual',
    enemyName: 'Twin Temple Skirmishers',
    enemyHp: 170,
    enemyDamage: 19,
    enemySpeed: 140,
    attackInterval: 2.0,
    enemyCount: 2, // Two enemies appear!
    coinsReward: 110,
    xpReward: 180,
    unlockedOutfitId: 'outfit_3',
    unlockedSwordId: 'sword_3',
    bgTheme: 'ancient_temple',
  },
  {
    level: 4,
    name: 'Mist Crag Mountain',
    location: 'Highland Pass',
    description: 'An elite armored vanguard whose thick shield blocks frontal regular slashes.',
    enemyType: 'armored',
    enemyName: 'Shielded Vanguard Captain',
    enemyHp: 220,
    enemyDamage: 22,
    enemySpeed: 125,
    attackInterval: 2.1,
    enemyCount: 1,
    coinsReward: 150,
    xpReward: 250,
    unlockedOutfitId: 'outfit_4',
    unlockedSwordId: 'sword_4',
    bgTheme: 'mountain_crag',
  },
  {
    level: 5,
    name: 'Castle Arena',
    location: 'Royal Grand Amphitheater',
    description: 'MINI-BOSS: Champion Jodha the Indomitable wields a crushing war axe!',
    enemyType: 'miniboss',
    enemyName: 'CHAMPION JODHA (MINI-BOSS)',
    enemyHp: 500, // Mini-boss large health bar!
    enemyDamage: 28,
    enemySpeed: 150,
    attackInterval: 1.8,
    enemyCount: 1,
    isMiniBoss: true,
    coinsReward: 250,
    xpReward: 400,
    unlockedOutfitId: 'outfit_5',
    unlockedSwordId: 'sword_5',
    bgTheme: 'castle_arena',
  },
  {
    level: 6,
    name: 'Infernal Crucible',
    location: 'Burning Battlefield',
    description: 'Enemies swarm through the flames, attacking from different directions!',
    enemyType: 'dual',
    enemyName: 'Infernal Siege Raiders',
    enemyHp: 280,
    enemyDamage: 26,
    enemySpeed: 165,
    attackInterval: 1.7,
    enemyCount: 2, // Multiple enemies
    coinsReward: 200,
    xpReward: 350,
    unlockedOutfitId: 'outfit_6',
    unlockedSwordId: 'sword_6',
    bgTheme: 'burning_field',
  },
  {
    level: 7,
    name: 'Shadow Sanctum',
    location: 'Dark Moonlit Forest',
    description: 'Elite shadow assassins with stealth leaps, teleport strikes, and deadly poisons.',
    enemyType: 'elite',
    enemyName: 'Nightshade Shadow Lord',
    enemyHp: 350,
    enemyDamage: 33,
    enemySpeed: 185,
    attackInterval: 1.5,
    enemyCount: 1,
    coinsReward: 250,
    xpReward: 420,
    unlockedOutfitId: 'outfit_7',
    unlockedSwordId: 'sword_7',
    bgTheme: 'dark_forest',
  },
  {
    level: 8,
    name: 'Overgrown Ruins',
    location: 'Forgotten Royal Coliseum',
    description: 'Two battle-hardened warlord champions strike in coordinated pincer attacks!',
    enemyType: 'dual',
    enemyName: 'Coliseum Iron Gladiators',
    enemyHp: 380,
    enemyDamage: 32,
    enemySpeed: 170,
    attackInterval: 1.6,
    enemyCount: 2, // Two powerful enemies
    coinsReward: 300,
    xpReward: 500,
    unlockedOutfitId: 'outfit_8',
    unlockedSwordId: 'sword_8',
    bgTheme: 'ancient_ruins',
  },
  {
    level: 9,
    name: 'Dark Royal Fortress',
    location: 'Throne Approach Gates',
    description: 'The Dread Executioner of Vikram unleashes complex dark shockwave combinations.',
    enemyType: 'elite',
    enemyName: 'Dread Executioner General',
    enemyHp: 480,
    enemyDamage: 40,
    enemySpeed: 180,
    attackInterval: 1.35,
    enemyCount: 1,
    coinsReward: 400,
    xpReward: 650,
    unlockedOutfitId: 'outfit_9',
    unlockedSwordId: 'sword_9',
    bgTheme: 'dark_fortress',
  },
  {
    level: 10,
    name: 'Volcanic Throne of Ashva',
    location: 'Molten Core Sanctum',
    description: 'FINAL BOSS: WARLORD VIKRAM THE UNBROKEN. 3 Deadly Battle Phases!',
    enemyType: 'finalboss',
    enemyName: 'WARLORD VIKRAM (FINAL BOSS)',
    enemyHp: 1200, // Very high boss health!
    enemyDamage: 48,
    enemySpeed: 175,
    attackInterval: 1.25,
    enemyCount: 1,
    isFinalBoss: true,
    coinsReward: 1000,
    xpReward: 1500,
    unlockedOutfitId: 'outfit_10',
    unlockedSwordId: 'sword_10',
    bgTheme: 'final_boss_arena',
  },
];

// ----------------------------------------------------------------------------
// UPGRADE SHOP DEFINITIONS
// ----------------------------------------------------------------------------
export const UPGRADES: UpgradeConfig[] = [
  {
    id: 'health',
    name: 'Vitality & Kavach (Health)',
    description: 'Increases Queen maximum HP by +25 per tier.',
    maxRank: 10,
    baseCost: 60,
    costMultiplier: 1.6,
    icon: 'heart',
  },
  {
    id: 'attack',
    name: 'Talwar Mastery (Attack Damage)',
    description: 'Increases all sword attacks and abilities by +12% per tier.',
    maxRank: 10,
    baseCost: 75,
    costMultiplier: 1.65,
    icon: 'swords',
  },
  {
    id: 'sword_power',
    name: 'Razor Edge (Sword Power & Crit)',
    description: 'Grants +4% Critical Chance and +25% Critical Damage bonus.',
    maxRank: 8,
    baseCost: 90,
    costMultiplier: 1.7,
    icon: 'zap',
  },
  {
    id: 'special_attack',
    name: 'Cyclone Fury (Special Attack)',
    description: 'Increases Special Attack power by +20% and reduces cooldown by 0.5s.',
    maxRank: 8,
    baseCost: 100,
    costMultiplier: 1.75,
    icon: 'sparkles',
  },
  {
    id: 'defense',
    name: 'Royal Fortitude (Damage Reduction)',
    description: 'Decreases all incoming damage by 5% per tier (up to 40%).',
    maxRank: 8,
    baseCost: 80,
    costMultiplier: 1.65,
    icon: 'shield',
  },
];

// Difficulty modifiers
export const DIFFICULTY_MODIFIERS: Record<Difficulty, { label: string; dmgMult: number; spdMult: number; desc: string }> = {
  EASY: {
    label: 'Easy',
    dmgMult: 0.7,
    spdMult: 0.8,
    desc: 'Enemy strikes 20% slower with 30% reduced damage. Ideal for story progression.',
  },
  NORMAL: {
    label: 'Normal',
    dmgMult: 1.0,
    spdMult: 1.0,
    desc: 'Balanced authentic combat experience for responsive play.',
  },
  HARD: {
    label: 'Hard',
    dmgMult: 1.4,
    spdMult: 1.25,
    desc: 'Ruthless enemies: 25% faster attack speed and +40% damage. For master warriors!',
  },
};
