import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'

const tabs = [
  { id: 'all', label: '全部' },
  { id: 'consumable', label: '消耗品' },
  { id: 'material', label: '材料' },
  { id: 'soulBone', label: '魂骨' },
  { id: 'weapon', label: '暗器' },
]

export default function BackpackPanel() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  const [activeTab, setActiveTab] = useState('all')

  if (!player) return null

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
      </div>

      {/* Tab 栏 */}
      <div className="flex gap-1 mb-4 p-1 bg-surface-field rounded-hud">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 text-hud-xs font-bold rounded-hud transition-all ${
              activeTab === tab.id
                ? 'bg-surface-elevated text-text-primary shadow-hud'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab.label}
            <span className="ml-1 text-text-disabled">0</span>
          </button>
        ))}
      </div>

      {/* 物品网格 - 空状态 */}
      <div className="hud-card p-8 flex flex-col items-center justify-center min-h-[200px]">
        <span className="text-4xl mb-3 opacity-30">🎒</span>
        <p className="text-hud-sm text-text-muted mb-1">背包中暂无物品</p>
        <p className="text-hud-xs text-text-disabled text-center max-w-[200px]">
          前往魂兽森林狩猎、完成副本挑战、参与活动可获取各类物品
        </p>
      </div>

      {/* 物品获取途径 */}
      <div className="hud-card p-3 mt-4">
        <h4 className="text-hud-xs font-bold text-text-secondary mb-2">物品获取途径</h4>
        <div className="space-y-1.5">
          {[
            { label: '消耗品', desc: '副本掉落、商店购买、任务奖励', color: 'text-rarity-green' },
            { label: '材料', desc: '魂兽狩猎、分解装备、采集获得', color: 'text-rarity-blue' },
            { label: '魂骨', desc: '魂骨秘境Boss掉落、拍卖行', color: 'text-rarity-purple' },
            { label: '暗器', desc: '暗器制作、特殊任务、活动兑换', color: 'text-rarity-orange' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`text-hud-xs font-bold ${item.color} w-10`}>{item.label}</span>
              <span className="text-hud-xs text-text-muted">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
