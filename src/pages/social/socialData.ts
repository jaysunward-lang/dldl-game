import type { FriendInfo, GuildInfo, InventoryItem, TitleRank } from '@types'

export type ChatChannel = 'world' | 'guild' | 'team' | 'private'

export interface ChatMessage {
  id: string
  channel: ChatChannel
  sender: string
  title: TitleRank | '系统'
  content: string
  time: string
  online?: boolean
}

export interface GuildMember {
  id: string
  name: string
  level: number
  title: TitleRank
  position: '宗主' | '副宗主' | '长老' | '精英' | '成员'
  contribution: number
  online: boolean
}

export type MailCategory = 'system' | 'battle' | 'guild' | 'player'

export interface SocialMail {
  id: string
  category: MailCategory
  sender: string
  title: string
  content: string
  time: string
  read: boolean
  claimed: boolean
  rewards?: {
    gold?: number
    diamond?: number
    soulCoin?: number
    items?: InventoryItem[]
  }
}

export type LeaderboardType = 'power' | 'level' | 'wealth' | 'guild'

export interface LeaderboardRow {
  id: string
  name: string
  guildName?: string
  level: number
  title: TitleRank
  value: number
  trend: 'up' | 'down' | 'same'
}

export const channelMeta: Record<ChatChannel, { label: string; color: string; desc: string }> = {
  world: { label: '世界', color: 'text-rarity-gold', desc: '跨服魂师交流' },
  guild: { label: '公会', color: 'text-rarity-purple', desc: '宗门内部频道' },
  team: { label: '队伍', color: 'text-rarity-blue', desc: '副本队伍协同' },
  private: { label: '私聊', color: 'text-rarity-green', desc: '好友一对一传音' },
}

export const chatMessages: ChatMessage[] = [
  { id: 'chat-1', channel: 'world', sender: '唐门外门弟子', title: '魂尊', content: '今晚索托斗魂场有人组队吗？缺一名控制系魂师。', time: '12:05', online: true },
  { id: 'chat-2', channel: 'world', sender: '七宝琉璃宗客卿', title: '魂宗', content: '材料商店刷新了千年藤蔓，暗器升级别错过。', time: '12:08', online: true },
  { id: 'chat-3', channel: 'guild', sender: '宗门执事', title: '魂王', content: '今日宗门试炼目标：完成3次魂兽森林巡逻。', time: '12:12', online: true },
  { id: 'chat-4', channel: 'team', sender: '敏攻位·朱竹清', title: '魂尊', content: 'Boss二阶段注意分散，别站在毒雾里。', time: '12:15', online: true },
  { id: 'chat-5', channel: 'private', sender: '小舞', title: '魂尊', content: '记得领取邮件里的体力药剂，下午继续刷魂环。', time: '12:18', online: false },
  { id: 'chat-6', channel: 'guild', sender: '宗主·宁风致', title: '魂圣', content: '本周公会战报名已开启，战力前二十优先编队。', time: '12:21', online: true },
]

export const friendList: FriendInfo[] = [
  { id: 'npc-xiaowu', name: '小舞', level: 32, title: '魂尊', online: false, intimacy: 68, guildName: '史莱克学院' },
  { id: 'npc-tangsan', name: '唐三', level: 35, title: '魂尊', online: true, intimacy: 82, guildName: '唐门' },
  { id: 'npc-ningrongrong', name: '宁荣荣', level: 31, title: '魂尊', online: true, intimacy: 54, guildName: '七宝琉璃宗' },
  { id: 'npc-dai', name: '戴沐白', level: 38, title: '魂尊', online: true, intimacy: 41, guildName: '史莱克学院' },
  { id: 'npc-oscar', name: '奥斯卡', level: 30, title: '魂尊', online: false, intimacy: 36, guildName: '史莱克学院' },
]

export const guildInfo: GuildInfo = {
  id: 'guild-shrek-tangmen',
  name: '史莱克唐门',
  level: 4,
  memberCount: 37,
  maxMembers: 50,
  leaderName: '唐三',
  announcement: '每日完成宗门试炼可领取贡献奖励；魂骨拍卖请遵守宗门优先规则。',
  warehouseSlots: 80,
}

export const guildMembers: GuildMember[] = [
  { id: 'npc-tangsan', name: '唐三', level: 35, title: '魂尊', position: '宗主', contribution: 12680, online: true },
  { id: 'npc-xiaowu', name: '小舞', level: 32, title: '魂尊', position: '副宗主', contribution: 10420, online: false },
  { id: 'npc-dai', name: '戴沐白', level: 38, title: '魂尊', position: '长老', contribution: 9850, online: true },
  { id: 'npc-ningrongrong', name: '宁荣荣', level: 31, title: '魂尊', position: '精英', contribution: 7530, online: true },
  { id: 'npc-oscar', name: '奥斯卡', level: 30, title: '魂尊', position: '精英', contribution: 6900, online: false },
]

export const guildActivities = [
  { id: 'trial', name: '宗门试炼', progress: 72, reward: '贡献、金币、宗门宝箱', status: '进行中' },
  { id: 'boss', name: '宗门兽潮', progress: 35, reward: '魂币、稀有材料', status: '20:00开启' },
  { id: 'war', name: '宗门战', progress: 10, reward: '宗门排行积分', status: '报名中' },
]

