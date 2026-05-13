// ============================================================
// 斗罗大陆 · 魂技模板库
// 六类型(ATK/CTL/SUP/BST/FLD/ULT) + 按武魂类型分支
// ============================================================
import type { Skill, WuhunType } from '@types'

// ---- 基础魂技模板 ----
const baseSkills: Skill[] = [
  // ===== 等级解锁 =====
  {
    id: 'lvl1_awaken',
    name: '武魂觉醒',
    type: 'ATK',
    target: 'single',
    level: 1,
    maxLevel: 10,
    mpCost: 5,
    cooldown: 0,
    currentCooldown: 0,
    damageMultiplier: 1.2,
    description: '觉醒武魂后的基础攻击，对单体目标造成120%攻击力伤害',
    effects: [
      { type: 'damage', value: 1.2 },
    ],
  },
  {
    id: 'lvl10_soul_condense',
    name: '魂力凝聚',
    type: 'SUP',
    target: 'self',
    level: 1,
    maxLevel: 10,
    mpCost: 15,
    cooldown: 3,
    currentCooldown: 0,
    damageMultiplier: 0,
    description: '凝聚魂力，恢复自身15%最大HP，并获得攻击力+20%持续2回合',
    effects: [
      { type: 'heal', value: 0.15 },
      { type: 'buff', value: 20, duration: 2, stat: 'attack' },
    ],
  },
  {
    id: 'lvl20_soul_possess',
    name: '武魂附体',
    type: 'BST',
    target: 'self',
    level: 1,
    maxLevel: 10,
    mpCost: 30,
    cooldown: 6,
    currentCooldown: 0,
    damageMultiplier: 0,
    description: '武魂附体，全属性提升15%持续3回合，下次攻击伤害×2.0',
    effects: [
      { type: 'buff', value: 15, duration: 3, stat: 'attack' },
      { type: 'buff', value: 15, duration: 3, stat: 'defense' },
      { type: 'buff', value: 15, duration: 3, stat: 'speed' },
    ],
  },
  {
    id: 'lvl40_soul_burst',
    name: '魂力爆发',
    type: 'BST',
    target: 'single',
    level: 1,
    maxLevel: 10,
    mpCost: 45,
    cooldown: 7,
    currentCooldown: 0,
    damageMultiplier: 3.0,
    description: '将魂力凝聚于一点爆发，对单体造成300%攻击力伤害，自身防御-20%持续2回合',
    effects: [
      { type: 'damage', value: 3.0 },
      { type: 'debuff', value: 20, duration: 2, stat: 'defense' },
    ],
  },

  // ===== 第一魂环魂技（按武魂类型） =====
  {
    id: 'ring1_attack',
    name: '重击',
    type: 'ATK',
    target: 'single',
    level: 1,
    maxLevel: 10,
    mpCost: 10,
    cooldown: 2,
    currentCooldown: 0,
    damageMultiplier: 1.8,
    description: '第一魂技·力量型：凝聚魂力重击单体敌人，造成180%攻击力伤害',
    effects: [
      { type: 'damage', value: 1.8 },
    ],
  },
  {
    id: 'ring1_speed',
    name: '疾风突刺',
    type: 'ATK',
    target: 'single',
    level: 1,
    maxLevel: 10,
    mpCost: 8,
    cooldown: 1,
    currentCooldown: 0,
    damageMultiplier: 1.5,
    description: '第一魂技·敏捷型：以极快速度突刺，造成150%攻击力伤害，速度+10%持续2回合',
    effects: [
      { type: 'damage', value: 1.5 },
      { type: 'buff', value: 10, duration: 2, stat: 'speed' },
    ],
  },
  {
    id: 'ring1_control',
    name: '缠绕',
    type: 'CTL',
    target: 'single',
    level: 1,
    maxLevel: 10,
    mpCost: 12,
    cooldown: 3,
    currentCooldown: 0,
    damageMultiplier: 0.8,
    description: '第一魂技·控制型：束缚单体敌人，造成80%攻击力伤害并附加减速2回合',
    effects: [
      { type: 'damage', value: 0.8 },
      { type: 'debuff', value: 30, duration: 2, stat: 'speed' },
    ],
  },
  {
    id: 'ring1_defense',
    name: '铁壁',
    type: 'SUP',
    target: 'self',
    level: 1,
    maxLevel: 10,
    mpCost: 10,
    cooldown: 4,
    currentCooldown: 0,
    damageMultiplier: 0,
    description: '第一魂技·防御型：提升自身防御力40%持续3回合，获得HP×10%护盾',
    effects: [
      { type: 'buff', value: 40, duration: 3, stat: 'defense' },
      { type: 'shield', value: 0.1 },
    ],
  },

  // ===== 第二魂环魂技 =====
  {
    id: 'ring2_aoe',
    name: '横扫千军',
    type: 'BST',
    target: 'all',
    level: 1,
    maxLevel: 10,
    mpCost: 25,
    cooldown: 5,
    currentCooldown: 0,
    damageMultiplier: 1.2,
    description: '第二魂技：对全体敌人造成120%攻击力伤害',
    effects: [
      { type: 'damage', value: 1.2 },
    ],
  },
  {
    id: 'ring2_poison',
    name: '毒刺',
    type: 'ATK',
    target: 'single',
    level: 1,
    maxLevel: 10,
    mpCost: 14,
    cooldown: 3,
    currentCooldown: 0,
    damageMultiplier: 1.4,
    description: '第二魂技·毒素：刺击单体，造成140%攻击力伤害并附加中毒(每回合8%攻击力，持续3回合)',
    effects: [
      { type: 'damage', value: 1.4 },
      { type: 'dot', value: 0.08, duration: 3 },
    ],
  },

  // ===== 精神类魂技 =====
  {
    id: 'spirit_shock',
    name: '精神冲击',
    type: 'ATK',
    target: 'single',
    level: 1,
    maxLevel: 10,
    mpCost: 20,
    cooldown: 2,
    currentCooldown: 0,
    damageMultiplier: 1.0,
    description: '精神冲击：以精神力冲击目标，造成精神力×100%精神伤害，30%概率附加眩晕1回合',
    effects: [
      { type: 'damage', value: 1.0 },
      { type: 'debuff', value: 100, duration: 1, stat: 'speed', chance: 30 },
    ],
  },
  {
    id: 'spirit_shield',
    name: '精神护盾',
    type: 'SUP',
    target: 'self',
    level: 1,
    maxLevel: 10,
    mpCost: 25,
    cooldown: 4,
    currentCooldown: 0,
    damageMultiplier: 0,
    description: '精神护盾：以精神力×120%生成护盾，吸收精神伤害，持续3回合',
    effects: [
      { type: 'shield', value: 1.2 },
    ],
  },
]

