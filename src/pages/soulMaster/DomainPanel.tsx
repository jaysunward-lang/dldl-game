import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'

const domainStages = [
  {
    name: '初悟',
    level: 60,
    desc: '初窥领域门槛，领域范围5米',
    effect: '领域内全属性+5%，敌人属性-3%',
    color: 'bg-rarity-white',
  },
  {
    name: '掌控',
    level: 70,
    desc: '熟练掌握领域之力，领域范围15米',
    effect: '领域内全属性+10%，敌人属性-6%，获得领域技能',
    color: 'bg-rarity-green',
  },
  {
    name: '法则',
    level: 80,
    desc: '触及法则层面，领域范围50米',
    effect: '领域内全属性+20%，敌人属性-12%，法则压制低阶领域',
    color: 'bg-rarity-blue',
  },
  {
    name: '时空',
    level: 90,
    desc: '掌控时空法则，领域范围200米',
    effect: '领域内全属性+35%，敌人属性-20%，时空减速效果',
    color: 'bg-rarity-purple',
  },
  {
    name: '创世',
    level: 100,
    desc: '创造世界之力，领域范围1000米',
    effect: '领域内全属性+50%，敌人属性-30%，创造法则加持',
    color: 'bg-rarity-gold',
  },
]

export default function DomainPanel() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  if (!player) return null

  const { level } = player

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
        <h2 className="text-hud-lg font-bold text-text-primary">领域系统</h2>
      </div>

      {/* 状态提示 */}
      <div className="hud-card p-3 mb-4 bg-accent-gold/5 border-accent-gold/20">
        <p className="text-hud-sm text-text-primary font-bold">🌌 领域尚未觉醒</p>
        <p className="text-hud-xs text-text-secondary mt-1">
          领域是封号斗罗级别强者才能触及的力量。达到Lv.60后可尝试觉醒领域。
          双领域共存规则：达到时空级后可尝试觉醒第二领域。
        </p>
      </div>

      {/* 5阶段时间线 */}
      <div className="relative pl-6">
        {/* 时间线竖线 */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-text-disabled/20" />

        <div className="space-y-4">
          {domainStages.map((stage, i) => {
            const isUnlocked = level >= stage.level

            return (
              <div key={stage.name} className="relative">
                {/* 时间线节点 */}
                <div
                  className={`absolute left-[-18px] top-2 w-3 h-3 rounded-full border-2 ${
                    isUnlocked
                      ? 'bg-accent-gold border-accent-gold shadow-hud-gold'
                      : 'bg-surface-field border-text-disabled/30'
                  }`}
                />

                {/* 阶段卡片 */}
                <div
                  className={`hud-card p-3 ${
                    isUnlocked ? 'opacity-50' : 'opacity-30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-hud-sm font-bold text-text-primary">{stage.name}</p>
                    <span className={`text-hud-xs px-2 py-0.5 rounded-hud ${
                      isUnlocked
                        ? 'bg-accent-gold/20 text-accent-gold'
                        : 'bg-surface-field text-text-disabled'
                    }`}>
                      Lv.{stage.level}
                    </span>
                  </div>
                  <p className="text-hud-xs text-text-secondary mb-1">{stage.desc}</p>
                  <p className="text-hud-xs text-text-muted">{stage.effect}</p>
                  {isUnlocked && (
                    <p className="text-hud-xs text-accent-gold mt-1 font-bold">已达到等级要求</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="hud-card p-3 mt-4">
        <h4 className="text-hud-xs font-bold text-text-secondary mb-2">领域类型</h4>
        <div className="grid grid-cols-2 gap-2">
          {['杀戮领域', '天使领域', '海神领域', '蓝银领域', '修罗领域', '罗刹领域', '生命领域'].map(
            (name) => (
              <span
                key={name}
                className="text-hud-xs px-2 py-1 rounded-hud bg-surface-field text-text-muted text-center"
              >
                {name}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
