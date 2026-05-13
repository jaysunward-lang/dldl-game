// ============================================================
// 斗罗大陆 · 战斗公式引擎
// 物理/精神双路径伤害 + 命中/暴击/闪避判定 + Buff/Debuff
// ============================================================
import type { BattleUnit, Skill, Buff, Debuff, SpiritRealm } from '@types'

// ---- 境界系数 ----
const SPIRIT_REALM_COEFF: Record<SpiritRealm, number> = {
  '凡境': 1.00,
  '灵境': 1.20,
  '意境': 1.50,
  '域境': 2.00,
  '神境': 3.00,
}

// ---- 属性克制表 ----
type Element = 'fire' | 'wood' | 'earth' | 'water' | 'light' | 'dark' | 'neutral'
const ELEMENT_COUNTER: Record<Element, Element> = {
  fire: 'wood', wood: 'earth', earth: 'water', water: 'fire',
  light: 'dark', dark: 'light', neutral: 'neutral',
}

// ---- 随机数工具 ----
export function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}
export function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1))
}
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ---- 命中判定 ----
export function calcHitRate(
  attacker: BattleUnit,
  target: BattleUnit,
  skillHitMod = 0,
): { hit: boolean; rate: number } {
  const levelDiff = (attacker.level - target.level) * 0.5
  const spiritMod = target.stats.spirit > 0
    ? ((attacker.stats.spirit - target.stats.spirit) / Math.max(attacker.stats.spirit, target.stats.spirit)) * 15
    : 0
  const rate = clamp(
    95 + skillHitMod + levelDiff + spiritMod - target.stats.dodgeRate,
    5, 95,
  )
  return { hit: Math.random() * 100 < rate, rate }
}

// ---- 暴击判定 ----
export function calcCrit(
  attacker: BattleUnit,
  target: BattleUnit,
  skillCritMod = 0,
): { crit: boolean; critDmg: number } {
  const agiBonus = (attacker.stats.agility ?? attacker.stats.speed ?? 10) / 100 * 2
  // 暴击抗性：体质越高越难被暴击
  const targetResist = Math.min(50, (target.stats.constitution ?? 20) / 100 * 3)
  const critRate = clamp(5 + agiBonus + skillCritMod - targetResist, 5, 80)
  const crit = Math.random() * 100 < critRate
  const baseCritDmg = 150
  const strBonus = (attacker.stats.strength ?? attacker.stats.attack ?? 15) / 100 * 5
  const critDmg = baseCritDmg + strBonus
  return { crit, critDmg: Math.min(300, Math.max(120, critDmg)) }
}

// ---- 物理伤害计算 ----
export function calcPhysicalDamage(
  attacker: BattleUnit,
  target: BattleUnit,
  skill: Skill,
  element: Element = 'neutral',
): number {
  const atk = attacker.stats.attack
  const def = target.stats.defense
  const multiplier = skill.damageMultiplier

  // 属性克制
  const counterElement = ELEMENT_COUNTER[element]
  let elementCoeff = 1.0
  if (element !== 'neutral' && counterElement !== 'neutral') {
    elementCoeff = element === 'light' || element === 'dark' ? 1.5 : 1.3
  }

  // 基础伤害
  const rawDamage = (atk * multiplier * elementCoeff) - (def * 0.6)
  const clampedDamage = Math.max(1, rawDamage)

  // 伤害浮动 ±5%
  const variance = rand(0.95, 1.05)

  return Math.round(clampedDamage * variance)
}

// ---- 精神伤害计算 ----
export function calcSpiritDamage(
  attacker: BattleUnit,
  target: BattleUnit,
  skill: Skill,
  realmCoeff = 1.0,
): number {
  const atkSpirit = attacker.stats.spirit
  const tgtSpirit = target.stats.spirit
  const multiplier = skill.damageMultiplier

  // 精神伤害不可暴击、无浮动、天然穿透物理护盾
  const spiritDmgBonus = 0.0 // 可被装备/魂骨加成（默认无加成）
  const spiritResist = 0.0 // 可被装备/境界减免（默认无减免）

  const rawDamage =
    atkSpirit * multiplier * realmCoeff * (1 + spiritDmgBonus) -
    tgtSpirit * 0.3 * realmCoeff * (1 + spiritResist)

  return Math.round(Math.max(1, rawDamage))
}

// ---- 合并伤害 ----
export interface DamageResult {
  physical: number
  spirit: number
  total: number
  crit: boolean
  critDmg: number
  hit: boolean
  hitRate: number
  isPhysical: boolean
  isSpirit: boolean
}

export function calcTotalDamage(
  attacker: BattleUnit,
  target: BattleUnit,
  skill: Skill,
  options: {
    element?: Element
    realmCoeff?: number
    skillHitMod?: number
    skillCritMod?: number
  } = {},
): DamageResult {
  const hit = calcHitRate(attacker, target, options.skillHitMod ?? 0)
  const crit = calcCrit(attacker, target, options.skillCritMod ?? 0)

  if (!hit.hit) {
    return { physical: 0, spirit: 0, total: 0, crit: false, critDmg: 0, hit: false, hitRate: hit.rate, isPhysical: false, isSpirit: false }
  }

  const isPhysical = skill.effects.some(e => e.type === 'damage')
  const isSpirit = skill.effects.some(e => e.type === 'dot' && e.stat === 'spirit')

  let physicalDmg = 0
  let spiritDmg = 0

  if (isPhysical) {
    physicalDmg = calcPhysicalDamage(attacker, target, skill, options.element)
    if (crit.crit) {
      physicalDmg = Math.round(physicalDmg * (crit.critDmg / 100))
    }
  }

  if (isSpirit) {
    spiritDmg = calcSpiritDamage(attacker, target, skill, options.realmCoeff ?? 1.0)
    // 精神伤害不可暴击
  }

  return {
    physical: physicalDmg,
    spirit: spiritDmg,
    total: physicalDmg + spiritDmg,
    crit: crit.crit,
    critDmg: crit.critDmg,
    hit: true,
    hitRate: hit.rate,
    isPhysical,
    isSpirit,
  }
}

