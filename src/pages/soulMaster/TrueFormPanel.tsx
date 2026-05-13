import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import type { WuhunType } from '@types'

const trueFormStages = [
  {
    name: '初醒·不稳定',
    level: 70,
    desc: '武魂真身初次觉醒，形态不稳定，持续时间短',
    effect: '全属性+30%，持续3回合，冷却10回合',
    stars: 1,
  },
  {
    name: '初醒·稳定',
    level: 75,
    desc: '武魂真身趋于稳定，可自由控制变身时机',
    effect: '全属性+50%，持续5回合，冷却8回合',
    stars: 3,
  },
  {
    name: '掌控',
    level: 85,
    desc: '完全掌控武魂真身，可维持更长时间',
    effect: '全属性+80%，持续8回合，冷却6回合',
    stars: 5,
  },
  {
    name: '神临',
    level: 100,
    desc: '武魂真身达到神级境界，化身武魂本尊',
    effect: '全属性+150%，持续10回合，冷却3回合，获得神临技能',
    stars: 7,
  },
]

const trueFormTypes: Record<WuhunType, string> = {
  '强攻': '力量真身 · 体型巨大化，攻击力倍增',
  '敏攻': '速度真身 · 残影分身，速度极限提升',
  '控制': '掌控真身 · 领域扩展，控制力强化',
  '防御': '不灭真身 · 防御力暴涨，伤害减免',
  '辅助': '光辉真身 · 辅助范围扩大，效果翻倍',
  '精神': '神念真身 · 精神力质变，精神攻击强化',
  '食物': '万物真身 · 恢复力暴涨，可群体治疗',
}

export default function TrueFormPanel() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  if (!player) return null

  const { level, wuhun } = player
  const unlockLevel = 70
  const canAwaken = level >= unlockLevel
  const formTypeDesc = trueFormTypes[wuhun.type] ?? '未知真身'

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
        <h2 className="text-hud-lg font-bold text-text-primary">武魂真身</h2>
      </div>

      {/* 解锁条件横幅 */}
      <div
        className={`hud-card p-4 mb-4 text-center ${
          canAwaken ? 'hud-card-gold animate-glow-pulse' : ''
        }`}
      >
        <p className="text-hud-lg mb-1">⚡</p>
        {canAwaken ? (
          <>
            <p className="text-hud-base font-bold text-accent-gold">
              已满足觉醒条件！
            </p>
            <p className="text-hud-xs text-text-secondary mt-1">
              Lv.{level} · 可前往武魂殿进行真身觉醒
            </p>
          </>
        ) : (
          <>
            <p className="text-hud-base font-bold text-text-primary">
              Lv.{unlockLevel} 觉醒武魂真身
            </p>
            <p className="text-hud-xs text-text-secondary mt-1">
              当前 Lv.{level} · 还需 {unlockLevel - level} 级
            </p>
            {/* 进度条 */}
            <div className="mt-2 h-1.5 bg-surface-field rounded-hud-full overflow-hidden max-w-xs mx-auto">
              <div
                className="h-full bg-accent-gold rounded-hud-full transition-all duration-500"
                style={{ width: `${Math.min(100, (level / unlockLevel) * 100)}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* 真身类型 */}
      <div className="hud-card p-3 mb-4">
        <p className="text-hud-xs text-text-secondary mb-1">你的真身类型</p>
        <p className="text-hud-sm font-bold text-text-primary">
          {wuhun.type}系 · {formTypeDesc}
        </p>
      </div>

      {/* 4个觉醒阶段 */}
      <h3 className="text-hud-sm font-bold text-text-primary mb-3">觉醒阶段</h3>
      <div className="space-y-3">
        {trueFormStages.map((stage, i) => {
          const isUnlocked = level >= stage.level
          const starsStr = '★'.repeat(stage.stars) + '☆'.repeat(Math.max(0, 7 - stage.stars))

          return (
            <div
              key={stage.name}
              className={`hud-card p-3 ${isUnlocked ? 'opacity-60' : 'opacity-30'}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isUnlocked ? 'bg-accent-gold shadow-hud-gold' : 'bg-text-disabled'
                    }`}
                  />
                  <p className="text-hud-sm font-bold text-text-primary">{stage.name}</p>
                </div>
                <span
                  className={`text-hud-xs px-2 py-0.5 rounded-hud ${
                    isUnlocked
                      ? 'bg-accent-gold/20 text-accent-gold'
                      : 'bg-surface-field text-text-disabled'
                  }`}
                >
                  Lv.{stage.level}
                </span>
              </div>
              <p className="text-hud-xs text-text-secondary mb-1">{stage.desc}</p>
              <p className="text-hud-xs text-text-muted mb-1.5">{stage.effect}</p>
              <p className="text-hud-xs text-accent-gold">{starsStr}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
