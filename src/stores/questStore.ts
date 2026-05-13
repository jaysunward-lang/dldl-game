import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Quest } from '@types'

interface QuestState {
  quests: Record<string, Quest>
  activeQuests: string[]
  trackedQuests: string[]
  completedQuests: string[]
  dailyQuests: string[]
  dailyRefreshTime: number

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
            const existing = s.quests[q.id]
            if (existing) {
              if (existing.status === 'locked' && q.status === 'available') {
                existing.status = 'available'
              }
              return
            }
            s.quests[q.id] = {
              ...q,
              objectives: q.objectives.map((objective) => ({ ...objective })),
              rewards: {
                ...q.rewards,
                items: q.rewards.items?.map((item) => ({ ...item })),
              },
              prerequisites: [...q.prerequisites],
            }
          })
        }),

      acceptQuest: (questId) =>
        set((s) => {
          const quest = s.quests[questId]
          if (!quest || quest.status === 'completed' || s.activeQuests.includes(questId)) return
          if (quest.status === 'locked' && !quest.prerequisites.every((id) => s.completedQuests.includes(id))) return
          quest.status = 'active'
          s.activeQuests.push(questId)
        }),

      updateObjective: (questId, objectiveId, progress) =>
        set((s) => {
          const quest = s.quests[questId]
          if (!quest || quest.status !== 'active') return
          const obj = quest.objectives.find((o) => o.id === objectiveId)
          if (!obj) return
          const nextProgress = Math.min(obj.required, Math.max(0, progress))
          if (obj.current === nextProgress) return
          obj.current = nextProgress
        }),

      completeQuest: (questId) =>
        set((s) => {
          const quest = s.quests[questId]
          if (!quest || quest.status !== 'active') return
          quest.status = 'completed'
          s.activeQuests = s.activeQuests.filter((id) => id !== questId)
          s.trackedQuests = s.trackedQuests.filter((id) => id !== questId)
          if (!s.completedQuests.includes(questId)) {
            s.completedQuests.push(questId)
          }
          Object.values(s.quests).forEach((candidate) => {
            if (
              candidate.status === 'locked'
              && candidate.prerequisites.every((id) => s.completedQuests.includes(id))
            ) {
              candidate.status = 'available'
            }
          })
        }),

      abandonQuest: (questId) =>
        set((s) => {
          const quest = s.quests[questId]
          if (!quest || quest.type === 'main') return
          quest.status = 'available'
          quest.objectives.forEach((o) => { o.current = 0 })
          s.activeQuests = s.activeQuests.filter((id) => id !== questId)
          s.trackedQuests = s.trackedQuests.filter((id) => id !== questId)
        }),

      trackQuest: (questId) =>
        set((s) => {
          const quest = s.quests[questId]
          if (!quest || quest.status !== 'active' || s.trackedQuests.includes(questId)) return
          if (s.trackedQuests.length >= 3) {
            s.trackedQuests.shift()
          }
          s.trackedQuests.push(questId)
        }),

      untrackQuest: (questId) =>
        set((s) => {
          if (!s.trackedQuests.includes(questId)) return
          s.trackedQuests = s.trackedQuests.filter((id) => id !== questId)
        }),

      refreshDailyQuests: (questIds) =>
        set((s) => {
          if (s.dailyQuests.length === questIds.length && s.dailyQuests.every((id, index) => id === questIds[index])) return
          s.dailyQuests = [...questIds]
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