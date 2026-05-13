// ============================================================
// 斗罗大陆 · 战斗引擎编排器
// 回合流程编排 + AI决策 + 行动执行 + 胜负判定
// ============================================================
import type {
  BattleUnit, BattleStats, Skill, Buff, Debuff,
  BattleLog, LogEntry,
} from '@types'
import {
  calcTotalDamage, tickBuffsAndDebuffs, calcFleeChance,
  calcHitRate, calcCrit,
  sortBySpeed, rand, randInt, clamp,
} from './combatFormulas'
import { createEnemySkill, reduceCooldowns, getAvailableSkills } from './skillDefinitions'
import { generateLoot, type LootTable } from './lootSystem'

// ---- 战斗事件（UI驱动） ----
export interface BattleEvent {
  type: 'damage' | 'heal' | 'crit' | 'dodge' | 'miss' | 'flee' | 'buff' | 'debuff' |
        'shield' | 'dot' | 'kill' | 'defend' | 'system' | 'turnStart' | 'victory' | 'defeat'
  actorId: string
  actorName: string
  targetId?: string
  targetName?: string
  value?: number
  message: string
}

// ---- 创建战斗单位 ----
let unitCounter = 0

export function createBattleUnit(
  name: string,
  level: number,
  stats: Partial<BattleStats> & { hp: number; maxHp: number; mp: number; maxMp: number },
  isPlayer: boolean,
  isBoss = false,
  skills: Skill[] = [],
): BattleUnit {
  return {
    id: `${isPlayer ? 'player' : 'enemy'}_${++unitCounter}_${Date.now()}`,
    name,
    isPlayer,
    isBoss,
    level,
    stats: {
      hp: stats.hp,
      maxHp: stats.maxHp,
      mp: stats.mp,
      maxMp: stats.maxMp,
      attack: stats.attack ?? level * 5 + 15,
      defense: stats.defense ?? level * 4 + 10,
      speed: stats.speed ?? level * 3 + 8,
      spirit: stats.spirit ?? level * 5 + 30,
      critRate: stats.critRate ?? 5,
      critDmg: stats.critDmg ?? 150,
      dodgeRate: stats.dodgeRate ?? 3,
      constitution: stats.constitution ?? level * 5 + 25,
      strength: stats.strength ?? level * 5 + 20,
      agility: stats.agility ?? level * 3 + 12,
      intelligence: stats.intelligence ?? level * 3 + 15,
    },
    buffs: [],
    debuffs: [],
    threatValue: 0,
    alive: true,
  }
}

// ---- 从玩家数据创建战斗单位 ----
export function createPlayerUnit(
  playerName: string,
  playerLevel: number,
  playerStats: BattleStats,
): BattleUnit {
  return {
    id: `player_0`,
    name: playerName,
    isPlayer: true,
    isBoss: false,
    level: playerLevel,
    stats: { ...playerStats },
    buffs: [],
    debuffs: [],
    threatValue: 100,
    alive: true,
  }
}

// ---- 敌人模板 ----
interface EnemyTemplate {
  name: string
  level: number
  hp: number
  mp: number
  attack: number
  defense: number
  speed: number
  spirit: number
  skills: { name: string; type: Skill['type']; dmgMult: number; mpCost: number; cooldown: number }[]
}

const ENEMY_TEMPLATES: Record<string, EnemyTemplate[]> = {
  soulBeastForest: [
    { name: '曼陀罗蛇', level: 3, hp: 80, mp: 30, attack: 22, defense: 12, speed: 14, spirit: 15,
      skills: [{ name: '毒牙', type: 'ATK', dmgMult: 1.4, mpCost: 10, cooldown: 2 }] },
    { name: '幽冥狼', level: 5, hp: 120, mp: 40, attack: 28, defense: 16, speed: 20, spirit: 20,
      skills: [{ name: '狼爪', type: 'ATK', dmgMult: 1.6, mpCost: 12, cooldown: 2 }] },
    { name: '风狒狒', level: 8, hp: 180, mp: 50, attack: 35, defense: 22, speed: 18, spirit: 25,
      skills: [{ name: '猛击', type: 'ATK', dmgMult: 1.8, mpCost: 15, cooldown: 3 }] },
  ],
  soulRingTrial: [
    { name: '魂环守护者', level: 15, hp: 350, mp: 80, attack: 45, defense: 30, speed: 25, spirit: 40,
      skills: [
        { name: '环影一击', type: 'ATK', dmgMult: 1.8, mpCost: 15, cooldown: 2 },
        { name: '守护之光', type: 'SUP', dmgMult: 0, mpCost: 20, cooldown: 4 },
      ] },
  ],
  default: [
    { name: '魂兽喽啰', level: 3, hp: 60, mp: 25, attack: 18, defense: 10, speed: 12, spirit: 12,
      skills: [{ name: '冲撞', type: 'ATK', dmgMult: 1.3, mpCost: 8, cooldown: 2 }] },
  ],
}