// ---- 属性克制系数 ----
export function getElementCoeff(attackerEl: Element, targetEl: Element): number {
  if (ELEMENT_COUNTER[attackerEl] === targetEl) {
    return attackerEl === 'light' || attackerEl === 'dark' ? 1.5 : 1.3
  }
  return 1.0
}

// ---- 减伤叠乘 ----
export function calcDamageReduction(reductions: number[]): number {
  const product = reductions.reduce((acc, r) => acc * (1 - r), 1)
  return Math.max(0.15, product) // 减伤上限85%
}

// ---- Buff/Debuff 回合结算 ----
export interface TickResult {
  damageByPoison: number
  damageByBurn: number
  damageByBleed: number
  totalDot: number
  expiredBuffs: string[]
  expiredDebuffs: string[]
}

export function tickBuffsAndDebuffs(unit: BattleUnit): TickResult {
  let damageByPoison = 0
  let damageByBurn = 0
  let damageByBleed = 0
  const expiredBuffs: string[] = []
  const expiredDebuffs: string[] = []

  // Tick debuffs (DOT)
  for (const d of unit.debuffs) {
    if (d.damagePerTurn && d.remainingTurns > 0) {
      if (d.type === 'poison') damageByPoison += d.damagePerTurn
      else if (d.type === 'burn') damageByBurn += d.damagePerTurn
      else if (d.type === 'bleed') damageByBleed += d.damagePerTurn
    }
  }

  // Decrease remaining turns
  unit.buffs.forEach((b) => {
    b.remainingTurns -= 1
    if (b.remainingTurns <= 0) expiredBuffs.push(b.id)
  })
  unit.debuffs.forEach((d) => {
    d.remainingTurns -= 1
    if (d.remainingTurns <= 0) expiredDebuffs.push(d.id)
  })

  // Remove expired
  unit.buffs = unit.buffs.filter((b) => b.remainingTurns > 0)
  unit.debuffs = unit.debuffs.filter((d) => d.remainingTurns > 0)

  return {
    damageByPoison,
    damageByBurn,
    damageByBleed,
    totalDot: damageByPoison + damageByBurn + damageByBleed,
    expiredBuffs,
    expiredDebuffs,
  }
}

// ---- 护盾吸收 ----
export function calcShieldAbsorb(
  damage: number,
  shields: { name: string; value: number }[],
): { remainingDamage: number; absorbedBy: Record<string, number> } {
  const absorbedBy: Record<string, number> = {}
  let remaining = damage
  for (const shield of shields) {
    if (remaining <= 0) break
    const absorbed = Math.min(remaining, shield.value)
    absorbedBy[shield.name] = absorbed
    remaining -= absorbed
  }
  return { remainingDamage: remaining, absorbedBy }
}

// ---- 逃跑判定 ----
export function calcFleeChance(
  playerSpeed: number,
  enemyMaxSpeed: number,
  consecutiveFlees: number,
): { success: boolean; chance: number } {
  const speedDiff = (playerSpeed - enemyMaxSpeed) / Math.max(enemyMaxSpeed, 1) * 25
  const fleeBonus = (consecutiveFlees - 1) * 8
  const chance = clamp(30 + speedDiff + fleeBonus, 10, 95)
  return { success: Math.random() * 100 < chance, chance }
}

// ---- 境界压制系数 ----
export function getRealmSuppression(
  attackerRealm: SpiritRealm,
  targetRealm: SpiritRealm,
): number {
  const realmOrder: SpiritRealm[] = ['凡境', '灵境', '意境', '域境', '神境']
  const diff = realmOrder.indexOf(attackerRealm) - realmOrder.indexOf(targetRealm)
  if (diff <= 0) return 0
  // 每高1境，低境界方全属性-5%
  return Math.min(diff * 5, 50)
}

// ---- 经验计算 ----
export function calcExpReward(
  enemyLevels: number[],
  playerLevel: number,
  difficultyMultiplier: number,
): number {
  const baseExpSum = enemyLevels.reduce((sum, lv) => sum + lv * 10, 0)
  const levelDiff = clamp(1 + (playerLevel - enemyLevels.reduce((a, b) => a + b, 0) / enemyLevels.length) * 0.05, 0.5, 2.0)
  return Math.round(baseExpSum * difficultyMultiplier * levelDiff)
}

// ---- 金币奖励 ----
export function calcGoldReward(
  enemyLevels: number[],
  difficultyMultiplier: number,
): number {
  const baseGold = enemyLevels.reduce((sum, lv) => sum + lv * 5, 0)
  return Math.round(baseGold * difficultyMultiplier * rand(0.9, 1.1))
}

// ---- 行动顺序排序 ----
export function sortBySpeed(units: BattleUnit[]): BattleUnit[] {
  return [...units].sort((a, b) => {
    const speedDiff = b.stats.speed - a.stats.speed
    if (Math.abs(speedDiff) < 1) {
      // 同速随机波动
      return rand(0, 10) - rand(0, 10)
    }
    return speedDiff
  })
}
