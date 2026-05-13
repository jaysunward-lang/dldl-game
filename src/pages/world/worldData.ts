import type { InventoryItem, Quest } from '@types'

export interface WorldRegion {
  id: string
  name: string
  icon: string
  chapter: number
  minLevel: number
  theme: string
  desc: string
  danger: string
  rewardTags: string[]
  npcs: string[]
}

export interface AchievementInfo {
  id: string
  name: string
  desc: string
  icon: string
  reward: string
  condition: string
}

export interface CollectionEntry {
  id: string
  name: string
  category: 'region' | 'soulBeast' | 'wuhun' | 'artifact'
  icon: string
  desc: string
  unlockedBy: string
}

export const worldRegions: WorldRegion[] = [
  {
    id: 'shenghun',
    name: '圣魂村',
    icon: '🌾',
    chapter: 1,
    minLevel: 1,
    theme: '新手村 · 武魂觉醒',
    desc: '杰克村长守护的小村落，也是魂师旅程开始的地方。',
    danger: '低',
    rewardTags: ['蓝银草种子', '初级药草', '村民声望'],
    npcs: ['老杰克', '素云涛', '铁匠铺老板'],
  },
  {
    id: 'nuoding',
    name: '诺丁城',
    icon: '🏫',
    chapter: 1,
    minLevel: 5,
    theme: '初级魂师学院',
    desc: '初级魂师学院所在城市，可接触基础魂师训练和学院任务。',
    danger: '低',
    rewardTags: ['学院徽章', '魂力教材', '金币'],
    npcs: ['大师', '学院导师', '门房'],
  },
  {
    id: 'shrek',
    name: '史莱克学院',
    icon: '🦉',
    chapter: 2,
    minLevel: 10,
    theme: '怪物学院',
    desc: '只收怪物不收普通人的学院，高强度训练能快速提升战斗经验。',
    danger: '中',
    rewardTags: ['训练积分', '魂环线索', '稀有材料'],
    npcs: ['弗兰德', '赵无极', '宁荣荣'],
  },
  {
    id: 'suotuo',
    name: '索托城',
    icon: '🏟️',
    chapter: 3,
    minLevel: 20,
    theme: '大斗魂场',
    desc: '斗魂场与商会聚集之地，适合挑战连胜和获取斗魂徽章。',
    danger: '中',
    rewardTags: ['斗魂徽章', '魂币', '装备图纸'],
    npcs: ['斗魂场主持', '商会执事', '戴沐白'],
  },
  {
    id: 'tiandou',
    name: '天斗城',
    icon: '🏛️',
    chapter: 4,
    minLevel: 30,
    theme: '帝国首都',
    desc: '天斗帝国核心城市，贵族、学院与拍卖势力交错。',
    danger: '中高',
    rewardTags: ['贵族声望', '钻石', '高阶材料'],
    npcs: ['雪清河', '独孤博', '拍卖行主管'],
  },
  {
    id: 'wuhun',
    name: '武魂城',
    icon: '⛪',
    chapter: 5,
    minLevel: 40,
    theme: '武魂殿核心',
    desc: '武魂殿势力中枢，任务收益丰厚但阵营风险更高。',
    danger: '高',
    rewardTags: ['武魂殿功勋', '红色魂环线索', '魂骨碎片'],
    npcs: ['比比东', '胡列娜', '圣殿骑士'],
  },
  {
    id: 'shalu',
    name: '杀戮之都',
    icon: '🩸',
    chapter: 6,
    minLevel: 51,
    theme: '杀神试炼',
    desc: '无法依赖常规魂技的残酷试炼场，适合突破极限。',
    danger: '极高',
    rewardTags: ['杀气', '领域感悟', '稀有魂骨'],
    npcs: ['杀戮之王', '黑纱少女', '堕落魂师'],
  },
  {
    id: 'haishen',
    name: '海神岛',
    icon: '🌊',
    chapter: 7,
    minLevel: 65,
    theme: '海神九考',
    desc: '海神传承之地，可进行神考并获取神级成长资源。',
    danger: '神考',
    rewardTags: ['神考进度', '海神亲和', '金色材料'],
    npcs: ['波塞西', '海马斗罗', '海魂师'],
  },
  {
    id: 'jialing',
    name: '嘉陵关',
    icon: '⚔️',
    chapter: 8,
    minLevel: 81,
    theme: '终局战场',
    desc: '大陆战争最终防线，主线与阵营决战将在此展开。',
    danger: '终局',
    rewardTags: ['神位线索', '终局称号', '百万年材料'],
    npcs: ['唐三', '千仞雪', '前线统帅'],
  },
]

