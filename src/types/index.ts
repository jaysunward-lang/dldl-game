// ============================================================
// 斗罗大陆 · 核心类型定义
// ============================================================

// ---- 玩家角色 ----
export type WuhunQuality = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7'
export type WuhunType = '强攻' | '敏攻' | '控制' | '防御' | '辅助' | '精神' | '食物'
export type SpiritRealm = '凡境' | '灵境' | '意境' | '域境' | '神境'
export type TitleRank = '魂士' | '魂师' | '大魂师' | '魂尊' | '魂宗' | '魂王' | '魂帝' | '魂圣' | '魂斗罗' | '封号斗罗' | '神级'

export interface PlayerStats {
  hp: number; maxHp: number
  mp: number; maxMp: number
  attack: number; defense: number
  speed: number; spirit: number
  constitution: number; strength: number
  agility: number; intelligence: number
  critRate: number; critDmg: number
  dodgeRate: number; hitRate: number
}

export type InventoryItemType = 'soulRing' | 'soulBone' | 'externalBone' | 'material' | 'weapon' | 'consumable'

export interface InventoryItem {
  id: string
  name: string
  type: InventoryItemType
  quantity: number
  quality?: string
  icon?: string
  description?: string
}

export interface Player {
  id: string
  name: string
  level: number; exp: number
  title: TitleRank
  wuhun: WuhunInfo
  stats: PlayerStats
  spiritRealm: SpiritRealm
  spiritValue: number
  gold: number; diamond: number; soulCoin: number
  stamina: number; maxStamina: number
  phase: GamePhase
  actionWindows: { used: number; total: number }
  relationShips: Record<string, number>
  achievements: string[]
  currentTitle: string
  inventory: InventoryItem[]
}

export interface WuhunInfo {
  name: string; type: WuhunType
  quality: WuhunQuality; qualityMultiplier: number
  soulRings: SoulRing[]
  evolutionStage: number
}

export interface SoulRing {
  slot: number; years: number
  quality: SoulRingQuality
  skillId: string; skillName: string
}

export type SoulRingQuality = '白色' | '黄色' | '紫色' | '黑色' | '红色' | '金色'

// ---- 游戏阶段 ----
export interface GamePhase {
  chapter: number; chapterName: string
  phaseIndex: number; phaseName: string
  age: number; levelCap: number
  unlockedFeatures: string[]
}

// ---- 战斗系统 ----
export type BattleAction = 'attack' | 'skill' | 'defend' | 'item' | 'flee'
export type BattleState = 'idle' | 'init' | 'roundStart' | 'actionSelect' | 'actionExec' | 'actionPost' | 'roundEnd' | 'result' | 'reward'

export interface BattleUnit {
  id: string; name: string
  isPlayer: boolean; isBoss: boolean
  level: number
  stats: BattleStats
  buffs: Buff[]
  debuffs: Debuff[]
  threatValue: number
  alive: boolean
}

export interface BattleStats {
  hp: number; maxHp: number
  mp: number; maxMp: number
  attack: number; defense: number
  speed: number; spirit: number
  constitution?: number; strength?: number
  agility?: number; intelligence?: number
  critRate: number; critDmg: number
  dodgeRate: number; hitRate?: number
}

export interface Buff {
  id: string; name: string
  type: 'attack' | 'defense' | 'speed' | 'crit' | 'shield' | 'regen'
  value: number; remainingTurns: number
}

export interface Debuff {
  id: string; name: string
  type: 'poison' | 'burn' | 'bleed' | 'stun' | 'slow' | 'defenseDown' | 'attackDown'
  value: number; remainingTurns: number
  damagePerTurn?: number
}

export interface BattleLog {
  round: number
  entries: LogEntry[]
}

export interface LogEntry {
  actor: string; action: string
  target?: string; value?: number
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'dodge' | 'crit' | 'flee' | 'system'
  isCrit?: boolean; isSpirit?: boolean
}

// ---- 魂技 ----
export type SkillType = 'ATK' | 'CTL' | 'SUP' | 'BST' | 'FLD' | 'ULT'
export type SkillTarget = 'single' | 'all' | 'self' | 'ally'

export interface Skill {
  id: string; name: string
  type: SkillType; target: SkillTarget
  level: number; maxLevel: number
  mpCost: number; cooldown: number
  currentCooldown: number
  damageMultiplier: number
  description: string
  effects: SkillEffect[]
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'shield' | 'dot'
  value: number; duration?: number
  stat?: string; chance?: number
}

// ---- 任务系统 ----
export type QuestType = 'main' | 'side' | 'daily' | 'weekly' | 'hidden'
export type QuestStatus = 'locked' | 'available' | 'active' | 'completed'

export interface Quest {
  id: string; name: string
  type: QuestType; status: QuestStatus
  chapter: number; recommendedLevel: number
  prerequisites: string[]
  objectives: QuestObjective[]
  rewards: QuestReward
  description: string
}

export interface QuestObjective {
  id: string; description: string
  type: 'kill' | 'collect' | 'talk' | 'explore' | 'reach'
  target: string; required: number
  current: number
}

export interface QuestReward {
  exp: number; gold: number
  items?: RewardItem[]
  unlockFeature?: string
  achievement?: string
}

export interface RewardItem {
  id: string; name: string
  quantity: number; quality?: string
}

// ---- 经济系统 ----
export interface ShopItem {
  id: string; name: string
  price: number; currency: 'gold' | 'diamond' | 'soulCoin'
  quantity: number; limitPerDay?: number
  quality?: string
}

export interface AuctionItem {
  id: string; sellerId: string
  item: RewardItem; startPrice: number
  buyoutPrice?: number; currentBid: number
  bidderId?: string; remainingTime: number
}

// ---- 社交系统 ----
export interface FriendInfo {
  id: string; name: string
  level: number; title: TitleRank
  online: boolean; intimacy: number
  guildName?: string
}

export interface GuildInfo {
  id: string; name: string
  level: number; memberCount: number; maxMembers: number
  leaderName: string; announcement: string
  warehouseSlots: number
}

// ---- 副本系统 ----
export type DungeonType = 'soulBeastForest' | 'soulRingTrial' | 'soulBoneRealm' | 'goldCave' | 'spiritTower' | 'worldBoss' | 'limitedEvent'
export type DungeonDifficulty = 'normal' | 'hard' | 'hell'

export interface Dungeon {
  id: string; name: string
  type: DungeonType
  difficulties: DungeonDifficulty[]
  unlockLevel: number; unlockPhase: string
  staminaCost: Record<DungeonDifficulty, number>
  dailyLimit: number; remainingToday: number
  recommendedPower: Record<DungeonDifficulty, number>
}