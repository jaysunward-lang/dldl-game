import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore, useQuestStore } from '@stores'
import DlButton from '@components/atoms/DlButton'
import DlProgressBar from '@components/atoms/DlProgressBar'
import type { InventoryItem, Quest, QuestType } from '@types'
import { questSeed, rewardItemToInventory } from './worldData'

type QuestTab = QuestType | 'all' | 'active' | 'completed'

const tabs: { id: QuestTab; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'main', label: '主线' },
  { id: 'side', label: '支线' },
  { id: 'daily', label: '每日' },
  { id: 'active', label: '进行中' },
  { id: 'completed', label: '已完成' },
]

const typeMeta: Record<QuestType, { label: string; color: string }> = {
  main: { label: '主线', color: 'text-accent-gold border-accent-gold/30 bg-accent-gold/10' },
  side: { label: '支线', color: 'text-rarity-blue border-rarity-blue/30 bg-rarity-blue/10' },
  daily: { label: '每日', color: 'text-accent-emerald border-accent-emerald/30 bg-accent-emerald/10' },
  weekly: { label: '每周', color: 'text-rarity-purple border-rarity-purple/30 bg-rarity-purple/10' },
  hidden: { label: '隐藏', color: 'text-rarity-red border-rarity-red/30 bg-rarity-red/10' },
}

const statusLabel = {
  locked: '未解锁',
  available: '可接取',
  active: '进行中',
  completed: '已完成',
} as const

function QuestCard({ quest, onAccept, onTrack, onUntrack, onProgress, onClaim, tracked }: {
  quest: Quest
  tracked: boolean
  onAccept: (quest: Quest) => void
  onTrack: (questId: string) => void
  onUntrack: (questId: string) => void
  onProgress: (quest: Quest) => void
  onClaim: (quest: Quest) => void
}) {
  const done = quest.objectives.every((obj) => obj.current >= obj.required)
  const current = quest.objectives.reduce((sum, obj) => sum + Math.min(obj.current, obj.required), 0)
  const required = quest.objectives.reduce((sum, obj) => sum + obj.required, 0)
  const percentText = required > 0 ? `${Math.round((current / required) * 100)}%` : '0%'

  return (
    <div className="hud-card p-3">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-hud-base font-bold text-text-primary">{quest.name}</p>
            <span className={`text-hud-xs px-2 py-0.5 rounded-hud border ${typeMeta[quest.type].color}`}>
              {typeMeta[quest.type].label}
            </span>
            <span className="text-hud-xs text-text-muted">{statusLabel[quest.status]}</span>
          </div>
          <p className="text-hud-xs text-text-muted mt-1">第{quest.chapter}章 · 推荐 Lv.{quest.recommendedLevel}</p>
        </div>
        {tracked && <span className="text-hud-xs text-accent-gold whitespace-nowrap">追踪中</span>}
      </div>

      <p className="text-hud-sm text-text-secondary leading-relaxed mb-3">{quest.description}</p>

      <div className="space-y-2 mb-3">
        {quest.objectives.map((obj) => (
          <div key={obj.id}>
            <div className="flex justify-between text-hud-xs mb-1">
              <span className="text-text-secondary">{obj.description}</span>
              <span className={obj.current >= obj.required ? 'text-accent-emerald' : 'text-text-muted'}>
                {obj.current}/{obj.required}
              </span>
            </div>
            <DlProgressBar value={obj.current} max={obj.required} color="exp" size="sm" />
          </div>
        ))}
      </div>

      <div className="bg-surface-field rounded-hud p-2 mb-3 text-hud-xs text-text-secondary">
        <p className="font-bold text-text-primary mb-1">奖励</p>
        <div className="flex flex-wrap gap-2">
          <span>EXP {quest.rewards.exp}</span>
          <span>金币 {quest.rewards.gold}</span>
          {quest.rewards.items?.map((item) => <span key={item.id}>{item.name} ×{item.quantity}</span>)}
          {quest.rewards.unlockFeature && <span>解锁：{quest.rewards.unlockFeature}</span>}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {quest.status === 'available' && (
          <DlButton size="sm" variant="primary" onClick={() => onAccept(quest)}>
            接取任务
          </DlButton>
        )}
        {quest.status === 'active' && (
          <>
            <DlButton size="sm" variant="skill" disabled={done} onClick={() => onProgress(quest)}>
              推进目标
            </DlButton>
            <DlButton size="sm" variant="primary" disabled={!done} onClick={() => onClaim(quest)}>
              领取奖励
            </DlButton>
            <DlButton size="sm" variant="ghost" onClick={() => tracked ? onUntrack(quest.id) : onTrack(quest.id)}>
              {tracked ? '取消追踪' : '追踪'}
            </DlButton>
          </>
        )}
        {quest.status === 'completed' && <span className="text-hud-xs text-accent-emerald self-center">已完成 · {percentText}</span>}
        {quest.status === 'locked' && <span className="text-hud-xs text-text-muted self-center">完成前置任务后解锁</span>}
      </div>
    </div>
  )
}

