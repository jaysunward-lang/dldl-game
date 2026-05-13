import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBattleStore, usePlayerStore } from '@stores'
import DlProgressBar from '@components/atoms/DlProgressBar'
import DlButton from '@components/atoms/DlButton'
import { getAvailableSkills } from '@engine/skillDefinitions'
import type { Skill, InventoryItem, InventoryItemType } from '@types'

const inventoryItemTypes = new Set<InventoryItemType>([
  'soulRing',
  'soulBone',
  'externalBone',
  'material',
  'weapon',
  'consumable',
])

function isInventoryItemType(type: string): type is InventoryItemType {
  return inventoryItemTypes.has(type as InventoryItemType)
}

const qualityColorMap: Record<string, string> = {
  '白色': 'text-rarity-white',
  '黄色': 'text-rarity-green',
  '紫色': 'text-rarity-purple',
  '黑色': 'text-rarity-purple',
  '红色': 'text-rarity-red',
  '金色': 'text-rarity-gold',
  '传说': 'text-rarity-gold',
  '史诗': 'text-rarity-orange',
}

function DamageFloat({ value, type, onDone }: { value: number; type: string; onDone: () => void }) {
  const colorMap: Record<string, string> = {
    damage: 'text-rarity-red',
    crit: 'text-accent-gold text-hud-xl font-extrabold',
    heal: 'text-accent-emerald',
    dodge: 'text-text-muted',
    dot: 'text-accent-amethyst',
  }
  const posRef = useRef<{ left: string; top: string } | null>(null)
  if (!posRef.current) {
    posRef.current = {
      left: `${30 + Math.random() * 40}%`,
      top: `${20 + Math.random() * 10}%`,
    }
  }
  return (
    <div
      className={`damage-number ${colorMap[type] || 'text-rarity-red'}`}
      style={posRef.current}
      onAnimationEnd={onDone}
    >
      {type === 'dodge' ? 'MISS' : type === 'crit' ? `${value}!!` : value}
    </div>
  )
}

