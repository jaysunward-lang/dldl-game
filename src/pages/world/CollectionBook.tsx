import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import { collectionEntries } from './worldData'

type CollectionTab = 'all' | 'region' | 'soulBeast' | 'wuhun' | 'artifact'

const tabs: { id: CollectionTab; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'region', label: '地区' },
  { id: 'soulBeast', label: '魂兽' },
  { id: 'wuhun', label: '武魂' },
  { id: 'artifact', label: '器物' },
]

const categoryLabel: Record<Exclude<CollectionTab, 'all'>, string> = {
  region: '地区',
  soulBeast: '魂兽',
  wuhun: '武魂',
  artifact: '器物',
}

export default function CollectionBook() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  const [activeTab, setActiveTab] = useState<CollectionTab>('all')

  const playerLevel = player?.level ?? 0
  const inventory = player?.inventory ?? []
  const unlockedKeys = new Set<string>(['region-shenghun'])
  if (playerLevel >= 5) unlockedKeys.add('region-nuoding')
  if (player?.wuhun?.name) unlockedKeys.add('wuhun-blue-silver')
  if (inventory.some((item) => item.type === 'weapon')) unlockedKeys.add('artifact-hidden-weapon')
  if (inventory.some((item) => item.name.includes('魂兽') || item.name.includes('利齿'))) unlockedKeys.add('beast-wind-wolf')
  if (playerLevel >= 10) unlockedKeys.add('beast-mandrake')

  const filteredEntries = collectionEntries.filter((entry) => activeTab === 'all' || entry.category === activeTab)

  const unlockedCount = collectionEntries.filter((entry) => unlockedKeys.has(entry.id)).length

  return (
    <div className="p-4 animate-fade-in">
      <button onClick={() => navigate('/world')} className="text-hud-sm text-text-secondary hover:text-text-primary transition-colors mb-4">
        ← 返回世界
      </button>

      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-hud-xl font-bold text-text-primary">斗罗图鉴</h2>
          <p className="text-hud-xs text-text-muted mt-1">收录地区、魂兽、武魂与特殊器物</p>
        </div>
        <div className="text-right">
          <p className="text-hud-lg font-bold text-accent-gold">{unlockedCount}/{collectionEntries.length}</p>
          <p className="text-hud-xs text-text-muted">已解锁</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-hud text-hud-xs whitespace-nowrap border transition-all ${
              activeTab === tab.id
                ? 'bg-accent-gold/15 border-accent-gold text-accent-gold'
                : 'bg-surface-field border-text-disabled/20 text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredEntries.map((entry) => {
          const unlocked = unlockedKeys.has(entry.id)
          return (
            <div key={entry.id} className={`hud-card p-3 ${unlocked ? '' : 'opacity-55'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-hud flex items-center justify-center text-2xl ${unlocked ? 'bg-accent-gold/10' : 'bg-surface-field grayscale'}`}>
                  {unlocked ? entry.icon : '❔'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-hud-base font-bold text-text-primary">{unlocked ? entry.name : '未知条目'}</p>
                    <span className="text-hud-xs text-text-muted">{categoryLabel[entry.category]}</span>
                  </div>
                  <p className="text-hud-sm text-text-secondary mt-1 leading-relaxed">
                    {unlocked ? entry.desc : '尚未在冒险中发现该条目。'}
                  </p>
                  <p className="text-hud-xs text-text-muted mt-2">解锁方式：{entry.unlockedBy}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
