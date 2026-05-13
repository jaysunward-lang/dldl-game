import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import type { SoulRingQuality } from '@types'

const ringQualityStyle: Record<SoulRingQuality, { border: string; textColor: string; bgColor: string }> = {
  '白色': { border: '#B0B0B0', textColor: '#B0B0B0', bgColor: 'rgba(176,176,176,0.2)' },
  '黄色': { border: '#F1C40F', textColor: '#F1C40F', bgColor: 'rgba(241,196,15,0.2)' },
  '紫色': { border: '#8E44AD', textColor: '#8E44AD', bgColor: 'rgba(142,68,173,0.2)' },
  '黑色': { border: '#2C3E50', textColor: '#9BA3B5', bgColor: 'rgba(44,62,80,0.3)' },
  '红色': { border: '#E74C3C', textColor: '#E74C3C', bgColor: 'rgba(231,76,60,0.2)' },
  '金色': { border: '#D4A853', textColor: '#D4A853', bgColor: 'rgba(212,168,83,0.2)' },
}

// 魂环槽位等级要求
const ringSlotRequirements = [
  { slot: 1, level: 0, years: '300-500', desc: '初始魂环' },
  { slot: 2, level: 10, years: '500-800', desc: '第一瓶颈突破后' },
  { slot: 3, level: 20, years: '1,000-1,500', desc: '第二瓶颈突破后' },
  { slot: 4, level: 30, years: '2,000-5,000', desc: '第三瓶颈突破后' },
  { slot: 5, level: 40, years: '5,000-8,000', desc: '第四瓶颈突破后' },
  { slot: 6, level: 50, years: '10,000-20,000', desc: '第五瓶颈突破后' },
  { slot: 7, level: 60, years: '20,000-50,000', desc: '第六瓶颈突破后' },
  { slot: 8, level: 70, years: '50,000-80,000', desc: '第七瓶颈突破后' },
  { slot: 9, level: 80, years: '80,000-100,000', desc: '第八瓶颈突破后' },
]

export default function SoulRingsPanel() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  if (!player) return null

  const { wuhun, level } = player
  const rings = wuhun.soulRings
  const ringMap = new Map(rings.map((r) => [r.slot, r]))

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
        <h2 className="text-hud-lg font-bold text-text-primary">魂环管理</h2>
        <span className="text-hud-sm text-accent-gold font-mono ml-auto">
          已获取 {rings.length}/9
        </span>
      </div>

      {/* 整体进度条 */}
      <div className="hud-card p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-hud-xs text-text-secondary">魂环收集进度</span>
          <div className="flex-1 h-1.5 bg-surface-field rounded-hud-full overflow-hidden">
            <div
              className="h-full bg-accent-gold rounded-hud-full transition-all duration-500"
              style={{ width: `${(rings.length / 9) * 100}%` }}
            />
          </div>
          <span className="text-hud-xs font-mono text-text-muted">{rings.length}/9</span>
        </div>
      </div>

      {/* 9魂环槽位 */}
      <div className="space-y-2">
        {ringSlotRequirements.map((req) => {
          const ring = ringMap.get(req.slot)
          const isUnlocked = level >= req.level
          const style = ring ? ringQualityStyle[ring.quality] : null

          if (ring && style) {
            // 已获取魂环
            return (
              <div
                key={req.slot}
                className="hud-card p-3 border-l-4 animate-slide-up"
                style={{ borderLeftColor: style.border }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-hud-sm font-bold text-surface-base"
                    style={{ backgroundColor: style.border }}
                  >
                    {req.slot}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-hud-sm font-bold text-text-primary truncate">
                      {ring.skillName}
                    </p>
                    <p className="text-hud-xs text-text-muted">
                      {ring.years.toLocaleString()}年 · {ring.quality}品质
                    </p>
                  </div>
                  <span
                    className="text-hud-xs font-bold px-2 py-0.5 rounded-hud"
                    style={{ color: style.textColor, backgroundColor: style.bgColor }}
                  >
                    {ring.quality}
                  </span>
                </div>
              </div>
            )
          }

          // 空槽位
          return (
            <div
              key={req.slot}
              className={`hud-card p-3 border-l-4 animate-slide-up ${
                isUnlocked ? 'border-text-disabled/20 opacity-50' : 'opacity-30'
              }`}
              style={{ borderLeftColor: isUnlocked ? '#3D4455' : '#232738' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-field flex items-center justify-center text-hud-sm font-bold text-text-muted">
                  {req.slot}
                </div>
                <div className="flex-1">
                  <p className="text-hud-sm text-text-muted">
                    {isUnlocked ? '未获取' : '未解锁'}
                  </p>
                  <p className="text-hud-xs text-text-disabled">
                    {isUnlocked
                      ? `${req.years}年魂环 · ${req.desc}`
                      : `Lv.${req.level} 解锁 · ${req.desc}`}
                  </p>
                </div>
                <span className="text-hud-xs text-text-disabled">
                  {isUnlocked ? '可获取' : `Lv.${req.level}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