export const questSeed: Quest[] = [
  {
    id: 'main-awakening',
    name: '武魂觉醒',
    type: 'main',
    status: 'available',
    chapter: 1,
    recommendedLevel: 1,
    prerequisites: [],
    description: '前往圣魂村武魂殿分殿，完成属于你的第一次武魂觉醒。',
    objectives: [
      { id: 'talk-su-yuntao', description: '与素云涛对话', type: 'talk', target: '素云涛', required: 1, current: 0 },
      { id: 'awaken-wuhun', description: '完成武魂觉醒仪式', type: 'explore', target: '觉醒法阵', required: 1, current: 0 },
    ],
    rewards: {
      exp: 120,
      gold: 80,
      items: [{ id: 'herb-basic', name: '初级疗伤草', quantity: 2, quality: '普通' }],
      unlockFeature: '诺丁城线索',
    },
  },
  {
    id: 'side-blue-silver',
    name: '蓝银草采集',
    type: 'side',
    status: 'available',
    chapter: 1,
    recommendedLevel: 2,
    prerequisites: [],
    description: '帮助老杰克在村外采集蓝银草，用于制作基础魂力药剂。',
    objectives: [
      { id: 'collect-blue-silver', description: '采集蓝银草', type: 'collect', target: '蓝银草', required: 5, current: 0 },
    ],
    rewards: {
      exp: 80,
      gold: 120,
      items: [{ id: 'blue-silver-seed', name: '蓝银草种子', quantity: 3, quality: '普通' }],
    },
  },
  {
    id: 'daily-forest-patrol',
    name: '村外巡逻',
    type: 'daily',
    status: 'available',
    chapter: 1,
    recommendedLevel: 3,
    prerequisites: [],
    description: '巡逻圣魂村外的林地，驱散靠近农田的低阶魂兽。',
    objectives: [
      { id: 'kill-wolves', description: '击退低阶魂兽', type: 'kill', target: '低阶魂兽', required: 3, current: 0 },
    ],
    rewards: {
      exp: 100,
      gold: 150,
      items: [{ id: 'beast-tooth', name: '魂兽利齿', quantity: 2, quality: '白色' }],
    },
  },
  {
    id: 'main-shrek-entry',
    name: '怪物学院入学考',
    type: 'main',
    status: 'locked',
    chapter: 2,
    recommendedLevel: 10,
    prerequisites: ['main-awakening'],
    description: '前往史莱克学院，接受只属于怪物的入学考验。',
    objectives: [
      { id: 'reach-shrek', description: '抵达史莱克学院', type: 'reach', target: '史莱克学院', required: 1, current: 0 },
      { id: 'pass-zhaowuji', description: '通过赵无极的实战测试', type: 'kill', target: '赵无极试炼', required: 1, current: 0 },
    ],
    rewards: {
      exp: 600,
      gold: 600,
      items: [{ id: 'training-token', name: '史莱克训练令', quantity: 1, quality: '紫色' }],
      unlockFeature: '史莱克训练',
      achievement: 'shrek-newbie',
    },
  },
  {
    id: 'side-suotuo-arena',
    name: '索托斗魂首胜',
    type: 'side',
    status: 'locked',
    chapter: 3,
    recommendedLevel: 20,
    prerequisites: ['main-shrek-entry'],
    description: '在索托大斗魂场拿下一场胜利，证明你的实战能力。',
    objectives: [
      { id: 'win-arena', description: '获得斗魂胜利', type: 'kill', target: '斗魂对手', required: 1, current: 0 },
    ],
    rewards: {
      exp: 1200,
      gold: 1000,
      items: [{ id: 'arena-badge', name: '铜斗魂徽章', quantity: 1, quality: '黄色' }],
      achievement: 'arena-first-win',
    },
  },
]

export const achievements: AchievementInfo[] = [
  { id: 'first-awakening', name: '魂师起点', icon: '✨', desc: '创建角色并完成武魂觉醒主线。', reward: '钻石 ×20', condition: '完成「武魂觉醒」' },
  { id: 'first-battle-win', name: '初战告捷', icon: '⚔️', desc: '赢得任意一场副本战斗。', reward: '金币 ×300', condition: '完成一场战斗胜利' },
  { id: 'collector-novice', name: '初级收藏家', icon: '📖', desc: '背包中累计拥有 10 件物品。', reward: '魂币 ×1', condition: '背包物品总数达到 10' },
  { id: 'shrek-newbie', name: '怪物新生', icon: '🦉', desc: '通过史莱克学院入学考。', reward: '称号「史莱克新生」', condition: '完成「怪物学院入学考」' },
  { id: 'arena-first-win', name: '斗魂首胜', icon: '🏟️', desc: '在索托大斗魂场取得第一场胜利。', reward: '钻石 ×50', condition: '完成「索托斗魂首胜」' },
]

export const collectionEntries: CollectionEntry[] = [
  { id: 'region-shenghun', name: '圣魂村', category: 'region', icon: '🌾', desc: '旅程开始的小村落。', unlockedBy: '默认解锁' },
  { id: 'region-nuoding', name: '诺丁城', category: 'region', icon: '🏫', desc: '初级魂师学院所在城市。', unlockedBy: '角色达到 Lv.5' },
  { id: 'beast-wind-wolf', name: '疾风狼', category: 'soulBeast', icon: '🐺', desc: '常见敏攻型魂兽，适合初期练手。', unlockedBy: '魂兽森林战斗' },
  { id: 'beast-mandrake', name: '曼陀罗蛇', category: 'soulBeast', icon: '🐍', desc: '带毒魂兽，掉落控制系魂环线索。', unlockedBy: '魂兽森林战斗' },
  { id: 'wuhun-blue-silver', name: '蓝银草', category: 'wuhun', icon: '🌿', desc: '弱小却拥有无限可能的植物系武魂。', unlockedBy: '武魂觉醒' },
  { id: 'artifact-hidden-weapon', name: '袖箭', category: 'artifact', icon: '🏹', desc: '基础暗器，可用于远程突袭。', unlockedBy: '交易或任务奖励' },
]

export function rewardItemToInventory(item: NonNullable<Quest['rewards']['items']>[number]): InventoryItem {
  const soulBoneLike = item.name.includes('魂骨')
  const soulRingLike = item.name.includes('魂环')
  const weaponLike = item.name.includes('暗器') || item.name.includes('袖箭')

  return {
    id: item.id,
    name: item.name,
    type: soulBoneLike ? 'soulBone' : soulRingLike ? 'soulRing' : weaponLike ? 'weapon' : 'material',
    quantity: item.quantity,
    quality: item.quality,
    description: '任务奖励',
  }
}
