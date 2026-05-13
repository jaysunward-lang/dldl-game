import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'

const weaponCategories = [
  {
    id: 'manual',
    name: '手法类',
    icon: '🤲',
    desc: '以手法投掷的暗器',
    examples: '佛怒唐莲、暴雨梨花针',
    qualityRange: '凡品→神品',
    unlockNote: '完成暗器任务解锁',
  },
  {
    id: 'mechanism',
    name: '机括类',
    icon: '⚙️',
    desc: '机关驱动的暗器',
    examples: '诸葛神弩、袖箭',
    qualityRange: '凡品→神品',
    unlockNote: '完成暗器任务解锁',
  },
  {
    id: 'ranged',
    name: '远程类',
    icon: '🏹',
    desc: '远程抛射的暗器',
    examples: '追魂夺命胆、含沙射影',
    qualityRange: '凡品→神品',
    unlockNote: '完成暗器任务解锁',
  },
  {
    id: 'melee',
    name: '近战类',
    icon: '🗡️',
    desc: '近身战斗的暗器',
    examples: '龙须针、孔雀翎',
    qualityRange: '凡品→神品',
    unlockNote: '完成暗器任务解锁',
  },
]

const qualityTiers = [
  { label: '凡品', color: 'text-rarity-white' },
  { label: '良品', color: 'text-rarity-green' },
  { label: '上品', color: 'text-rarity-blue' },
  { label: '极品', color: 'text-rarity-purple' },
  { label: '绝品', color: 'text-rarity-orange' },
  { label: '神品', color: 'text-rarity-gold' },
]

export default function HiddenWeaponsPanel() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
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
        <h2 className="text-hud-lg font-bold text-text-primary">暗器系统</h2>
      </div>

      {/* 解锁提示 */}
      <div className="hud-card-gold p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-hud-sm">💡</span>
          <div>
            <p className="text-hud-sm text-text-primary font-bold">暗器系统</p>
            <p className="text-hud-xs text-text-secondary mt-0.5">
              暗器是独立于武魂的战斗手段，可在战斗中与魂技搭配使用。
              暗器六品级：凡品→良品→上品→极品→绝品→神品。
            </p>
          </div>
        </div>
      </div>

      {/* 4类型装备槽 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {weaponCategories.map((cat) => (
          <div key={cat.id} className="hud-card p-3 flex flex-col items-center gap-1.5 opacity-50 hover:opacity-70 transition-opacity">
            <span className="text-2xl">{cat.icon}</span>
            <p className="text-hud-sm font-bold text-text-muted">{cat.name}</p>
            <p className="text-hud-xs text-text-disabled text-center">{cat.desc}</p>
            <p className="text-hud-xs text-text-muted mt-0.5">{cat.examples}</p>
            <span className="text-hud-xs px-2 py-0.5 rounded-hud bg-surface-field text-text-disabled mt-1">
              未装备
            </span>
          </div>
        ))}
      </div>

      {/* 品质品级说明 */}
      <div className="hud-card p-3">
        <h4 className="text-hud-xs font-bold text-text-secondary mb-2">暗器品级</h4>
        <div className="flex flex-wrap gap-1.5">
          {qualityTiers.map((q) => (
            <span
              key={q.label}
              className={`text-hud-xs px-2 py-0.5 rounded-hud bg-surface-field ${q.color}`}
            >
              {q.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
