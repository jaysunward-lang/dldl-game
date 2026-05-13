import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'

const boneSlots = [
  { id: 'head', name: '头部魂骨', icon: '🧠', desc: '智慧头骨' },
  { id: 'chest', name: '胸部魂骨', icon: '🫁', desc: '躯干骨' },
  { id: 'leftArm', name: '左臂魂骨', icon: '💪', desc: '左臂骨' },
  { id: 'rightArm', name: '右臂魂骨', icon: '💪', desc: '右臂骨' },
  { id: 'leftLeg', name: '左腿魂骨', icon: '🦵', desc: '左腿骨' },
  { id: 'rightLeg', name: '右腿魂骨', icon: '🦵', desc: '右腿骨' },
]

const externalBone = { id: 'external', name: '外附魂骨', icon: '✨', desc: '蛛矛/翼/尾/角' }

function BoneSlot({ name, icon, desc }: { name: string; icon: string; desc: string }) {
  return (
    <div className="hud-card p-3 flex flex-col items-center gap-1.5 opacity-50 hover:opacity-70 transition-opacity">
      <span className="text-2xl">{icon}</span>
      <p className="text-hud-sm font-bold text-text-muted">{name}</p>
      <p className="text-hud-xs text-text-disabled">{desc}</p>
      <span className="text-hud-xs px-2 py-0.5 rounded-hud bg-surface-field text-text-disabled mt-1">
        未装备
      </span>
    </div>
  )
}

export default function SoulBonesPanel() {
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
        <h2 className="text-hud-lg font-bold text-text-primary">魂骨系统</h2>
      </div>

      {/* 解锁提示 */}
      <div className="hud-card-gold p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-hud-sm">💡</span>
          <div>
            <p className="text-hud-sm text-text-primary font-bold">如何获取魂骨</p>
            <p className="text-hud-xs text-text-secondary mt-0.5">
              击败魂骨秘境Boss可随机掉落魂骨，品质越高掉落率越低。
              魂骨可升星强化，最高★7，四阶突破解锁额外属性。
            </p>
          </div>
        </div>
      </div>

      {/* 身体部位布局：6常规魂骨 */}
      <h3 className="text-hud-sm font-bold text-text-primary mb-3">常规魂骨（6部位）</h3>

      {/* 头部 - 顶部居中 */}
      <div className="flex justify-center mb-2">
        <div className="w-40">
          <BoneSlot {...boneSlots[0]} />
        </div>
      </div>

      {/* 胸部 - 中部居中 */}
      <div className="flex justify-center mb-2">
        <div className="w-40">
          <BoneSlot {...boneSlots[1]} />
        </div>
      </div>

      {/* 双臂 - 中部左右 */}
      <div className="flex justify-center gap-3 mb-2">
        <div className="w-40">
          <BoneSlot {...boneSlots[2]} />
        </div>
        <div className="w-40">
          <BoneSlot {...boneSlots[3]} />
        </div>
      </div>

      {/* 双腿 - 底部左右 */}
      <div className="flex justify-center gap-3 mb-4">
        <div className="w-40">
          <BoneSlot {...boneSlots[4]} />
        </div>
        <div className="w-40">
          <BoneSlot {...boneSlots[5]} />
        </div>
      </div>

      {/* 外附魂骨 - 独立区域 */}
      <h3 className="text-hud-sm font-bold text-text-primary mb-3">
        外附魂骨
        <span className="text-hud-xs text-accent-gold font-normal ml-2">独立第七装备位</span>
      </h3>
      <div className="flex justify-center mb-4">
        <div className="w-44">
          <div className="hud-card-gold p-3 flex flex-col items-center gap-1.5 opacity-60">
            <span className="text-2xl">{externalBone.icon}</span>
            <p className="text-hud-sm font-bold text-text-muted">{externalBone.name}</p>
            <p className="text-hud-xs text-text-disabled">{externalBone.desc}</p>
            <p className="text-hud-xs text-accent-gold mt-1">
              仅史诗/传说品质 · 独立技能池
            </p>
          </div>
        </div>
      </div>

      {/* 魂骨品质说明 */}
      <div className="hud-card p-3">
        <h4 className="text-hud-xs font-bold text-text-secondary mb-2">品质说明</h4>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: '普通', color: 'text-rarity-white' },
            { label: '稀有', color: 'text-rarity-green' },
            { label: '精良', color: 'text-rarity-blue' },
            { label: '史诗', color: 'text-rarity-purple' },
            { label: '传说', color: 'text-rarity-gold' },
          ].map((q) => (
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
