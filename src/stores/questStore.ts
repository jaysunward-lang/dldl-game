import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Quest, QuestStatus, QuestObjective } from '@types'

interface QuestState {
  quests: Record<string, Quest>
  activeQuests: string[]
  trackedQuests: string[]  // 最多3个
  completedQuests: string[]
  dailyQuests: string[]
  dailyRefreshTime: number

  // Actions
  loadQuests: (quests: Quest[]) => void
  acceptQuest: (questId: string) => void
  updateObjective: (questId: string, objectiveId: string, progress: number) => void
  completeQuest: (questId: string) => void
  abandonQuest: (questId: string) => void
  trackQuest: (questId: string) => void
  untrackQuest: (questId: string) => void
  refreshDailyQuests: (questIds: string[]) => void
  getQuestById: (questId: string) => Quest | undefined
  getActiveQuests: () => Quest[]
}

export const useQuestStore = create<QuestState>()(
  persist(
    immer((set, get) => ({
      quests: {},
      activeQuests: [],
      trackedQuests: [],
      completedQuests: [],
      dailyQuests: [],
      dailyRefreshTime: 0,

      loadQuests: (quests) =>
        set((s) => {
          quests.forEach((q) => {
            s.quests[q.id] = q
          })
        }),

      acceptQuest: (questId) =>
        set((s) => {
          const quest = s.quests[questId]
          if (!quest || s.activeQuests.includes(questId)) return
          quest.status = 'active'
          s.activeQuests.push(questId)
        }),

      updateObjective: (questId, objectiveId, progress) =>
        set((s) => {
          const quest = s.quests[questId]
          if (!quest) return
          const obj = quest.objectives.find((o) => o.id === objectiveId)
          if (!obj) return
          obj.current = Math.min(obj.required, progress)
        }),

      completeQuest: (questId) =>
        set((s) => {
          const quest = s.quests[questId]
          if (!quest) return
          quest.status = 'completed'
          s.activeQuests = s.activeQuests.filter((id) => id !== questId)
          s.trackedQuests = s.trackedQuests.filter((id) => id !== questId)
          if (!s.completedQuests.includes(questId)) {
            s.completedQuests.push(questId)
          }
        }),

      abandonQuest: (questId) =>
        set((s) => {
          const quest = s.quests[questId]
          if (!quest || quest.type === 'main') return  // 主线不可放弃
          quest.status = 'available'
          quest.objectives.forEach((o) => { o.current = 0 })
          s.activeQuests = s.activeQuests.filter((id) => id !== questId)
          s.trackedQuests = s.trackedQuests.filter((id) => id !== questId)
        }),

      trackQuest: (questId) =>
        set((s) => {
          if (s.trackedQuests.includes(questId)) return
          if (s.trackedQuests.length >= 3) {
            s.trackedQuests.shift()
          }
          s.trackedQuests.push(questId)
        }),

      untrackQuest: (questId) =>
        set((s) => {
          s.trackedQuests = s.trackedQuests.filter((id) => id !== questId)
        }),

      refreshDailyQuests: (questIds) =>
        set((s) => {
          s.dailyQuests = questIds
          s.dailyRefreshTime = Date.now()
        }),

      getQuestById: (questId) => get().quests[questId],

      getActiveQuests: () => {
        const s = get()
        return s.activeQuests.map((id) => s.quests[id]).filter(Boolean)
      },
    })),
    {
      name: 'dldl-quest-storage',
      version: 1,
      partialize: (state) => ({
        quests: state.quests,
        activeQuests: state.activeQuests,
        trackedQuests: state.trackedQuests,
        completedQuests: state.completedQuests,
        dailyQuests: state.dailyQuests,
        dailyRefreshTime: state.dailyRefreshTime,
      }),
    }
  )
)