// ---- 生成敌人队伍 ----
export function generateEnemies(dungeonType: string, playerLevel: number): BattleUnit[] {
  const templates = ENEMY_TEMPLATES[dungeonType] || ENEMY_TEMPLATES.default

  // 根据玩家等级调整敌人等级
  const count = dungeonType === 'worldBoss' ? 1 : randInt(1, 3)
  const enemies: BattleUnit[] = []

  for (let i = 0; i < count; i++) {
    const template = templates[randInt(0, templates.length - 1)]
    const levelAdjust = randInt(-2, 2)
    const level = clamp(template.level + levelAdjust, 1, 100)

    const enemySkills = template.skills.map((s) =>
      createEnemySkill(s.name, s.type, s.dmgMult, s.mpCost, s.cooldown),
    )

    enemies.push({
      id: `enemy_${i}_${Date.now()}`,
      name: template.name,
      isPlayer: false,
      isBoss: i === 0 && count === 1 && dungeonType === 'worldBoss',
      level,
      stats: {
        hp: Math.round(template.hp * (1 + level * 0.1)),
        maxHp: Math.round(template.hp * (1 + level * 0.1)),
        mp: template.mp,
        maxMp: template.mp,
        attack: Math.round(template.attack * (1 + level * 0.05)),
        defense: Math.round(template.defense * (1 + level * 0.04)),
        speed: Math.round(template.speed * (1 + level * 0.03)),
        spirit: Math.round(template.spirit * (1 + level * 0.05)),
        critRate: 5,
        critDmg: 150,
        dodgeRate: 3,
      },
      buffs: [],
      debuffs: [],
      threatValue: 0,
      alive: true,
    })
  }

  return enemies
}

// ---- 排序行动顺序 ----
export function sortActionOrder(units: BattleUnit[]): string[] {
  return sortBySpeed(units.filter((u) => u.alive)).map((u) => u.id)
}

// ---- 检查战斗结束 ----
export type BattleResult = 'player_win' | 'player_lose' | 'ongoing'

export function checkBattleEnd(
  playerUnits: BattleUnit[],
  enemyUnits: BattleUnit[],
): BattleResult {
  const allPlayersDead = playerUnits.every((u) => !u.alive)
  const allEnemiesDead = enemyUnits.every((u) => !u.alive)
  if (allPlayersDead) return 'player_lose'
  if (allEnemiesDead) return 'player_win'
  return 'ongoing'
}

// ---- 执行普攻 ----
export function executeBasicAttack(
  attacker: BattleUnit,
  target: BattleUnit,
): { events: BattleEvent[]; target: BattleUnit } {
  const events: BattleEvent[] = []

  // 统一使用 calcHitRate（与魂技保持一致）
  const hitResult = calcHitRate(attacker, target, 0)
  if (!hitResult.hit) {
    events.push({
      type: 'dodge', actorId: attacker.id, actorName: attacker.name,
      targetId: target.id, targetName: target.name, value: 0,
      message: `${target.name} 闪避了 ${attacker.name} 的攻击！`,
    })
    return { events, target }
  }

  const rawDmg = Math.max(1, attacker.stats.attack - target.stats.defense * 0.4)
  const variance = rand(0.95, 1.05)

  // 统一使用 calcCrit（与魂技保持一致）
  const critResult = calcCrit(attacker, target, 0)
  let damage = Math.round(rawDmg * variance)

  if (critResult.crit) {
    damage = Math.round(damage * (critResult.critDmg / 100))
    events.push({
      type: 'crit', actorId: attacker.id, actorName: attacker.name,
      targetId: target.id, targetName: target.name, value: damage,
      message: `💥暴击！${attacker.name} 对 ${target.name} 造成 ${damage} 点伤害`,
    })
  } else {
    events.push({
      type: 'damage', actorId: attacker.id, actorName: attacker.name,
      targetId: target.id, targetName: target.name, value: damage,
      message: `${attacker.name} 攻击 ${target.name}，造成 ${damage} 点伤害`,
    })
  }

  target.stats.hp = Math.max(0, target.stats.hp - damage)
  if (target.stats.hp <= 0) {
    target.alive = false
    events.push({
      type: 'kill', actorId: attacker.id, actorName: attacker.name,
      targetId: target.id, targetName: target.name,
      message: `${target.name} 被击败！`,
    })
  }

  return { events, target }
}