export default function QuestLog() {
  const navigate = useNavigate()
  const addExp = usePlayerStore((s) => s.addExp)
  const addGold = usePlayerStore((s) => s.addGold)
  const addItems = usePlayerStore((s) => s.addItems)
  const unlockAchievement = usePlayerStore((s) => s.unlockAchievement)
  const loadQuests = useQuestStore((s) => s.loadQuests)
  const acceptQuest = useQuestStore((s) => s.acceptQuest)
  const updateObjective = useQuestStore((s) => s.updateObjective)
  const completeQuest = useQuestStore((s) => s.completeQuest)
  const trackQuest = useQuestStore((s) => s.trackQuest)
  const untrackQuest = useQuestStore((s) => s.untrackQuest)
  const questsRecord = useQuestStore((s) => s.quests)
  const trackedQuests = useQuestStore((s) => s.trackedQuests)
  const completedQuests = useQuestStore((s) => s.completedQuests)
  const [activeTab, setActiveTab] = useState<QuestTab>('all')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    loadQuests(questSeed)
  }, [loadQuests])

  const quests = useMemo(() => Object.values(questsRecord), [questsRecord])

  const filteredQuests = useMemo(() => {
    return quests.filter((quest) => {
      if (activeTab === 'all') return true
      if (activeTab === 'active') return quest.status === 'active'
      if (activeTab === 'completed') return quest.status === 'completed'
      return quest.type === activeTab
    })
  }, [activeTab, quests])

  const handleAccept = (quest: Quest) => {
    if (quest.status !== 'available') {
      setToast('任务尚未满足接取条件')
      return
    }

    acceptQuest(quest.id)
    trackQuest(quest.id)
    setToast('任务已接取，并加入追踪列表')
  }

  const handleProgress = (quest: Quest) => {
    const nextObjective = quest.objectives.find((obj) => obj.current < obj.required)
    if (!nextObjective) return
    updateObjective(quest.id, nextObjective.id, nextObjective.current + 1)
    setToast(`目标推进：${nextObjective.description}`)
  }

  const handleClaim = (quest: Quest) => {
    if (quest.status !== 'active') return
    const done = quest.objectives.every((obj) => obj.current >= obj.required)
    if (!done) return

    addExp(quest.rewards.exp)
    addGold(quest.rewards.gold)
    const rewardItems: InventoryItem[] = (quest.rewards.items ?? []).map(rewardItemToInventory)
    if (rewardItems.length > 0) addItems(rewardItems)
    if (quest.rewards.achievement) unlockAchievement(quest.rewards.achievement)
    if (quest.id === 'main-awakening') unlockAchievement('first-awakening')
    completeQuest(quest.id)
    setToast(`任务完成：获得 EXP ${quest.rewards.exp}、金币 ${quest.rewards.gold}`)
  }

  return (
    <div className="p-4 animate-fade-in">
      <button onClick={() => navigate('/world')} className="text-hud-sm text-text-secondary hover:text-text-primary transition-colors mb-4">
        ← 返回世界
      </button>

      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-hud-xl font-bold text-text-primary">任务日志</h2>
          <p className="text-hud-xs text-text-muted mt-1">主线、支线与每日目标统一追踪</p>
        </div>
        <div className="text-right text-hud-xs text-text-muted">
          <p>追踪 {trackedQuests.length}/3</p>
          <p>完成 {completedQuests.length}</p>
        </div>
      </div>

      {toast && (
        <div className="mb-3 p-2 rounded-hud bg-accent-gold/10 border border-accent-gold/30 text-hud-sm text-accent-gold">
          {toast}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-hud text-hud-xs whitespace-nowrap border transition-all ${
              activeTab === tab.id
                ? 'bg-accent-gold/15 border-accent-gold text-accent-gold'
                : 'bg-surface-field border-text-disabled/20 text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredQuests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            tracked={trackedQuests.includes(quest.id)}
            onAccept={handleAccept}
            onTrack={trackQuest}
            onUntrack={untrackQuest}
            onProgress={handleProgress}
            onClaim={handleClaim}
          />
        ))}
        {filteredQuests.length === 0 && (
          <div className="hud-card p-6 text-center text-text-muted text-hud-sm">暂无符合筛选条件的任务</div>
        )}
      </div>
    </div>
  )
}
