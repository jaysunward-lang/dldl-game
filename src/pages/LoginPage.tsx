import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import DlButton from '@components/atoms/DlButton'
import type { WuhunInfo, WuhunQuality, WuhunType } from '@types'

const wuhunNames: Record<WuhunType, string[]> = {
  '强攻': ['赤焰虎', '大地之熊', '暗金恐爪熊', '破魂枪'],
  '敏攻': ['幽冥灵猫', '闪电隼', '风之狼', '影豹'],
  '控制': ['蓝银草', '冰凤凰', '天星藤', '幻梦蝶'],
  '防御': ['玄龟盾', '金刚壁', '不灭金身', '磐石巨人'],
  '辅助': ['九心海棠', '七宝琉璃', '治愈天使', '祈愿之环'],
  '精神': ['邪眼', '梦幻妖狐', '天梦冰蚕', '精神触须'],
  '食物': ['糖豆', '香肠', '肉包', '酒葫芦'],
}

const qualityLabels: { q: WuhunQuality; label: string; color: string; mult: number }[] = [
  { q: 'T7', label: '废武魂', color: 'text-rarity-white', mult: 0.5 },
  { q: 'T6', label: '劣等', color: 'text-rarity-white', mult: 0.6 },
  { q: 'T5', label: '下等', color: 'text-rarity-green', mult: 0.8 },
  { q: 'T4', label: '中等', color: 'text-rarity-green', mult: 0.9 },
  { q: 'T3', label: '上等', color: 'text-rarity-blue', mult: 1.0 },
  { q: 'T2', label: '极品', color: 'text-rarity-purple', mult: 1.25 },
  { q: 'T1', label: '顶级', color: 'text-rarity-orange', mult: 1.6 },
  { q: 'T0', label: '神级', color: 'text-rarity-gold', mult: 2.1 },
]

// 品质概率池（加权随机）
const qualityPool: { q: WuhunQuality; weight: number }[] = [
  { q: 'T7', weight: 10 }, { q: 'T6', weight: 15 }, { q: 'T5', weight: 20 },
  { q: 'T4', weight: 20 }, { q: 'T3', weight: 15 }, { q: 'T2', weight: 10 },
  { q: 'T1', weight: 7 },  { q: 'T0', weight: 3 },
]

function randomQuality(): WuhunQuality {
  const total = qualityPool.reduce((s, i) => s + i.weight, 0)
  let r = Math.random() * total
  for (const item of qualityPool) {
    r -= item.weight
    if (r <= 0) return item.q
  }
  return 'T7'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const createPlayer = usePlayerStore((s) => s.createPlayer)

  const [step, setStep] = useState<'name' | 'wuhun' | 'confirm'>('name')
  const [playerName, setPlayerName] = useState('')
  const [wuhunType, setWuhunType] = useState<WuhunType>('强攻')
  const [wuhunName, setWuhunName] = useState('')
  const [wuhunQuality, setWuhunQuality] = useState<WuhunQuality>('T4')
  const [isAwakening, setIsAwakening] = useState(false)

  const handleAwaken = () => {
    if (!playerName.trim()) return
    setIsAwakening(true)
    // 模拟觉醒动画
    setTimeout(() => {
      const quality = randomQuality()
      const names = wuhunNames[wuhunType]
      const name = names[Math.floor(Math.random() * names.length)]
      setWuhunQuality(quality)
      setWuhunName(name)
      setIsAwakening(false)
      setStep('confirm')
    }, 2000)
  }

  const handleStartGame = () => {
    const qualityInfo = qualityLabels.find((q) => q.q === wuhunQuality)!
    const wuhun: WuhunInfo = {
      name: wuhunName,
      type: wuhunType,
      quality: wuhunQuality,
      qualityMultiplier: qualityInfo.mult,
      soulRings: [],
      evolutionStage: 0,
    }
    createPlayer(playerName.trim(), wuhun)
    navigate('/world', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-surface-base flex flex-col items-center justify-center p-6">
      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-hud-2xl font-game font-bold text-accent-gold text-shadow-gold">
          斗罗大陆
        </h1>
        <p className="text-hud-sm text-text-muted mt-2">剧情文字 RPG</p>
      </div>

      {/* 步骤一：输入名字 */}
      {step === 'name' && (
        <div className="w-full max-w-sm space-y-4 animate-fade-in">
          <p className="text-hud-base text-text-secondary text-center">
            请输入你的角色名字
          </p>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="输入角色名（2-8字）"
            maxLength={8}
            className="w-full px-4 py-3 bg-surface-field border border-text-disabled/30 rounded-hud
                       text-text-primary text-hud-base placeholder:text-text-muted
                       focus:border-accent-gold/60 focus:outline-none transition-colors"
            autoFocus
          />
          <DlButton
            variant="primary"
            className="w-full"
            disabled={playerName.trim().length < 2}
            onClick={() => setStep('wuhun')}
          >
            下一步 · 选择武魂类型
          </DlButton>
        </div>
      )}

      {/* 步骤二：选择武魂类型 */}
      {step === 'wuhun' && (
        <div className="w-full max-w-sm space-y-4 animate-fade-in">
          <p className="text-hud-base text-text-secondary text-center">
            选择你的武魂类型
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(['强攻', '敏攻', '控制', '防御', '辅助', '精神', '食物'] as WuhunType[]).map((type) => (
              <button
                key={type}
                onClick={() => setWuhunType(type)}
                className={`p-3 rounded-hud border text-center transition-all active:scale-95 ${
                  wuhunType === type
                    ? 'bg-accent-gold/20 border-accent-gold/60 text-accent-gold'
                    : 'bg-surface-elevated border-text-disabled/20 text-text-secondary hover:border-accent-gold/30'
                }`}
              >
                <p className="text-hud-sm font-bold">{type}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <DlButton variant="ghost" onClick={() => setStep('name')}>上一步</DlButton>
            <DlButton variant="primary" className="flex-1" onClick={handleAwaken}>
              觉醒武魂
            </DlButton>
          </div>
        </div>
      )}

      {/* 觉醒动画 */}
      {isAwakening && (
        <div className="w-full max-w-sm text-center space-y-4 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full border-4 border-accent-gold/60 animate-glow-pulse flex items-center justify-center">
            <span className="text-3xl">✨</span>
          </div>
          <p className="text-hud-lg text-accent-gold font-bold animate-pulse">
            武魂觉醒中...
          </p>
        </div>
      )}

      {/* 步骤三：确认武魂 */}
      {step === 'confirm' && (
        <div className="w-full max-w-sm space-y-4 animate-slide-up">
          <div className="hud-card-gold p-6 text-center space-y-3">
            <p className="text-hud-sm text-text-muted">你的武魂</p>
            <p className={`text-hud-xl font-bold ${qualityLabels.find((q) => q.q === wuhunQuality)!.color}`}>
              {wuhunName}
            </p>
            <p className="text-hud-sm text-text-secondary">
              {wuhunType}系 · {qualityLabels.find((q) => q.q === wuhunQuality)!.label}
            </p>
            <div className="w-full h-1 bg-surface-field rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-gold rounded-full"
                style={{ width: `${(qualityLabels.findIndex((q) => q.q === wuhunQuality) / 7) * 100}%` }}
              />
            </div>
          </div>
          <DlButton variant="primary" className="w-full" onClick={handleStartGame}>
            进入斗罗大陆
          </DlButton>
          <DlButton variant="ghost" className="w-full" onClick={() => setStep('wuhun')}>
            重新觉醒
          </DlButton>
        </div>
      )}
    </div>
  )
}