// ---- 执行魂技 ----
export function executeSkill(
  attacker: BattleUnit,
  target: BattleUnit,
  skill: Skill,
  allEnemies?: BattleUnit[],
  allAllies?: BattleUnit[],
): { events: BattleEvent[]; affectedUnits: BattleUnit[] } {
  const events: BattleEvent[] = []
  const affectedUnits: BattleUnit[] = []

  // 扣魂力
  attacker.stats.mp = Math.max(0, attacker.stats.mp - skill.mpCost)
  skill.currentCooldown = skill.cooldown

  events.push({
    type: 'system', actorId: attacker.id, actorName: attacker.name,
    message: `${attacker.name} 使用了【${skill.name}】！（消耗${skill.mpCost}魂力）`,
  })

  // 处理技能效果
  for (const effect of skill.effects) {
    switch (effect.type) {
      case 'damage': {
        // AOE处理
        if (skill.target === 'all' && allEnemies) {
          for (const enemy of allEnemies.filter((e) => e.alive)) {
            const dmgResult = calcTotalDamage(attacker, enemy, skill)
            if (dmgResult.hit) {
              enemy.stats.hp = Math.max(0, enemy.stats.hp - dmgResult.total)
              events.push({
                type: dmgResult.crit ? 'crit' : 'damage',
                actorId: attacker.id, actorName: attacker.name,
                targetId: enemy.id, targetName: enemy.name,
                value: dmgResult.total,
                message: dmgResult.crit
                  ? `💥暴击！对 ${enemy.name} 造成 ${dmgResult.total} 点伤害`
                  : `对 ${enemy.name} 造成 ${dmgResult.total} 点伤害`,
              })
              if (enemy.stats.hp <= 0) {
                enemy.alive = false
                events.push({ type: 'kill', actorId: attacker.id, actorName: attacker.name, targetId: enemy.id, targetName: enemy.name, message: `${enemy.name} 被击败！` })
              }
            } else {
              events.push({ type: 'dodge', actorId: attacker.id, actorName: attacker.name, targetId: enemy.id, targetName: enemy.name, message: `${enemy.name} 闪避了攻击！` })
            }
            affectedUnits.push(enemy)
          }
        } else {
          // 单体
          const dmgResult = calcTotalDamage(attacker, target, skill)
          if (dmgResult.hit) {
            target.stats.hp = Math.max(0, target.stats.hp - dmgResult.total)
            events.push({
              type: dmgResult.crit ? 'crit' : 'damage',
              actorId: attacker.id, actorName: attacker.name,
              targetId: target.id, targetName: target.name,
              value: dmgResult.total,
              message: dmgResult.crit
                ? `💥暴击！对 ${target.name} 造成 ${dmgResult.total} 点伤害`
                : `对 ${target.name} 造成 ${dmgResult.total} 点伤害`,
            })
            if (target.stats.hp <= 0) {
              target.alive = false
              events.push({ type: 'kill', actorId: attacker.id, actorName: attacker.name, targetId: target.id, targetName: target.name, message: `${target.name} 被击败！` })
            }
          } else {
            events.push({ type: 'dodge', actorId: attacker.id, actorName: attacker.name, targetId: target.id, targetName: target.name, message: `${target.name} 闪避了攻击！` })
          }
          affectedUnits.push(target)
        }
        break
      }

      case 'heal': {
        const healAmount = Math.round(attacker.stats.maxHp * effect.value)
        attacker.stats.hp = Math.min(attacker.stats.maxHp, attacker.stats.hp + healAmount)
        events.push({
          type: 'heal', actorId: attacker.id, actorName: attacker.name,
          targetId: attacker.id, targetName: attacker.name,
          value: healAmount,
          message: `${attacker.name} 恢复了 ${healAmount} 点生命值`,
        })
        affectedUnits.push(attacker)
        break
      }

      case 'buff': {
        const buff: Buff = {
          id: `${skill.id}_${effect.stat}_${Date.now()}`,
          name: skill.name + '增益',
          type: (effect.stat as Buff['type']) || 'attack',
          value: effect.value / 100,
          remainingTurns: effect.duration ?? 2,
        }
        attacker.buffs.push(buff)
        events.push({
          type: 'buff', actorId: attacker.id, actorName: attacker.name,
          targetId: attacker.id, targetName: attacker.name,
          message: `${attacker.name} 的${effect.stat}提升了${effect.value}%（${effect.duration}回合）`,
        })
        affectedUnits.push(attacker)
        break
      }

      case 'debuff': {
        if (!effect.chance || Math.random() * 100 < effect.chance) {
          const debuff: Debuff = {
            id: `${skill.id}_${effect.stat}_${Date.now()}`,
            name: skill.name + '减益',
            type: effect.stat === 'speed' ? 'slow' : 'defenseDown',
            value: effect.value / 100,
            remainingTurns: effect.duration ?? 1,
          }
          target.debuffs.push(debuff)
          events.push({
            type: 'debuff', actorId: attacker.id, actorName: attacker.name,
            targetId: target.id, targetName: target.name,
            message: `${target.name} 被附加了${debuff.name}（${effect.duration}回合）`,
          })
          affectedUnits.push(target)
        } else {
          events.push({
            type: 'miss', actorId: attacker.id, actorName: attacker.name,
            targetId: target.id, targetName: target.name,
            message: `减益效果未能附加到${target.name}`,
          })
        }
        break
      }

      case 'shield': {
        const shieldValue = Math.round(attacker.stats.spirit * effect.value)
        const shield: Buff = {
          id: `${skill.id}_shield_${Date.now()}`,
          name: skill.name + '护盾',
          type: 'shield',
          value: shieldValue,
          remainingTurns: effect.duration ?? 3,
        }
        attacker.buffs.push(shield)
        events.push({
          type: 'shield', actorId: attacker.id, actorName: attacker.name,
          value: shieldValue,
          message: `${attacker.name} 获得了 ${shieldValue} 点护盾`,
        })
        affectedUnits.push(attacker)
        break
      }

      case 'dot': {
        const dotDamage = Math.round(attacker.stats.attack * effect.value)
        const dotDebuff: Debuff = {
          id: `${skill.id}_dot_${Date.now()}`,
          name: '中毒',
          type: 'poison',
          value: 0,
          remainingTurns: effect.duration ?? 3,
          damagePerTurn: dotDamage,
        }
        target.debuffs.push(dotDebuff)
        events.push({
          type: 'debuff', actorId: attacker.id, actorName: attacker.name,
          targetId: target.id, targetName: target.name,
          message: `${target.name} 中毒了！每回合损失${dotDamage}HP（${effect.duration}回合）`,
        })
        affectedUnits.push(target)
        break
      }
    }
  }

  return { events, affectedUnits }
}

