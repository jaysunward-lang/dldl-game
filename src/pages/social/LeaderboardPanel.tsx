import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import type { Player } from '@types'
import { formatLeaderboardValue, leaderboardRows, type LeaderboardRow, type LeaderboardType } from './socialData'

const tabs: { id: LeaderboardType; label: string; desc: string }[] = [
  { id: 'power', label: '战力榜', desc: '按角色综合属性排序' },
  { id: 'level', label: '等级榜', desc: '按魂师等级排序' },
  { id: 'wealth', label: '财富榜', desc: '按金币、钻石、魂币估值排序' },
  { id: 'guild', label: '宗门榜', desc: '按宗门繁荣度排序' },
]

function getTrendIcon(trend: LeaderboardRow['trend']): string {
  if (trend === 'up') return '▲'
  if (trend === 'down') return '▼'
  return '—'
}

function calculatePlayerPower(player: Player): number {
  const stats = player.stats
  return Math.round(
    stats.maxHp * 1.2
    + stats.maxMp * 0.8
    + stats.attack * 18
    + stats.defense * 14
    + stats.speed * 12
    + stats.spirit * 10
    + player.level * 260
    + player.inventory.length * 120
  )
}

export default function LeaderboardPanel() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  const [activeTab, setActiveTab] = useState<LeaderboardType>('power')

  const rows = useMemo(() => {
    const baseRows = leaderboardRows[activeTab]
    if (!player) return baseRows

    const playerValue = activeTab === 'power'
      ? calculatePlayerPower(player)
      : activeTab === 'level'
      ? player.level
      : activeTab === 'wealth'
      ? player.gold + player.diamond * 100 + player.soulCoin * 1000
      : Math.max(1000, (player.relationShips['guild-shrek-tangmen'] ?? 0) * 100 + player.level * 500)

    const selfRow: LeaderboardRow = {
      id: 'rank-self',
      name: activeTab === 'guild' ? '史莱克唐门' : player.name,
      guildName: activeTab === 'guild' ? player.name : '史莱克唐门',
      level: activeTab === 'guild' ? 4 : player.level,
      title: player.title,
      value: playerValue,
      trend: 'up',
    }

    return [...baseRows, selfRow].sort((a, b) => b.value - a.value)
  }, [activeTab, player])

  const selfRank = rows.findIndex((row) => row.id === 'rank-self') + 1
  const activeMeta = tabs.find((tab) => tab.id === activeTab)

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('..')} className="text-hud-sm text-text-secondary hover:text-text-primary transition-colors">
          ← 返回
        </button>
        <h2 className="text-hud-lg font-bold text-text-primary">排行榜</h2>
        {selfRank > 0 && <span className="ml-auto text-hud-xs text-accent-gold">我的排名 #{selfRank}</span>}
      </div>

      <div className="flex gap-1 mb-3 p-1 bg-surface-field rounded-hud overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-hud text-hud-xs font-bold transition-all ${
              activeTab === tab.id ? 'bg-surface-elevated text-text-primary shadow-hud' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hud-card p-3 mb-3">
        <p className="text-hud-sm font-bold text-text-primary">{activeMeta?.label}</p>
        <p className="text-hud-xs text-text-secondary mt-1">{activeMeta?.desc}，当前版本使用本地角色数据与模拟榜单合并展示。</p>
      </div>

      <div className="space-y-2">
        {rows.map((row, index) => {
          const isSelf = row.id === 'rank-self'
          return (
            <div key={row.id} className={`hud-card p-3 ${isSelf ? 'border-accent-gold/50 bg-accent-gold/5' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-hud flex items-center justify-center font-mono font-bold ${
                  index === 0 ? 'bg-rarity-gold/20 text-rarity-gold' : index === 1 ? 'bg-rarity-purple/20 text-rarity-purple' : index === 2 ? 'bg-rarity-blue/20 text-rarity-blue' : 'bg-surface-field text-text-muted'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-hud-sm font-bold text-text-primary truncate">{row.name}</p>
                    {isSelf && <span className="text-hud-xs text-accent-gold">我</span>}
                    <span className="text-hud-xs text-text-muted">Lv.{row.level}</span>
                    <span className="text-hud-xs text-rarity-gold">{row.title}</span>
                  </div>
                  <p className="text-hud-xs text-text-muted mt-0.5">{activeTab === 'guild' ? `领袖：${row.guildName}` : `宗门：${row.guildName ?? '暂无'}`}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-hud-sm font-mono font-bold text-text-primary">{formatLeaderboardValue(activeTab, row.value)}</p>
                  <p className={`text-hud-xs ${row.trend === 'up' ? 'text-accent-emerald' : row.trend === 'down' ? 'text-accent-crimson' : 'text-text-disabled'}`}>
                    {getTrendIcon(row.trend)} 排名趋势
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
