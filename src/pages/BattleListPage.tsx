import { useState } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import { useBattleStore } from '@stores'
import DlButton from '@components/atoms/DlButton'
import DlProgressBar from '@components/atoms/DlProgressBar'

const dungeonTypes = [
  { id: 'soulBeastForest', name: '魂兽森林', icon: '🌲', desc: '猎杀魂兽，获取魂环与魂骨', minLv: 1, stamina: 12 },
  { id: 'soulRingTrial', name: '魂环试炼', icon: '💫', desc: '挑战守护者，获取高品质魂环', minLv: 10, stamina: 20 },
  { id: 'soulBoneRealm', name: '魂骨秘境', icon: '🦴', desc: '探索秘境，获取稀有魂骨', minLv: 20, stamina: 25 },
  { id: 'goldCave', name: '金币洞窟', icon: '💎', desc: '击败金币兽，获取大量金币', minLv: 5, stamina: 15 },
  { id: 'spiritTower', name: '精神试炼塔', icon: '🧠', desc: '挑战层数，提升精神力', minLv: 15, stamina: 15 },
  { id: 'worldBoss', name: '世界Boss', icon: '👹', desc: '全服协作，挑战世界Boss', minLv: 30, stamina: 0 },
]

function BattleOverview() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)

  return (
    <div className="p-4">
      <h1 className="text-hud-xl font-bold text-text-primary mb-4">战斗</h1>

      {/* 副本列表 */}
      <div className="space-y-2 mb-6">
        {dungeonTypes.map((d) => {
          const unlocked = (player?.level ?? 0) >= d.minLv
          return (
            <button
              key={d.id}
              disabled={!unlocked}
              onClick={() => navigate(`/battle/${d.id}`)}
              className={`w-full p-4 rounded-hud border text-left transition-all ${
                unlocked
                  ? 'bg-surface-elevated border-text-disabled/20 hover:border-accent-gold/30 active:scale-[0.98]'
                  : 'bg-surface-base border-text-disabled/10 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{d.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-hud-base font-bold text-text-primary">{d.name}</p>
                    {!unlocked && <span className="text-hud-xs text-accent-crimson">Lv.{d.minLv}解锁</span>}
                  </div>
                  <p className="text-hud-xs text-text-muted mt-0.5">{d.desc}</p>
                  <div className="flex gap-3 mt-1 text-hud-xs text-text-muted">
                    <span>⚡体力:{d.stamina}</span>
                    <span>🔓Lv.{d.minLv}</span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 组队入口 */}
      <DlButton variant="skill" className="w-full" onClick={() => navigate('/battle/team-hall')}>
        👥 组队大厅
      </DlButton>
    </div>
  )
}

// ---- 副本详情 + 开始战斗 ----
function DungeonDetail() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  const initBattle = useBattleStore((s) => s.initBattle)
  const [difficulty, setDifficulty] = useState<'normal' | 'hard'>('normal')
  const [isStarting, setIsStarting] = useState(false)

  const { dungeonType: dungeonTypeParam } = useParams<{ dungeonType: string }>()
  const dungeonType = dungeonTypeParam || 'soulBeastForest'
  const dungeon = dungeonTypes.find((d) => d.id === dungeonType) || dungeonTypes[0]

  const unlocked = (player?.level ?? 0) >= dungeon.minLv
  const staminaCost = difficulty === 'hard' ? dungeon.stamina * 1.5 : dungeon.stamina

  const handleStartBattle = () => {
    if (!player || !unlocked || isStarting) return
    setIsStarting(true)

    // 初始化战斗
    initBattle(player, dungeonType)

    // 短暂延迟后跳转到战斗场景
    setTimeout(() => {
      navigate(`/battle-scene/${dungeonType}`, { replace: true })
    }, 300)
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <button
        onClick={() => navigate('/battle')}
        className="text-text-muted hover:text-text-secondary text-hud-sm mb-4"
      >
        ← 返回
      </button>

      <div className="hud-card p-6 space-y-4">
        <div className="text-center">
          <span className="text-5xl mb-3 block">{dungeon.icon}</span>
          <h2 className="text-hud-xl font-bold text-text-primary">{dungeon.name}</h2>
          <p className="text-hud-sm text-text-secondary mt-1">{dungeon.desc}</p>
        </div>

        {/* 难度选择 */}
        <div>
          <p className="text-hud-sm text-text-secondary mb-2">选择难度</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDifficulty('normal')}
              className={`p-3 rounded-hud border text-center transition-all ${
                difficulty === 'normal'
                  ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                  : 'border-text-disabled/20 hover:border-accent-gold/30 text-text-secondary'
              }`}
            >
              <p className="text-hud-sm font-bold">普通</p>
              <p className="text-hud-xs text-text-muted">推荐 Lv.{dungeon.minLv}</p>
            </button>
            <button
              onClick={() => setDifficulty('hard')}
              className={`p-3 rounded-hud border text-center transition-all ${
                difficulty === 'hard'
                  ? 'border-accent-crimson bg-accent-crimson/10 text-accent-crimson'
                  : 'border-text-disabled/20 hover:border-accent-crimson/30 text-text-secondary'
              }`}
            >
              <p className="text-hud-sm font-bold">困难</p>
              <p className="text-hud-xs text-text-muted">推荐 Lv.{dungeon.minLv + 10}</p>
            </button>
          </div>
        </div>

        {/* 消耗信息 */}
        <div className="bg-surface-field rounded-hud p-3 space-y-1 text-hud-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">体力消耗</span>
            <span className="text-text-primary">{staminaCost}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">难度系数</span>
            <span className={difficulty === 'hard' ? 'text-accent-crimson' : 'text-text-primary'}>
              {difficulty === 'normal' ? '×1.0' : '×1.5'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">推荐战力</span>
            <span className="text-text-primary">{dungeon.minLv * 100}</span>
          </div>
        </div>

        {player && (
          <div className="bg-surface-field rounded-hud p-3">
            <div className="flex justify-between text-hud-xs mb-1">
              <span className="text-text-muted">当前体力</span>
              <span className={player.stamina < staminaCost ? 'text-accent-crimson' : 'text-text-primary'}>
                {player.stamina} / {staminaCost}
              </span>
            </div>
            <DlProgressBar
              value={player.stamina}
              max={Math.max(player.stamina, staminaCost)}
              color="stamina"
              size="sm"
            />
          </div>
        )}

        {/* 开始按钮 */}
        <DlButton
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!unlocked || isStarting || (player?.stamina ?? 0) < staminaCost}
          loading={isStarting}
          onClick={handleStartBattle}
        >
          {!unlocked ? `需 Lv.${dungeon.minLv} 解锁` :
           (player?.stamina ?? 0) < staminaCost ? '体力不足' :
           '⚔️ 开始战斗'}
        </DlButton>
      </div>
    </div>
  )
}

export default function BattleListPage() {
  return (
    <Routes>
      <Route index element={<BattleOverview />} />
      <Route path=":dungeonType" element={<DungeonDetail />} />
      <Route path="team-hall" element={<div className="p-4"><p className="text-text-secondary">组队大厅（开发中）</p></div>} />
    </Routes>
  )
}