// ---- 执行防御 ----
export function executeDefend(
  unit: BattleUnit,
): { events: BattleEvent[] } {
  const events: BattleEvent[] = []
  const defendBuff: Buff = {
    id: `defend_${unit.id}_${Date.now()}`,
    name: '防御姿态',
    type: 'defense',
    value: 0.5, // 物理伤害-50%
    remainingTurns: 1,
  }
  unit.buffs.push(defendBuff)
  events.push({
    type: 'defend', actorId: unit.id, actorName: unit.name,
    message: `${unit.name} 进入防御姿态，本回合受到的伤害-50%`,
  })
  return { events }
}

// ---- 执行逃跑 ----
export function executeFlee(
  playerUnit: BattleUnit,
  enemyUnits: BattleUnit[],
  consecutiveFlees: number,
): { events: BattleEvent[]; success: boolean } {
  const events: BattleEvent[] = []
  const maxEnemySpeed = Math.max(...enemyUnits.filter((e) => e.alive).map((e) => e.stats.speed), 1)
  const result = calcFleeChance(playerUnit.stats.speed, maxEnemySpeed, consecutiveFlees)

  if (result.success) {
    events.push({
      type: 'flee', actorId: playerUnit.id, actorName: playerUnit.name,
      message: `逃跑成功！（成功率${Math.round(result.chance)}%）`,
    })
  } else {
    events.push({
      type: 'system', actorId: playerUnit.id, actorName: playerUnit.name,
      message: `逃跑失败！（成功率${Math.round(result.chance)}%）`,
    })
  }

  return { events, success: result.success }
}

