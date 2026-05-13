import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import type { WuhunQuality, WuhunType } from '@types'

const qualityOrder: WuhunQuality[] = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

const qualityLabelMap: Record<WuhunQuality, string> = {
  'T0': '废武魂', 'T1': '低级', 'T2': '中级', 'T3': '高级',
  'T4': '顶级', 'T5': '超级', 'T6': '神品', 'T7': '超神品',
}

const qualityColorMap: Record<WuhunQuality, string> = {
  'T0': 'text-rarity-white bg-rarity-white/10 border-rarity-white/30',
  'T1': 'text-rarity-green bg-rarity-green/10 border-rarity-green/30',
  'T2': 'text-rarity-blue bg-rarity-blue/10 border-rarity-blue/30',
  'T3': 'text-rarity-purple bg-rarity-purple/10 border-rarity-purple/30',
  'T4': 'text-rarity-orange bg-rarity-orange/10 border-rarity-orange/30',
  'T5': 'text-rarity-red bg-rarity-red/10 border-rarity-red/30',
  'T6': 'text-rarity-gold bg-rarity-gold/10 border-rarity-gold/30',
  'T7': 'text-rarity-gold bg-rarity-gold/20 border-rarity-gold/50',
}

const typeLabelMap: Record<WuhunType, string> = {
  '强攻': '🔴 强攻系', '敏攻': '🟢 敏攻系', '控制': '🔵 控制系',
  '防御': '🟡 防御系', '辅助': '🟣 辅助系', '精神': '💠 精神系', '食物': '🟤 食物系',
}

const ringQualityColors: Record<string, { bg: string; text: string }> = {
  '白色': { bg: 'bg-rarity-white', text: 'text-rarity-white' },
  '黄色': { bg: 'bg-yellow-400', text: 'text-yellow-400' },
  '紫色': { bg: 'bg-rarity-purple', text: 'text-rarity-purple' },
  '黑色': { bg: 'bg-gray-900', text: 'text-gray-400' },
  '红色': { bg: 'bg-rarity-red', text: 'text-rarity-red' },
  '金色': { bg: 'bg-rarity-gold', text: 'text-rarity-gold' },
}

export default function WuhunDetail() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  if (!player) return null

  const { wuhun } = player
  const qualityIdx = qualityOrder.indexOf(wuhun.quality)
  const ringCount = wuhun.soulRings.length

  // 魂环品质分布统计
  const ringQualityCount: Record<string, number> = {}
  wuhun.soulRings.forEach((r) => {
    ringQualityCount[r.quality] = (ringQualityCount[r.quality] || 0) + 1
  })

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
        <h2 className="text-hud-lg font-bold text-text-primary">武魂详情</h2>
      </div>

      {/* 武魂名称 + 品质 Badge */}
      <div className="hud-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-hud-xl font-bold text-text-primary">{wuhun.name}</p>
            <p className="text-hud-sm text-text-secondary mt-0.5">{typeLabelMap[wuhun.type]}</p>
          </div>
          <span
            className={`text-hud-sm font-bold px-3 py-1 rounded-hud border ${qualityColorMap[wuhun.quality]}`}
          >
            {wuhun.quality} · {qualityLabelMap[wuhun.quality]}
          </span>
        </div>

        {/* 品质系数 */}
        <div className="flex items-center gap-2 p-3 bg-surface-field rounded-hud">
          <span className="text-hud-xs text-text-secondary">品质系数</span>
          <span className="text-hud-base font-mono font-bold text-accent-gold">
            ×{wuhun.qualityMultiplier.toFixed(1)}
          </span>
          <span className="text-hud-xs text-text-muted ml-auto">
            属性成长 {(wuhun.qualityMultiplier * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* 品质等阶刻度条 */}
      <div className="hud-card p-4 mb-4">
        <h3 className="text-hud-sm font-bold text-text-primary mb-3">品质等阶</h3>
        <div className="flex items-center gap-0.5">
          {qualityOrder.map((q, i) => {
            const isActive = i <= qualityIdx
            const isCurrent = i === qualityIdx
            return (
              <div key={q} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full h-2 rounded-hud-full ${
                    isCurrent
                      ? 'bg-accent-gold shadow-hud-gold'
                      : isActive
                      ? 'bg-accent-gold/40'
                      : 'bg-surface-field'
                  }`}
                />
                <span
                  className={`text-hud-xs ${
                    isCurrent ? 'text-accent-gold font-bold' : isActive ? 'text-text-muted' : 'text-text-disabled'
                  }`}
                >
                  {q}
                </span>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-hud-xs text-text-disabled">废武魂 ×0.5</span>
          <span className="text-hud-xs text-text-disabled">超神品 ×4.0</span>
        </div>
      </div>

      {/* 魂环统计 */}
      <div className="hud-card p-4 mb-4">
        <h3 className="text-hud-sm font-bold text-text-primary mb-3">
          魂环统计 · {ringCount}/9
        </h3>
        {ringCount > 0 ? (
          <div>
            <div className="flex items-center gap-1 mb-2">
              {wuhun.soulRings.map((ring) => (
                <div
                  key={ring.slot}
                  className="w-5 h-5 rounded-full border-2 border-text-disabled/30"
                  style={{ backgroundColor: ringQualityColors[ring.quality]?.bg ?? '#666' }}
                  title={`第${ring.slot}魂环: ${ring.skillName} (${ring.years}年 ${ring.quality})`}
                />
              ))}
              {Array.from({ length: 9 - ringCount }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-5 h-5 rounded-full border-2 border-dashed border-text-disabled/20 bg-transparent"
                />
              ))}
            </div>
            {/* 品质分布 */}
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(ringQualityCount).map(([quality, count]) => (
                <span
                  key={quality}
                  className={`text-hud-xs px-2 py-0.5 rounded-hud bg-surface-field ${ringQualityColors[quality]?.text ?? 'text-text-muted'}`}
                >
                  {quality} ×{count}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-hud-sm text-text-muted">
            尚未获取魂环，前往魂兽森林狩猎可获取魂环
          </p>
        )}
      </div>

      {/* 进化阶段 */}
      <div className="hud-card p-4">
        <h3 className="text-hud-sm font-bold text-text-primary mb-3">武魂进化</h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-field flex items-center justify-center">
            <span className="text-hud-lg font-bold text-accent-gold">{wuhun.evolutionStage}</span>
          </div>
          <div>
            <p className="text-hud-sm text-text-primary font-bold">
              武魂进化 · 第{wuhun.evolutionStage}阶
            </p>
            <p className="text-hud-xs text-text-muted">
              {wuhun.evolutionStage === 0
                ? '武魂尚未进化，完成特殊任务可触发进化'
                : `已进化${wuhun.evolutionStage}次，属性获得额外加成`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