function SkillMenu({
  skills,
  selectedSkill,
  onSelect,
  onClose,
  currentMp,
}: {
  skills: Skill[]
  selectedSkill: Skill | null
  onSelect: (s: Skill) => void
  onClose: () => void
  currentMp: number
}) {
  const typeLabels: Record<string, string> = {
    ATK: '⚔️攻击', CTL: '🔗控制', SUP: '💚辅助',
    BST: '💥爆发', FLD: '🌀领域', ULT: '⭐终极',
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center pb-20 bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-surface-overlay rounded-t-hud-lg border border-text-disabled/20 p-4 max-h-[60vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-hud-lg font-bold text-text-primary mb-3">选择魂技</h3>
        <div className="grid grid-cols-2 gap-2">
          {skills.map((skill) => {
            const canUse = skill.currentCooldown <= 0 && skill.mpCost <= currentMp
            return (
              <button
                key={skill.id}
                disabled={!canUse}
                onClick={() => { onSelect(skill); onClose() }}
                className={`text-left p-3 rounded-hud border transition-all ${
                  selectedSkill?.id === skill.id
                    ? 'border-accent-gold bg-accent-gold/10'
                    : canUse
                    ? 'border-text-disabled/20 bg-surface-field hover:border-accent-gold/30 active:scale-95'
                    : 'border-text-disabled/10 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-hud-xs px-1 py-0.5 rounded bg-accent-gold/20 text-accent-gold">
                    {typeLabels[skill.type] || skill.type}
                  </span>
                  {skill.currentCooldown > 0 && (
                    <span className="text-hud-xs text-accent-crimson">CD:{skill.currentCooldown}</span>
                  )}
                </div>
                <p className="text-hud-sm font-bold text-text-primary">{skill.name}</p>
                <p className="text-hud-xs text-text-muted mt-0.5 ">{skill.description}</p>
                <div className="flex gap-3 mt-1 text-hud-xs">
                  <span className="text-battle-mp">魂力:{skill.mpCost}</span>
                  <span className="text-text-muted">冷却:{skill.cooldown}回合</span>
                  <span className="text-rarity-orange">×{skill.damageMultiplier.toFixed(1)}</span>
                </div>
              </button>
            )
          })}
        </div>
        <DlButton variant="ghost" className="w-full mt-3" onClick={onClose}>关闭</DlButton>
      </div>
    </div>
  )
}

export default function BattleScenePage() {
  const navigate = useNavigate()
  const {
    state, round, playerUnits, enemyUnits, actionOrder, currentActorIndex,
    selectedAction, selectedSkill, selectedTarget, playerSkills, logs,
    pendingEvents, comboCount, isPlayerTurn, isBossFight, dungeonType,
    battleResult, loot, fledSuccess,
    selectAction, selectSkill, selectTarget, executePlayerAction,
    executeAITurn, advanceToNextActor, clearPendingEvents,
  } = useBattleStore()

  const player = usePlayerStore((s) => s.player)
  const [showSkillMenu, setShowSkillMenu] = useState(false)
  const [floatingDmgs, setFloatingDmgs] = useState<{ id: number; value: number; type: string }[]>([])
  const dmgIdRef = useRef(0)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  useEffect(() => {
    if (pendingEvents.length === 0) return
    const newFloats: { id: number; value: number; type: string }[] = []
    for (const event of pendingEvents) {
      if (event.type === 'damage' || event.type === 'crit' || event.type === 'heal' || event.type === 'dodge' || event.type === 'dot') {
        if (event.value && event.value > 0) {
          newFloats.push({ id: dmgIdRef.current + newFloats.length, value: event.value, type: event.type })
        } else if (event.type === 'dodge') {
          newFloats.push({ id: dmgIdRef.current + newFloats.length, value: 0, type: 'dodge' })
        }
      }
    }
    if (newFloats.length > 0) {
      dmgIdRef.current += newFloats.length
      setFloatingDmgs((prev) => [...prev, ...newFloats])
    }
    const timer = setTimeout(() => {
      clearPendingEvents()
    }, 800)
    return () => clearTimeout(timer)
  }, [pendingEvents, clearPendingEvents])

  useEffect(() => {
    if (state === 'actionExec' && !isPlayerTurn) {
      const timer = setTimeout(() => {
        executeAITurn()
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [state, isPlayerTurn, executeAITurn])

  useEffect(() => {
    if (state === 'actionPost') {
      const timer = setTimeout(() => {
        advanceToNextActor()
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [state, advanceToNextActor])

  if (state === 'idle' || state === 'init') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-12 h-12 rounded-full border-2 border-accent-gold/40 animate-glow-pulse flex items-center justify-center">
          <span className="text-xl">⚔️</span>
        </div>
        <p className="text-text-secondary animate-pulse">准备战斗...</p>
      </div>
    )
  }

  const playerUnit = playerUnits.find((u) => u.alive) || playerUnits[0]
  const availableSkills = getAvailableSkills(playerSkills, playerUnit?.stats.mp ?? 0)

  if ((state === 'result' || state === 'reward') && battleResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="hud-card-gold p-8 text-center max-w-sm w-full space-y-4 animate-fade-in">
          {battleResult === 'player_win' ? (
            <>
              <div className="text-6xl mb-2">🏆</div>
              <h2 className="text-hud-2xl font-bold text-accent-gold">胜利！</h2>
              {loot && (
                <div className="space-y-2 text-left">
                  <div className="flex justify-between text-hud-base">
                    <span className="text-text-secondary">经验值</span>
                    <span className="text-rarity-gold font-mono">+{loot.totalExp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-hud-base">
                    <span className="text-text-secondary">金币</span>
                    <span className="text-rarity-gold font-mono">+{loot.totalGold.toLocaleString()}</span>
                  </div>
                  {loot.items.filter(i => i.type !== 'gold' && i.type !== 'exp').map((item) => (
                    <div key={item.id} className="flex justify-between text-hud-sm">
                      <span className="text-text-secondary flex items-center gap-1">
                        <span>{item.icon}</span>
                        <span className={item.quality ? qualityColorMap[item.quality] || '' : ''}>
                          {item.name}
                        </span>
                      </span>
                      <span className="text-text-primary font-mono">×{item.quantity}</span>
                    </div>
                  ))}
                  {loot.summary === '无额外掉落' && (
                    <p className="text-hud-xs text-text-muted text-center">无额外掉落</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-6xl mb-2">💀</div>
              <h2 className="text-hud-2xl font-bold text-accent-crimson">
                {fledSuccess ? '已逃跑' : '战斗失败'}
              </h2>
              {!fledSuccess && (
                <p className="text-text-secondary text-hud-sm">你的队伍被击败了...</p>
              )}
            </>
          )}
          <div className="flex gap-2 pt-2">
            {battleResult === 'player_win' && player && (
              <DlButton
                variant="primary"
                className="flex-1"
                onClick={() => {
                  const playerStore = usePlayerStore.getState()
                  playerStore.addExp(loot?.totalExp ?? 0)
                  playerStore.addGold(loot?.totalGold ?? 0)
                  const realItems: InventoryItem[] = []
                  for (const item of loot?.items ?? []) {
                    if (!isInventoryItemType(item.type)) continue
                    realItems.push({
                      id: item.id,
                      name: item.name,
                      type: item.type,
                      quantity: item.quantity,
                      quality: item.quality,
                      icon: item.icon,
                      description: item.description,
                    })
                  }
                  if (realItems.length > 0) {
                    playerStore.addItems(realItems)
                  }
                  playerStore.unlockAchievement('first-battle-win')
                  useBattleStore.getState().resetBattle()
                  navigate('/battle', { replace: true })
                }}
              >
                领取奖励
              </DlButton>
            )}
            <DlButton
              variant="ghost"
              className="flex-1"
              onClick={() => {
                useBattleStore.getState().resetBattle()
                navigate('/battle', { replace: true })
              }}
            >
              {battleResult === 'player_lose' ? '撤退' : '返回'}
            </DlButton>
          </div>
        </div>
      </div>
    )
  }

  const currentActorId = actionOrder[currentActorIndex]
  const currentActor = [...playerUnits, ...enemyUnits].find((u) => u.id === currentActorId)

  return (
    <div className="flex flex-col h-full relative">
      {/* 伤害飘字层 */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {floatingDmgs.map((f) => (
          <DamageFloat
            key={f.id}
            value={f.value}
            type={f.type}
            onDone={() => setFloatingDmgs((prev) => prev.filter((x) => x.id !== f.id))}
          />
        ))}
      </div>

      {/* A区：敌方区域 (40%) */}
      <div className="flex-shrink-0 h-[40%] bg-surface-base p-3 overflow-y-auto">
        <div className="flex flex-wrap gap-3 justify-center items-start h-full">
          {enemyUnits.map((unit) => {
            const isTargeted = selectedTarget === unit.id
            const hpPercent = unit.stats.maxHp > 0 ? (unit.stats.hp / unit.stats.maxHp) * 100 : 0
            return (
              <button
                key={unit.id}
                disabled={!unit.alive || !isPlayerTurn}
                onClick={() => isPlayerTurn && unit.alive && selectTarget(unit.id)}
                className={`relative w-[140px] p-3 rounded-hud border-2 transition-all ${
                  !unit.alive ? 'opacity-20 pointer-events-none' :
                  isTargeted ? 'border-accent-crimson shadow-hud-crimson scale-105 z-10' :
                  isPlayerTurn ? 'border-text-disabled/20 hover:border-accent-gold/40 cursor-pointer' :
                  'border-text-disabled/20'
                } ${unit.isBoss ? 'bg-accent-crimson/5' : 'bg-surface-elevated'}`}
              >
                {/* Boss标记 */}
                {unit.isBoss && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-accent-crimson text-white text-hud-xs px-2 py-0.5 rounded-hud-full font-bold">
                    BOSS
                  </div>
                )}
                {/* 头像 */}
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-lg mb-2 transition-all ${
                  unit.isBoss ? 'bg-accent-crimson/20 ring-2 ring-accent-crimson/40' :
                  hpPercent < 25 ? 'bg-battle-hp-bg' :
                  hpPercent < 50 ? 'bg-accent-gold/20' :
                  'bg-surface-field'
                }`}>
                  {unit.isBoss ? '👹' : unit.alive ? '👾' : '💀'}
                </div>
                {/* 名称 + 等级 */}
                <p className="text-hud-sm font-bold text-text-primary text-center truncate">
                  {unit.name}
                </p>
                <p className="text-hud-xs text-text-muted text-center">Lv.{unit.level}</p>
                {/* 血条 */}
                <div className="mt-2">
                  <DlProgressBar value={unit.stats.hp} max={unit.stats.maxHp} color="hp" size="sm" showLabel />
                </div>
                {/* 状态图标 */}
                {unit.debuffs.length > 0 && (
                  <div className="flex gap-0.5 mt-1 justify-center">
                    {unit.debuffs.map((d) => (
                      <span key={d.id} className="text-hud-xs" title={d.name}>
                        {d.type === 'poison' ? '🟢' : d.type === 'burn' ? '🔥' : d.type === 'bleed' ? '🩸' : d.type === 'stun' ? '💫' : d.type === 'slow' ? '🐌' : d.type === 'defenseDown' ? '🔻' : '⬇️'}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            )
          })}
          {enemyUnits.length === 0 && (
            <p className="text-text-muted self-center">没有敌人</p>
          )}
        </div>
      </div>

      {/* B区：战斗日志 (15%) */}
      <div className="flex-shrink-0 h-[15%] bg-surface-overlay border-y border-text-disabled/20 px-3 py-2 overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <span className="text-hud-xs text-text-muted">
            第{round}回合
            {currentActor && (
              <span className="ml-1 text-text-secondary">
                · {currentActor.isPlayer ? '⚔️' : '👾'} {currentActor.name}
                <span className="text-text-muted">行动中</span>
              </span>
            )}
          </span>
          {comboCount > 0 && (
            <span className="text-hud-xs text-accent-gold font-bold combo-counter">🔥{comboCount}连击!</span>
          )}
          {isBossFight && (
            <span className="text-hud-xs text-accent-crimson">Boss战</span>
          )}
        </div>
        <div className="space-y-0.5 max-h-[calc(100%-20px)] overflow-y-auto" ref={logsEndRef}>
          {logs.slice(-4).map((log, i) => (
            <div key={i} className="text-hud-xs leading-relaxed">
              {log.entries.map((e, j) => (
                <p
                  key={j}
                  className={`${
                    e.isCrit ? 'text-accent-gold font-bold' :
                    e.type === 'heal' ? 'text-accent-emerald' :
                    e.type === 'dodge' ? 'text-text-muted italic' :
                    e.type === 'flee' ? 'text-accent-azure' :
                    e.type === 'system' ? 'text-text-muted' :
                    'text-text-secondary'
                  }`}
                >
                  {e.action}
                </p>
              ))}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* C区：己方区域 (25%) */}
      <div className="flex-shrink-0 h-[25%] bg-surface-base p-3">
        <div className="flex gap-3 justify-center h-full items-center">
          {playerUnits.map((unit) => {
            const isCurrent = currentActorId === unit.id
            return (
              <div
                key={unit.id}
                className={`w-[130px] p-2 rounded-hud border transition-all ${
                  !unit.alive ? 'border-accent-crimson/40 opacity-50' :
                  isCurrent && isPlayerTurn ? 'border-accent-gold shadow-hud-gold scale-105' :
                  'border-accent-gold/20'
                } bg-surface-elevated`}
              >
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm mb-1 ${
                  isCurrent ? 'bg-accent-gold/20 ring-2 ring-accent-gold/40' : 'bg-surface-field'
                }`}>
                  {unit.alive ? '🧑' : '💀'}
                </div>
                <p className="text-hud-xs font-bold text-text-primary text-center truncate">{unit.name}</p>
                <p className="text-hud-xs text-text-muted text-center">Lv.{unit.level}</p>
                <div className="mt-1">
                  <DlProgressBar value={unit.stats.hp} max={unit.stats.maxHp} color="hp" size="sm" />
                </div>
                <div className="mt-0.5">
                  <DlProgressBar value={unit.stats.mp} max={unit.stats.maxMp} color="mp" size="sm" />
                </div>
                {/* 状态文字 */}
                <div className="flex justify-between mt-0.5">
                  <span className="text-hud-xs text-battle-hp font-mono">{unit.stats.hp}/{unit.stats.maxHp}</span>
                  <span className="text-hud-xs text-battle-mp font-mono">{unit.stats.mp}/{unit.stats.maxMp}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* D区：操作区 (20%) */}
      <div className="flex-shrink-0 h-[20%] bg-surface-elevated border-t border-text-disabled/20 p-3">
        {isPlayerTurn ? (
          <div className="flex flex-col gap-2 h-full">
            {/* 魂力条 */}
            {playerUnit && (
              <div className="flex items-center gap-2 text-hud-xs">
                <span className="text-battle-mp">魂力</span>
                <div className="flex-1 h-1.5 bg-battle-mp-bg rounded-hud-full overflow-hidden">
                  <div
                    className="h-full bg-battle-mp rounded-hud-full transition-all duration-300"
                    style={{ width: `${(playerUnit.stats.mp / Math.max(1, playerUnit.stats.maxMp)) * 100}%` }}
                  />
                </div>
                <span className="text-text-muted font-mono">{playerUnit.stats.mp}/{playerUnit.stats.maxMp}</span>
              </div>
            )}
            {/* 操作按钮 */}
            <div className="flex gap-1.5 justify-center items-center flex-1">
              <DlButton
                variant={selectedAction === 'attack' ? 'primary' : 'skill'}
                size="sm"
                onClick={() => { selectAction('attack'); setShowSkillMenu(false) }}
              >
                ⚔️ 普攻
              </DlButton>
              <DlButton
                variant={selectedAction === 'skill' ? 'primary' : 'skill'}
                size="sm"
                onClick={() => { setShowSkillMenu(!showSkillMenu); selectAction('skill') }}
              >
                ✨ 魂技
              </DlButton>
              <DlButton
                variant={selectedAction === 'defend' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => { selectAction('defend'); setShowSkillMenu(false) }}
              >
                🛡️ 防御
              </DlButton>
              <DlButton
                variant="ghost"
                size="sm"
                onClick={() => { selectAction('item'); setShowSkillMenu(false) }}
              >
                🧪 道具
              </DlButton>
              <DlButton
                variant="danger"
                size="sm"
                onClick={() => { selectAction('flee'); setShowSkillMenu(false) }}
              >
                🏃 逃跑
              </DlButton>
            </div>
            {/* 执行按钮 */}
            {selectedAction && (selectedAction !== 'skill' || selectedSkill) && (
              <DlButton
                variant="primary"
                size="md"
                className="w-full animate-fade-in"
                onClick={() => {
                  if (selectedAction === 'skill' && !selectedSkill) {
                    setShowSkillMenu(true)
                    return
                  }
                  executePlayerAction()
                  setShowSkillMenu(false)
                }}
              >
                {selectedAction === 'attack' ? '⚔️ 执行攻击' :
                 selectedAction === 'skill' ? `✨ 释放 ${selectedSkill?.name || '魂技'}` :
                 selectedAction === 'defend' ? '🛡️ 执行防御' :
                 selectedAction === 'flee' ? '🏃 尝试逃跑' :
                 selectedAction === 'item' ? '🧪 使用道具' : '▶ 执行'}
              </DlButton>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-1">
            <p className="text-text-muted text-hud-sm animate-pulse">
              {currentActor?.name || '敌人'} 行动中...
            </p>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-text-disabled animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 魂技子菜单 */}
      {showSkillMenu && (
        <SkillMenu
          skills={availableSkills}
          selectedSkill={selectedSkill}
          onSelect={(s) => selectSkill(s)}
          onClose={() => setShowSkillMenu(false)}
          currentMp={playerUnit?.stats.mp ?? 0}
        />
      )}
    </div>
  )
}
