import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import DlProgressBar from '@components/atoms/DlProgressBar'
import type { SpiritRealm } from '@types'

const realmThresholds: { realm: SpiritRealm; min: number; max: number }[] = [
  { realm: '凡境', min: 0, max: 200 },
  { realm: '灵境', min: 201, max: 500 },
  { realm: '意境', min: 501, max: 1000 },
  { realm: '域境', min: 1001, max: 2000 },
  { realm: '神境', min: 2001, max: 5000 },
]

const realmColorMap: Record<SpiritRealm, string> = {
  '凡境': 'text-rarity-white',
  '灵境': 'text-rarity-green',
  '意境': 'text-rarity-blue',
  '域境': 'text-rarity-purple',
  '神境': 'text-rarity-gold',
}

function StatRow({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-text-disabled/10">
      <span className="text-hud-sm text-text-secondary">{label}</span>
      <span className="text-hud-sm font-mono font-bold text-text-primary">
        {value.toLocaleString()}{suffix}
      </span>
    </div>
  )
}

export default function AttributesPanel() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  if (!player) return null

  const { stats, spiritRealm, spiritValue } = player

  // 计算精神力到下一境界的进度
  const currentRealmIdx = realmThresholds.findIndex((r) => r.realm === spiritRealm)
  const currentRealm = realmThresholds[currentRealmIdx] ?? realmThresholds[0]
  const nextRealm = realmThresholds[currentRealmIdx + 1]
  const realmProgress = nextRealm
    ? Math.min(100, ((spiritValue - currentRealm.min) / (nextRealm.min - currentRealm.min)) * 100)
    : 100

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
        <h2 className="text-hud-lg font-bold text-text-primary">属性面板</h2>
      </div>

      {/* HP / MP 大进度条 */}
      <div className="hud-card p-4 mb-4 space-y-3">
        <DlProgressBar value={stats.hp} max={stats.maxHp} color="hp" size="lg" showLabel />
        <DlProgressBar value={stats.mp} max={stats.maxMp} color="mp" size="lg" showLabel />
      </div>

      {/* 基础属性 */}
      <div className="hud-card p-4 mb-4">
        <h3 className="text-hud-sm font-bold text-text-primary mb-3">基础属性</h3>
        <div className="grid grid-cols-2 gap-x-4">
          <StatRow label="体质" value={stats.constitution} />
          <StatRow label="力量" value={stats.strength} />
          <StatRow label="敏捷" value={stats.agility} />
          <StatRow label="智力" value={stats.intelligence} />
          <StatRow label="攻击" value={stats.attack} />
          <StatRow label="防御" value={stats.defense} />
          <StatRow label="速度" value={stats.speed} />
          <StatRow label="精神" value={stats.spirit} />
        </div>
      </div>

      {/* 战斗属性 */}
      <div className="hud-card p-4 mb-4">
        <h3 className="text-hud-sm font-bold text-text-primary mb-3">战斗属性</h3>
        <div className="grid grid-cols-2 gap-x-4">
          <StatRow label="暴击率" value={stats.critRate} suffix="%" />
          <StatRow label="暴击伤害" value={stats.critDmg} suffix="%" />
          <StatRow label="命中率" value={stats.hitRate} suffix="%" />
          <StatRow label="闪避率" value={stats.dodgeRate} suffix="%" />
        </div>
      </div>

      {/* 精神力境界 */}
      <div className="hud-card p-4">
        <h3 className="text-hud-sm font-bold text-text-primary mb-3">精神力境界</h3>
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-hud-base font-bold ${realmColorMap[spiritRealm]}`}>
            {spiritRealm}
          </span>
          <span className="text-hud-xs text-text-muted">
            {spiritValue} / {nextRealm ? nextRealm.min : currentRealm.max}
          </span>
        </div>
        {/* 境界进度条 */}
        <div className="relative h-2 bg-surface-field rounded-hud-full overflow-hidden mb-3">
          <div
            className="h-full bg-accent-azure rounded-hud-full transition-all duration-500"
            style={{ width: `${realmProgress}%` }}
          />
        </div>
        {/* 境界刻度 */}
        <div className="flex justify-between">
          {realmThresholds.map((r) => (
            <div key={r.realm} className="flex flex-col items-center gap-0.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  realmThresholds.indexOf(r) <= currentRealmIdx
                    ? 'bg-accent-azure'
                    : 'bg-text-disabled'
                }`}
              />
              <span className="text-hud-xs text-text-muted">{r.realm}</span>
              <span className="text-hud-xs text-text-disabled">{r.min}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
