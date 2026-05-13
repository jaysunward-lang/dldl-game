import type { InventoryItem, InventoryItemType } from '@types'

export type CurrencyType = 'gold' | 'diamond' | 'soulCoin'
export type TradeCategory = InventoryItemType | 'all' | 'myBids' | 'myListings' | 'records'

export interface TradeListing {
  id: string
  sellerName?: string
  item: InventoryItem
  price: number
  currency: CurrencyType
  stock?: number
  limitPerDay?: number
  remainingTime?: string
  desc?: string
  tags?: string[]
}

export const currencyMeta: Record<CurrencyType, { label: string; icon: string; color: string }> = {
  gold: { label: '金币', icon: '🪙', color: 'text-rarity-gold' },
  diamond: { label: '钻石', icon: '💎', color: 'text-rarity-blue' },
  soulCoin: { label: '魂币', icon: '💠', color: 'text-rarity-purple' },
}

export const typeLabelMap: Record<InventoryItemType, string> = {
  soulRing: '魂环',
  soulBone: '魂骨',
  externalBone: '外附魂骨',
  material: '材料',
  weapon: '暗器',
  consumable: '消耗品',
}

export const typeIconMap: Record<InventoryItemType, string> = {
  soulRing: '💫',
  soulBone: '🦴',
  externalBone: '💎',
  material: '📦',
  weapon: '🗡️',
  consumable: '🧪',
}

export const qualityColorMap: Record<string, string> = {
  '白色': 'text-rarity-white',
  '黄色': 'text-yellow-400',
  '紫色': 'text-rarity-purple',
  '黑色': 'text-gray-400',
  '红色': 'text-rarity-red',
  '金色': 'text-rarity-gold',
  '传说': 'text-rarity-gold',
  '史诗': 'text-rarity-orange',
  '稀有': 'text-rarity-green',
  '精良': 'text-rarity-blue',
  '极品': 'text-rarity-purple',
}

export const categoryTabs: { id: TradeCategory; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'soulRing', label: '魂环' },
  { id: 'soulBone', label: '魂骨' },
  { id: 'material', label: '材料' },
  { id: 'weapon', label: '暗器' },
]

export const auctionListings: TradeListing[] = [
  {
    id: 'auc_ring_001',
    sellerName: '天斗商会',
    item: {
      id: 'trade_ring_1200_purple',
      name: '1,200年魂环',
      type: 'soulRing',
      quantity: 1,
      quality: '紫色',
      icon: '💫',
      description: '适合第二魂环阶段的紫色魂环，带有较强魂力波动。',
    },
    price: 120,
    currency: 'soulCoin',
    remainingTime: '2小时18分',
    desc: '一口价成交，系统托管交割。',
  },
  {
    id: 'auc_bone_001',
    sellerName: '七宝拍卖行',
    item: {
      id: 'trade_bone_purple_left_arm',
      name: '紫色左臂魂骨',
      type: 'soulBone',
      quantity: 1,
      quality: '紫色',
      icon: '🦴',
      description: '千年级左臂魂骨，偏向力量与攻击加成。',
    },
    price: 880,
    currency: 'soulCoin',
    remainingTime: '11小时42分',
    desc: '卖方承担5%交易税，买方支付一口价。',
  },
  {
    id: 'auc_mat_001',
    sellerName: '星斗商人',
    item: {
      id: 'trade_mat_soul_bone_essence',
      name: '魂骨精华',
      type: 'material',
      quantity: 5,
      quality: '紫色',
      icon: '📦',
      description: '魂骨升星与突破所需材料。',
    },
    price: 65,
    currency: 'soulCoin',
    remainingTime: '35分',
  },
  {
    id: 'auc_weapon_001',
    sellerName: '唐门外堂',
    item: {
      id: 'trade_weapon_zhuge_crossbow',
      name: '诸葛神弩',
      type: 'weapon',
      quantity: 1,
      quality: '极品',
      icon: '🗡️',
      description: '机括类极品暗器，适合前中期战斗补伤害。',
    },
    price: 240,
    currency: 'soulCoin',
    remainingTime: '5小时05分',
  },
]

export const stallListings: TradeListing[] = [
  {
    id: 'stall_mat_001',
    sellerName: '圣魂村摊主',
    item: {
      id: 'stall_low_herb',
      name: '低级草药',
      type: 'material',
      quantity: 3,
      quality: '白色',
      icon: '📦',
      description: '炼制基础恢复药剂的常见草药。',
    },
    price: 120,
    currency: 'gold',
    stock: 6,
    desc: '圣魂村集市常见材料。',
  },
  {
    id: 'stall_consumable_001',
    sellerName: '诺丁药铺',
    item: {
      id: 'stall_hp_potion_small',
      name: '小型生命药剂',
      type: 'consumable',
      quantity: 2,
      quality: '白色',
      icon: '🧪',
      description: '战斗外使用可恢复少量生命值。',
    },
    price: 180,
    currency: 'gold',
    stock: 4,
  },
  {
    id: 'stall_mat_002',
    sellerName: '铁匠铺学徒',
    item: {
      id: 'stall_cold_iron',
      name: '寒铁碎片',
      type: 'material',
      quantity: 2,
      quality: '稀有',
      icon: '📦',
      description: '制作暗器的基础金属材料。',
    },
    price: 360,
    currency: 'gold',
    stock: 3,
  },
]

