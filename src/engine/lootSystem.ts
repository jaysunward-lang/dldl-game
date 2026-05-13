// ============================================================
// 斗罗大陆 · 战利品掉落系统
// 魂环掉落 + 魂骨掉落(常规+外附) + 金币/经验 + 特殊掉落
// ============================================================
import type { RewardItem } from '@types'
import { rand, randInt } from './combatFormulas'

// ---- 掉落品质 ----
export type LootQuality = '白色' | '黄色' | '紫色' | '黑色' | '红色' | '金色' | '传说' | '史诗'

// ---- 战利品项 ----
export interface LootItem {
  id: string
  name: string
  type: 'gold' | 'exp' | 'soulRing' | 'soulBone' | 'externalBone' | 'material' | 'weapon' | 'consumable'
  quantity: number
  quality?: LootQuality
  icon?: string
  description?: string
}

export interface LootTable {
  totalExp: number
  totalGold: number
  items: LootItem[]
  summary: string
}

// ---- 魂兽掉落基础数据 ----
interface SoulBeastDropConfig {
  levelRange: [number, number]
  label: string
  goldBase: number
  expBase: number
  soulRingDropRate: number // 基础掉率
  soulBoneDropRate: number // 魂骨掉率
  externalBoneDropRate: number // 外附魂骨掉率
  soulRingQualities: [LootQuality, number][] // [品质, 权重]
  soulBoneQualities: [LootQuality, number][]
  materialDrop: { name: string; rate: number; quantity: [number, number] }[]
}

const BEAST_DROP_TABLE: SoulBeastDropConfig[] = [
  {
    levelRange: [1, 9],
    label: '十年魂兽',
    goldBase: 5,
    expBase: 30,
    soulRingDropRate: 0.60,
    soulBoneDropRate: 0.005, // 0.5%
    externalBoneDropRate: 0,
    soulRingQualities: [['白色', 100], ['黄色', 5]],
    soulBoneQualities: [['白色', 100]],
    materialDrop: [
      { name: '破碎的兽骨', rate: 0.4, quantity: [1, 2] },
      { name: '低级草药', rate: 0.5, quantity: [1, 3] },
    ],
  },
  {
    levelRange: [10, 29],
    label: '百年魂兽',
    goldBase: 25,
    expBase: 100,
    soulRingDropRate: 0.65,
    soulBoneDropRate: 0.02, // 2%
    externalBoneDropRate: 0,
    soulRingQualities: [['黄色', 60], ['紫色', 30], ['白色', 10]],
    soulBoneQualities: [['黄色', 70], ['白色', 30]],
    materialDrop: [
      { name: '兽骨', rate: 0.35, quantity: [1, 3] },
      { name: '凝神草', rate: 0.4, quantity: [1, 2] },
      { name: '魂兽精血', rate: 0.15, quantity: [1, 1] },
    ],
  },
  {
    levelRange: [30, 49],
    label: '千年魂兽',
    goldBase: 80,
    expBase: 350,
    soulRingDropRate: 0.70,
    soulBoneDropRate: 0.05, // 5%
    externalBoneDropRate: 0.005, // 0.5%
    soulRingQualities: [['紫色', 50], ['黄色', 35], ['黑色', 15]],
    soulBoneQualities: [['紫色', 50], ['黄色', 40], ['黑色', 10]],
    materialDrop: [
      { name: '千年兽骨', rate: 0.3, quantity: [1, 2] },
      { name: '魂兽精血', rate: 0.25, quantity: [1, 2] },
      { name: '凝神丹（小）', rate: 0.15, quantity: [1, 1] },
    ],
  },
  {
    levelRange: [50, 69],
    label: '万年魂兽',
    goldBase: 250,
    expBase: 1200,
    soulRingDropRate: 0.75,
    soulBoneDropRate: 0.10, // 10%
    externalBoneDropRate: 0.01, // 1%
    soulRingQualities: [['黑色', 50], ['紫色', 35], ['红色', 15]],
    soulBoneQualities: [['黑色', 40], ['紫色', 40], ['红色', 20]],
    materialDrop: [
      { name: '万年兽骨', rate: 0.25, quantity: [1, 2] },
      { name: '凝神丹（中）', rate: 0.2, quantity: [1, 1] },
      { name: '魂骨精华', rate: 0.1, quantity: [1, 3] },
    ],
  },
  {
    levelRange: [70, 89],
    label: '五万年魂兽',
    goldBase: 800,
    expBase: 4000,
    soulRingDropRate: 0.80,
    soulBoneDropRate: 0.18, // 18%
    externalBoneDropRate: 0.03, // 3%
    soulRingQualities: [['黑色', 40], ['红色', 40], ['金色', 20]],
    soulBoneQualities: [['红色', 40], ['黑色', 40], ['金色', 20]],
    materialDrop: [
      { name: '万年兽骨', rate: 0.3, quantity: [2, 4] },
      { name: '凝神丹（大）', rate: 0.25, quantity: [1, 1] },
      { name: '魂骨精华', rate: 0.2, quantity: [2, 5] },
      { name: '暗器材料', rate: 0.1, quantity: [1, 2] },
    ],
  },
  {
    levelRange: [90, 100],
    label: '十万年魂兽',
    goldBase: 3000,
    expBase: 15000,
    soulRingDropRate: 0.90,
    soulBoneDropRate: 0.25, // 25%
    externalBoneDropRate: 0.07, // 7%
    soulRingQualities: [['红色', 50], ['金色', 30], ['黑色', 20]],
    soulBoneQualities: [['红色', 50], ['金色', 30], ['黑色', 20]],
    materialDrop: [
      { name: '十万年兽骨', rate: 0.3, quantity: [1, 2] },
      { name: '凝神丹（极品）', rate: 0.25, quantity: [1, 1] },
      { name: '魂骨精华', rate: 0.3, quantity: [3, 8] },
      { name: '神赐魂环碎片', rate: 0.1, quantity: [1, 3] },
    ],
  },
]