// ---- 回合开始 ----
export function startRound(
  playerUnits: BattleUnit[],
  enemyUnits: BattleUnit[],
  round: number,
): { events: BattleEvent[]; actionOrder: string[] } {
  const events: BattleEvent[] = []
  const allUnits = [...playerUnits, ...enemyUnits].filter((u) => u.alive)

  // 1. DOT结算 + Buff/Debuff衰减
  for (const unit of allUnits) {
    const tickResult = tickBuffsAndDebuffs(unit)
    if (tickResult.totalDot > 0) {
      unit.stats.hp = Math.max(0, unit.stats.hp - tickResult.totalDot)
      events.push({
        type: 'dot', actorId: unit.id, actorName: unit.name,
        value: tickResult.totalDot,
        message: `${unit.name} 受到持续伤害 ${tickResult.totalDot} 点`,
      })
      if (unit.stats.hp <= 0) {
        unit.alive = false
        events.push({
          type: 'kill', actorId: 'system', actorName: '持续伤害',
          targetId: unit.id, targetName: unit.name,
          message: `${unit.name} 被持续伤害击败！`,
        })
      }
    }
    for (const bid of tickResult.expiredBuffs) {
      events.push({
        type: 'system', actorId: unit.id, actorName: unit.name,
        message: `${unit.name} 的增益效果已消失`,
      })
    }
    for (const did of tickResult.expiredDebuffs) {
      events.push({
        type: 'system', actorId: unit.id, actorName: unit.name,
        message: `${unit.name} 的减益效果已消失`,
      })
    }
  }

  // 2. 行动顺序
  const actionOrder = sortActionOrder(allUnits)

  events.push({
    type: 'turnStart', actorId: 'system', actorName: '系统',
    message: `—— 第 ${round} 回合开始 ——`,
  })

  return { events, actionOrder }
}

// ---- 回合结束 ----
export function endRound(
  playerUnits: BattleUnit[],
  enemyUnits: BattleUnit[],
  playerSkills?: Skill[],
): { events: BattleEvent[] } {
  const events: BattleEvent[] = []
  const allUnits = [...playerUnits, ...enemyUnits].filter((u) => u.alive)

  // 魂力恢复 3%/回合
  for (const unit of allUnits) {
    const mpRecovery = Math.round(unit.stats.maxMp * 0.03)
    unit.stats.mp = Math.min(unit.stats.maxMp, unit.stats.mp + mpRecovery)
  }

  // 技能冷却 -1/回合
  if (playerSkills) {
    reduceCooldowns(playerSkills)
  }

  events.push({
    type: 'system', actorId: 'system', actorName: '系统',
    message: '回合结束，魂力恢复',
  })

  return { events }
}

// ---- 敌人AI ----
export function executeEnemyAI(
  enemy: BattleUnit,
  playerUnits: BattleUnit[],
  enemyUnits: BattleUnit[],
): { events: BattleEvent[]; targetId: string; action: 'attack' | 'skill' | 'defend' } {
  const events: BattleEvent[] = []
  const alivePlayers = playerUnits.filter((u) => u.alive)
  if (alivePlayers.length === 0) return { events, targetId: '', action: 'attack' }

  // 选择目标：优先血量最低
  const target = alivePlayers.sort((a, b) => a.stats.hp - b.stats.hp)[0]

  // AI决策
  const hpPercent = enemy.stats.hp / enemy.stats.maxHp

  if (hpPercent < 0.25 && enemy.stats.mp >= 15 && Math.random() < 0.4) {
    // 低血量概率防御
    return { events, targetId: target.id, action: 'defend' }
  }

  if (enemy.stats.mp >= 20 && Math.random() < 0.5) {
    // 有足够魂力时概率使用技能（简单化：用高倍率普攻模拟）
    // 简化处理，直接返回 attack 但注释为 skill
    return { events, targetId: target.id, action: 'attack' }
  }

  return { events, targetId: target.id, action: 'attack' }
}

// ---- 生成战利品 ----
export function generateBattleLoot(
  enemyUnits: BattleUnit[],
  difficultyMultiplier: number,
  hasBoss: boolean,
): LootTable {
  const levels = enemyUnits.map((u) => u.level)
  return generateLoot(levels, difficultyMultiplier, hasBoss)
}

// ---- 重置 unit_counter ----
export function resetUnitCounter(): void {
  unitCounter = 0
}
