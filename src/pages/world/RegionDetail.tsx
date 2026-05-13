import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import DlButton from '@components/atoms/DlButton'
import { worldRegions } from './worldData'

const regionActions = [
  { id: 'explore', label: '区域探索', icon: '🧭', desc: '推进探索进度，发现任务线索与材料点。' },
  { id: 'npc', label: '拜访NPC', icon: '🤝', desc: '提升角色羁绊，解锁后续剧情与商店。' },
  { id: 'gather', label: '资源采集', icon: '⛏️', desc: '采集药草、矿石和魂兽痕迹材料。' },
]

export default function RegionDetail() {
  const navigate = useNavigate()
  const { regionId } = useParams<{ regionId: string }>()
  const player = usePlayerStore((s) => s.player)
  const addItem = usePlayerStore((s) => s.addItem)
  const updateRelationShip = usePlayerStore((s) => s.updateRelationShip)
  const setActionWindows = usePlayerStore((s) => s.setActionWindows)
  const [toast, setToast] = useState<string | null>(null)

  const region = worldRegions.find((r) => r.id === regionId) ?? worldRegions[0]
  const unlocked = (player?.level ?? 0) >= region.minLevel
  const remainingActions = Math.max(0, (player?.actionWindows.total ?? 0) - (player?.actionWindows.used ?? 0))

  const consumeAction = () => {
    if (!player) return false
    if (player.actionWindows.used >= player.actionWindows.total) {
      setToast('今日行动次数不足，请先完成阶段推进或等待刷新')
      return false
    }
    setActionWindows(player.actionWindows.used + 1, player.actionWindows.total)
    return true
  }

  const handleAction = (actionId: string) => {
    if (!player || !unlocked || !consumeAction()) return

    if (actionId === 'npc') {
      const npc = region.npcs[0]
      updateRelationShip(npc, 5)
      setToast(`拜访${npc}成功，羁绊 +5`)
      return
    }

    if (actionId === 'gather') {
      const itemName = region.rewardTags[0] ?? '区域材料'
      addItem({
        id: `world_${region.id}_${actionId}`,
        name: itemName,
        type: 'material',
        quantity: 1,
        quality: region.chapter >= 5 ? '紫色' : region.chapter >= 3 ? '黄色' : '普通',
        description: `${region.name}探索产物`,
      })
      setToast(`采集成功：${itemName} ×1 已放入背包`)
      return
    }

    setToast(`${region.name}探索完成，发现新的剧情线索`)
  }

  return (
    <div className="p-4 animate-fade-in">
      <button onClick={() => navigate('/world')} className="text-hud-sm text-text-secondary hover:text-text-primary transition-colors mb-4">
        ← 返回大陆地图
      </button>

      <div className="hud-card-gold p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-4xl">{region.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-hud-xl font-bold text-text-primary">{region.name}</h2>
              <span className="text-hud-xs px-2 py-0.5 rounded-hud bg-surface-field text-accent-gold border border-accent-gold/30">
                第{region.chapter}章
              </span>
              {!unlocked && <span className="text-hud-xs text-accent-crimson">Lv.{region.minLevel}解锁</span>}
            </div>
            <p className="text-hud-sm text-accent-gold mt-1">{region.theme}</p>
            <p className="text-hud-sm text-text-secondary mt-2 leading-relaxed">{region.desc}</p>
          </div>
        </div>
      </div>

      {toast && (
        <div className="mb-3 p-2 rounded-hud bg-accent-emerald/10 border border-accent-emerald/30 text-hud-sm text-accent-emerald">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="hud-card p-3 text-center">
          <p className="text-hud-xs text-text-muted">危险度</p>
          <p className="text-hud-sm font-bold text-accent-crimson mt-1">{region.danger}</p>
        </div>
        <div className="hud-card p-3 text-center">
          <p className="text-hud-xs text-text-muted">行动次数</p>
          <p className="text-hud-sm font-bold text-accent-gold mt-1">{remainingActions}</p>
        </div>
        <div className="hud-card p-3 text-center">
          <p className="text-hud-xs text-text-muted">推荐等级</p>
          <p className="text-hud-sm font-bold text-text-primary mt-1">Lv.{region.minLevel}</p>
        </div>
      </div>

      <div className="hud-card p-3 mb-4">
        <p className="text-hud-sm font-bold text-text-primary mb-2">地区人物</p>
        <div className="flex flex-wrap gap-2">
          {region.npcs.map((npc) => (
            <span key={npc} className="px-2 py-1 rounded-hud bg-surface-field text-hud-xs text-text-secondary">
              {npc} · 羁绊 {player?.relationShips[npc] ?? 0}
            </span>
          ))}
        </div>
      </div>

      <div className="hud-card p-3 mb-4">
        <p className="text-hud-sm font-bold text-text-primary mb-2">可能收益</p>
        <div className="flex flex-wrap gap-2">
          {region.rewardTags.map((tag) => (
            <span key={tag} className="px-2 py-1 rounded-hud bg-accent-gold/10 border border-accent-gold/20 text-hud-xs text-accent-gold">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {regionActions.map((action) => (
          <button
            key={action.id}
            disabled={!unlocked || remainingActions <= 0}
            onClick={() => handleAction(action.id)}
            className="w-full p-3 rounded-hud border bg-surface-elevated border-text-disabled/20 hover:border-accent-gold/30 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{action.icon}</span>
              <div>
                <p className="text-hud-sm font-bold text-text-primary">{action.label}</p>
                <p className="text-hud-xs text-text-muted mt-0.5">{action.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <DlButton variant="skill" className="w-full mt-4" onClick={() => navigate('/world/quests')}>
        查看相关任务
      </DlButton>
    </div>
  )
}