export const mailSeed: SocialMail[] = [
  {
    id: 'mail-login-bonus',
    category: 'system',
    sender: '斗罗大陆运营署',
    title: '七日修炼补给',
    content: '魂师修炼贵在坚持。请收下今日补给，用于购买药剂与基础材料。',
    time: '今日 08:00',
    read: false,
    claimed: false,
    rewards: {
      gold: 800,
      diamond: 20,
      items: [{ id: 'mail-stamina-potion', name: '小瓶体力药剂', type: 'consumable', quantity: 2, quality: '普通', description: '邮件补给，可用于后续体力恢复系统' }],
    },
  },
  {
    id: 'mail-battle-report',
    category: 'battle',
    sender: '斗魂场裁判席',
    title: '斗魂结算报告',
    content: '你在上一场斗魂中表现稳定，获得了观众喝彩与基础出场费。',
    time: '昨日 21:40',
    read: true,
    claimed: false,
    rewards: { gold: 500, soulCoin: 2 },
  },
  {
    id: 'mail-guild-gift',
    category: 'guild',
    sender: '史莱克唐门',
    title: '宗门活跃礼包',
    content: '本周宗门活跃度已达标，所有成员均可领取一份宗门礼包。',
    time: '昨日 19:30',
    read: false,
    claimed: false,
    rewards: {
      gold: 1200,
      items: [{ id: 'guild-iron-ore', name: '精炼铁矿', type: 'material', quantity: 5, quality: '精良', description: '可用于暗器与装备打造' }],
    },
  },
  {
    id: 'mail-friend-note',
    category: 'player',
    sender: '小舞',
    title: '下午一起狩猎吗？',
    content: '听说魂兽森林外围出现了风狼群，正好可以练练配合。',
    time: '昨日 16:12',
    read: true,
    claimed: true,
  },
]

export const leaderboardRows: Record<LeaderboardType, LeaderboardRow[]> = {
  power: [
    { id: 'rank-tangsan', name: '唐三', guildName: '唐门', level: 35, title: '魂尊', value: 48200, trend: 'up' },
    { id: 'rank-dai', name: '戴沐白', guildName: '史莱克学院', level: 38, title: '魂尊', value: 46150, trend: 'same' },
    { id: 'rank-xiaowu', name: '小舞', guildName: '史莱克学院', level: 32, title: '魂尊', value: 43880, trend: 'down' },
    { id: 'rank-zhuhuoqing', name: '朱竹清', guildName: '史莱克学院', level: 31, title: '魂尊', value: 42110, trend: 'up' },
  ],
  level: [
    { id: 'rank-dai-level', name: '戴沐白', guildName: '史莱克学院', level: 38, title: '魂尊', value: 38, trend: 'same' },
    { id: 'rank-tangsan-level', name: '唐三', guildName: '唐门', level: 35, title: '魂尊', value: 35, trend: 'up' },
    { id: 'rank-xiaowu-level', name: '小舞', guildName: '史莱克学院', level: 32, title: '魂尊', value: 32, trend: 'same' },
    { id: 'rank-rongrong-level', name: '宁荣荣', guildName: '七宝琉璃宗', level: 31, title: '魂尊', value: 31, trend: 'up' },
  ],
  wealth: [
    { id: 'rank-rongrong-wealth', name: '宁荣荣', guildName: '七宝琉璃宗', level: 31, title: '魂尊', value: 189000, trend: 'same' },
    { id: 'rank-auctioneer', name: '索托拍卖师', guildName: '索托城商会', level: 42, title: '魂宗', value: 152300, trend: 'up' },
    { id: 'rank-tangsan-wealth', name: '唐三', guildName: '唐门', level: 35, title: '魂尊', value: 98600, trend: 'up' },
    { id: 'rank-oscar-wealth', name: '奥斯卡', guildName: '史莱克学院', level: 30, title: '魂尊', value: 62100, trend: 'down' },
  ],
  guild: [
    { id: 'rank-guild-qibao', name: '七宝琉璃宗', guildName: '宁风致', level: 7, title: '魂圣', value: 368000, trend: 'same' },
    { id: 'rank-guild-haotian', name: '昊天宗', guildName: '唐啸', level: 6, title: '魂斗罗', value: 322000, trend: 'up' },
    { id: 'rank-guild-shrek', name: '史莱克唐门', guildName: '唐三', level: 4, title: '魂尊', value: 219000, trend: 'up' },
    { id: 'rank-guild-suotuo', name: '索托城商会', guildName: '拍卖总管', level: 5, title: '魂王', value: 176500, trend: 'down' },
  ],
}

export const mailCategoryMeta: Record<MailCategory, { label: string; color: string }> = {
  system: { label: '系统', color: 'text-rarity-gold' },
  battle: { label: '战报', color: 'text-rarity-red' },
  guild: { label: '宗门', color: 'text-rarity-purple' },
  player: { label: '玩家', color: 'text-rarity-blue' },
}

export function cloneRewardItem(item: InventoryItem): InventoryItem {
  return {
    ...item,
    id: `${item.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  }
}

export function formatLeaderboardValue(type: LeaderboardType, value: number): string {
  if (type === 'level') return `Lv.${value}`
  if (type === 'guild') return `${value.toLocaleString()} 繁荣度`
  if (type === 'wealth') return `${value.toLocaleString()} 财富`
  return `${value.toLocaleString()} 战力`
}