// ---- 获取等级对应的魂兽配置 ----
function getBeastConfig(avgEnemyLevel: number): SoulBeastDropConfig {
  for (const config of BEAST_DROP_TABLE) {
    if (avgEnemyLevel >= config.levelRange[0] && avgEnemyLevel <= config.levelRange[1]) {
      return config
    }
  }
  // fallback
  return BEAST_DROP_TABLE[0]
}

// ---- 品质加权随机 ----
function randomQuality(qualities: [LootQuality, number][]): LootQuality {
  const total = qualities.reduce((s, [, w]) => s + w, 0)
  let r = Math.random() * total
  for (const [q, w] of qualities) {
    r -= w
    if (r <= 0) return q
  }
  return qualities[qualities.length - 1][0]
}

// ---- 主掉落计算 ----
export function generateLoot(
  enemyLevels: number[],
  difficultyMultiplier: number,
  isBoss: boolean,
): LootTable {
  const avgLevel = enemyLevels.reduce((a, b) => a + b, 0) / enemyLevels.length
  const config = getBeastConfig(avgLevel)

  const items: LootItem[] = []

  // 1. 金币
  const goldBase = config.goldBase * enemyLevels.length
  const gold = Math.round(goldBase * difficultyMultiplier * rand(0.9, 1.1))
  items.push({
    id: 'gold',
    name: '金币',
    type: 'gold',
    quantity: gold,
    icon: '🪙',
  })

  // 2. 经验
  const expBase = config.expBase * enemyLevels.length
  const exp = Math.round(expBase * difficultyMultiplier)
  items.push({
    id: 'exp',
    name: '经验值',
    type: 'exp',
    quantity: exp,
    icon: '✨',
  })

  // 3. 魂环掉落 (每只独立判定)
  for (const level of enemyLevels) {
    const dropRate = config.soulRingDropRate * difficultyMultiplier * (isBoss ? 1.5 : 1.0)
    if (Math.random() < dropRate) {
      const quality = randomQuality(config.soulRingQualities)
      const years = Math.round(level * rand(8, 12) * (isBoss ? 2 : 1))
      items.push({
        id: `soulRing_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: `${years}年魂环`,
        type: 'soulRing',
        quantity: 1,
        quality,
        icon: '💫',
        description: `从${config.label}身上掉落的${years}年${quality}品质魂环`,
      })
    }
  }

  // 4. 魂骨掉落
  const boneRate = config.soulBoneDropRate * difficultyMultiplier * (isBoss ? 2.0 : 1.0)
  if (Math.random() < boneRate) {
    const quality = randomQuality(config.soulBoneQualities)
    const parts = ['头骨', '胸骨', '左臂骨', '右臂骨', '左腿骨', '右腿骨']
    const part = parts[Math.floor(Math.random() * parts.length)]
    items.push({
      id: `soulBone_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: `${quality}${part}`,
      type: 'soulBone',
      quantity: 1,
      quality,
      icon: '🦴',
      description: `从${config.label}身上掉落的${quality}品质魂骨·${part}`,
    })
  }

  // 5. 外附魂骨掉落
  if (config.externalBoneDropRate > 0) {
    const extRate = config.externalBoneDropRate * difficultyMultiplier * (isBoss ? 2.0 : 1.0)
    if (Math.random() < extRate) {
      const isLegend = Math.random() < 0.3
      const quality: LootQuality = isLegend ? '传说' : '史诗'
      const forms = ['蛛矛型', '翼型', '尾型', '角型']
      const form = forms[Math.floor(Math.random() * forms.length)]
      items.push({
        id: `extBone_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: `外附魂骨·${form}`,
        type: 'externalBone',
        quantity: 1,
        quality,
        icon: '💎',
        description: `极为稀有的${quality}品质外附魂骨(${form})`,
      })
    }
  }

  // 6. 材料掉落
  for (const mat of config.materialDrop) {
    if (Math.random() < mat.rate) {
      const qty = randInt(mat.quantity[0], mat.quantity[1])
      items.push({
        id: `mat_${mat.name}_${Date.now()}_${Math.random().toString(36).slice(2, 4)}`,
        name: mat.name,
        type: 'material',
        quantity: qty,
        icon: '📦',
      })
    }
  }

  // 生成摘要
  const itemSummary = items
    .filter((i) => i.type !== 'gold' && i.type !== 'exp')
    .map((i) => `${i.name}×${i.quantity}`)
    .join('、')

  return {
    totalExp: exp,
    totalGold: gold,
    items,
    summary: itemSummary || '无额外掉落',
  }
}