// ---- 按武魂类型获取初始魂技 ----
export function getSkillsByWuhunType(type: WuhunType): Skill[] {
  const skillMap: Record<WuhunType, string[]> = {
    '强攻': ['lvl1_awaken', 'ring1_attack', 'ring2_aoe', 'lvl10_soul_condense', 'lvl20_soul_possess', 'lvl40_soul_burst'],
    '敏攻': ['lvl1_awaken', 'ring1_speed', 'ring2_aoe', 'lvl10_soul_condense', 'lvl20_soul_possess', 'lvl40_soul_burst'],
    '控制': ['lvl1_awaken', 'ring1_control', 'ring2_poison', 'lvl10_soul_condense', 'lvl20_soul_possess', 'lvl40_soul_burst'],
    '防御': ['lvl1_awaken', 'ring1_defense', 'ring2_aoe', 'lvl10_soul_condense', 'lvl20_soul_possess', 'lvl40_soul_burst'],
    '辅助': ['lvl1_awaken', 'ring1_control', 'lvl10_soul_condense', 'lvl20_soul_possess', 'lvl40_soul_burst', 'spirit_shield'],
    '精神': ['lvl1_awaken', 'spirit_shock', 'spirit_shield', 'lvl10_soul_condense', 'lvl20_soul_possess', 'lvl40_soul_burst'],
    '食物': ['lvl1_awaken', 'lvl10_soul_condense', 'ring1_defense', 'lvl20_soul_possess', 'lvl40_soul_burst', 'spirit_shield'],
  }

  const ids = skillMap[type] || skillMap['强攻']
  return ids
    .map((id) => baseSkills.find((s) => s.id === id))
    .filter(Boolean)
    .map((s) => ({ ...s!, currentCooldown: 0 }))
}

// ---- 获取全部基础魂技(深拷贝) ----
export function getAllBaseSkills(): Skill[] {
  return baseSkills.map((s) => ({ ...s, currentCooldown: 0 }))
}

// ---- 通过ID获取魂技 ----
export function getSkillById(id: string): Skill | undefined {
  const found = baseSkills.find((s) => s.id === id)
  return found ? { ...found, currentCooldown: 0 } : undefined
}

// ---- 创建敌人技能 ----
export function createEnemySkill(
  name: string,
  type: Skill['type'],
  damageMultiplier: number,
  mpCost: number,
  cooldown: number,
  effects: Skill['effects'] = [],
): Skill {
  return {
    id: `enemy_${name}_${Date.now()}`,
    name,
    type,
    target: 'single',
    level: 1,
    maxLevel: 10,
    mpCost,
    cooldown,
    currentCooldown: 0,
    damageMultiplier,
    description: `${name}：对目标造成${Math.round(damageMultiplier * 100)}%伤害`,
    effects: effects.length > 0
      ? effects
      : [{ type: 'damage', value: damageMultiplier }],
  }
}

// ---- 技能冷却管理 ----
export function reduceCooldowns(skills: Skill[]): void {
  skills.forEach((s) => {
    if (s.currentCooldown > 0) s.currentCooldown -= 1
  })
}

export function setSkillOnCooldown(skill: Skill): void {
  skill.currentCooldown = skill.cooldown
}

export function getAvailableSkills(skills: Skill[], currentMp: number): Skill[] {
  return skills.filter(
    (s) => s.currentCooldown <= 0 && s.mpCost <= currentMp,
  )
}
