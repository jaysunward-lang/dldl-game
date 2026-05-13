import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import type { InventoryItemType } from '@types'

const tabs: { id: InventoryItemType | 'all'; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'consumable', label: '消耗品' },
  { id: 'material', label: '材料' },
  { id: 'soulRing', label: '魂环' },
  { id: 'soulBone', label: '魂骨' },
  { id: 'externalBone', label: '外附魂骨' },
  { id: 'weapon', label: '暗器' },
]

const typeIconMap: Record<string, string> = {
  soulRing: '💫',
  soulBone: '🦴',
  externalBone: '💎',
  material: '📦',
  weapon: '🗡️',
  consumable: '🧪',
}

const typeLabelMap: Record<string, string> = {
  soulRing: '魂环',
  soulBone: '魂骨',
  externalBone: '外附魂骨',
  material: '材料',
  weapon: '暗器',
  consumable: '消耗品',
}

const qualityColorMap: Record<string, string> = {
  '白色': 'text-rarity-white',
  '黄色': 'text-yellow-400',
  '紫色': 'text-rarity-purple',
  '黑色': 'text-gray-400',
  '红色': 'text-rarity-red',
  '金色': 'text-rarity-gold',
  '传说': 'text-rarity-gold',
  '史诗': 'text-rarity-orange',
}

export default function BackpackPanel() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  const [activeTab, setActiveTab] = useState<InventoryItemType | 'all'>('all')

  if (!player) return null

  const inventory = player.inventory ?? []

  // 按 Tab 过滤
  const filteredItems =
    activeTab === 'all'
      ? inventory
      : inventory.filter((item) => item.type === activeTab)

  // Tab 计数 (memoized: only recompute when inventory changes)
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 }
    for (const item of inventory) {
      counts.all += item.quantity
      counts[item.type] = (counts[item.type] || 0) + item.quantity
    }
    return counts
  }, [inventory])

  return (
    <div className="p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('..')}
          className="text-hud-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          ← 返回
        </button>
        <h2 className="text-hud-lg font-bold text-text-primary">背包</h2>
        <span className="text-hud-sm text-text-muted font-mono ml-auto">
          {tabCounts.all === 0 ? '空' : `${tabCounts.all}件`}
        </span>
      </div>

      {/* Tab 栏 */}
      <div className="flex gap-1 mb-4 p-1 bg-surface-field rounded-hud overflow-x-auto">
        {tabs.map((tab) => {
          const count = tabCounts[tab.id] || 0
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 py-1.5 px-2.5 text-hud-xs font-bold rounded-hud transition-all ${
                activeTab === tab.id
                  ? 'bg-surface-elevated text-text-primary shadow-hud'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
              <span className={`ml-1 ${count > 0 ? 'text-accent-gold' : 'text-text-disabled'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* 物品列表 / 空状态 */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="hud-card p-3 flex flex-col gap-1.5 hover:border-accent-gold/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.icon || typeIconMap[item.type] || '📦'}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-hud-sm font-bold truncate ${
                      item.quality && qualityColorMap[item.quality]
                        ? qualityColorMap[item.quality]
                        : 'text-text-primary'
                    }`}
                  >
                    {item.name}
                  </p>
                  {item.quality && (
                    <p className="text-hud-xs text-text-muted">{item.quality}品质</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-hud-xs text-text-disabled">
                  {typeLabelMap[item.type] || item.type}
                </span>
                <span className="text-hud-sm font-mono text-text-primary font-bold">
                  ×{item.quantity}
                </span>
              </div>
              {item.description && (
                <p className="text-hud-xs text-text-muted leading-tight line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="hud-card p-8 flex flex-col items-center justify-center min-h-[200px]">
          <span className="text-4xl mb-3 opacity-30">🎒</span>
          <p className="text-hud-sm text-text-muted mb-1">
            {inventory.length === 0
              ? '背包中暂无物品'
              : '当前分类没有物品'}
          </p>
          <p className="text-hud-xs text-text-disabled text-center max-w-[200px]">
            {inventory.length === 0
              ? '前往魂兽森林狩猎、完成副本挑战、参与活动可获取各类物品'
              : '尝试切换到其他分类查看'}
          </p>
        </div>
      )}

      {/* 物品获取途径（仅空背包时显示） */}
      {inventory.length === 0 && (
        <div className="hud-card p-3 mt-4">
          <h4 className="text-hud-xs font-bold text-text-secondary mb-2">物品获取途径</h4>
          <div className="space-y-1.5">
            {[
              { label: '消耗品', desc: '副本掉落、商店购买、任务奖励', color: 'text-rarity-green' },
              { label: '材料', desc: '魂兽狩猎、分解装备、采集获得', color: 'text-rarity-blue' },
              { label: '魂环', desc: '魂兽森林狩猎掉落', color: 'text-rarity-purple' },
              { label: '魂骨', desc: '魂骨秘境Boss掉落、拍卖行', color: 'text-rarity-red' },
              { label: '暗器', desc: '暗器制作、特殊任务、活动兑换', color: 'text-rarity-orange' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`text-hud-xs font-bold ${item.color} w-10`}>{item.label}</span>
                <span className="text-hud-xs text-text-muted">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