export const shopListings: Record<string, TradeListing[]> = {
  npc: [
    {
      id: 'shop_npc_hp_small',
      item: {
        id: 'shop_hp_potion_small',
        name: '小型生命药剂',
        type: 'consumable',
        quantity: 1,
        quality: '白色',
        icon: '🧪',
        description: '基础回复道具。',
      },
      price: 80,
      currency: 'gold',
      limitPerDay: 20,
    },
    {
      id: 'shop_npc_mp_small',
      item: {
        id: 'shop_mp_potion_small',
        name: '小型魂力药剂',
        type: 'consumable',
        quantity: 1,
        quality: '白色',
        icon: '🧪',
        description: '战斗外回复少量魂力。',
      },
      price: 100,
      currency: 'gold',
      limitPerDay: 20,
    },
  ],
  diamond: [
    {
      id: 'shop_diamond_unbind',
      item: {
        id: 'diamond_unbind_charm',
        name: '魂骨解绑符',
        type: 'consumable',
        quantity: 1,
        quality: '紫色',
        icon: '🧪',
        description: '用于交易前解绑千年及以上魂骨。',
      },
      price: 50,
      currency: 'diamond',
      limitPerDay: 5,
    },
    {
      id: 'shop_diamond_sweep',
      item: {
        id: 'diamond_sweep_ticket',
        name: '副本扫荡券',
        type: 'consumable',
        quantity: 3,
        quality: '稀有',
        icon: '🧪',
        description: '用于快速结算已通关副本。',
      },
      price: 30,
      currency: 'diamond',
      limitPerDay: 10,
    },
  ],
  soulCoin: [
    {
      id: 'shop_coin_incense',
      item: {
        id: 'coin_meditation_incense',
        name: '凝神香',
        type: 'consumable',
        quantity: 1,
        quality: '紫色',
        icon: '🧪',
        description: '冥想收益提升道具。',
      },
      price: 30,
      currency: 'soulCoin',
      limitPerDay: 10,
    },
    {
      id: 'shop_coin_weapon_box',
      item: {
        id: 'coin_hidden_weapon_box',
        name: '暗器材料箱',
        type: 'material',
        quantity: 1,
        quality: '紫色',
        icon: '📦',
        description: '随机获得暗器制作材料。',
      },
      price: 80,
      currency: 'soulCoin',
      limitPerDay: 5,
    },
  ],
  material: [
    {
      id: 'shop_mat_beast_bone',
      item: {
        id: 'shop_beast_bone',
        name: '兽骨',
        type: 'material',
        quantity: 5,
        quality: '白色',
        icon: '📦',
        description: '常见强化与制作材料。',
      },
      price: 500,
      currency: 'gold',
      limitPerDay: 10,
    },
    {
      id: 'shop_mat_soul_blood',
      item: {
        id: 'shop_soul_beast_blood',
        name: '魂兽精血',
        type: 'material',
        quantity: 1,
        quality: '稀有',
        icon: '📦',
        description: '魂技升级与魂骨突破材料。',
      },
      price: 1200,
      currency: 'gold',
      limitPerDay: 5,
    },
  ],
}

export const soulBoneListings: TradeListing[] = [
  {
    id: 'bone_exchange_head_purple',
    sellerName: '魂骨交易所',
    item: {
      id: 'exchange_bone_head_purple',
      name: '紫色头部魂骨',
      type: 'soulBone',
      quantity: 1,
      quality: '紫色',
      icon: '🦴',
      description: '精神力倾向头部魂骨，仅千年及以上可交易。',
    },
    price: 980,
    currency: 'soulCoin',
    remainingTime: '23小时',
    tags: ['头部', '千年'],
  },
  {
    id: 'bone_exchange_chest_black',
    sellerName: '魂骨交易所',
    item: {
      id: 'exchange_bone_chest_black',
      name: '黑色胸部魂骨',
      type: 'soulBone',
      quantity: 1,
      quality: '黑色',
      icon: '🦴',
      description: '万年级躯干魂骨，生命与防御倾向。',
    },
    price: 3200,
    currency: 'soulCoin',
    remainingTime: '41小时',
    tags: ['胸部', '万年'],
  },
  {
    id: 'bone_exchange_left_leg_yellow',
    sellerName: '魂骨交易所',
    item: {
      id: 'exchange_bone_leg_yellow',
      name: '黄色左腿魂骨',
      type: 'soulBone',
      quantity: 1,
      quality: '黄色',
      icon: '🦴',
      description: '百年级左腿魂骨，速度倾向。',
    },
    price: 360,
    currency: 'soulCoin',
    remainingTime: '8小时',
    tags: ['左腿', '百年'],
  },
]

export function formatPrice(listing: TradeListing): string {
  const meta = currencyMeta[listing.currency]
  return `${meta.icon} ${listing.price.toLocaleString()}`
}

export function cloneTradeItem(item: InventoryItem): InventoryItem {
  return {
    ...item,
    id: `${item.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  }
}
