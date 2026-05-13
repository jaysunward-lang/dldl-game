import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const initialSocialState = {
  readMailIds: [] as string[],
  claimedMailIds: [] as string[],
  friendGiftRecords: {} as Record<string, string>,
  guildCheckInDay: null as string | null,
}

interface SocialState {
  readMailIds: string[]
  claimedMailIds: string[]
  friendGiftRecords: Record<string, string>
  guildCheckInDay: string | null

  markMailRead: (mailId: string) => void
  claimMail: (mailId: string) => boolean
  markFriendGifted: (friendId: string) => boolean
  checkInGuild: () => boolean
  resetSocial: () => void
}

export function getSocialTodayKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const useSocialStore = create<SocialState>()(
  persist(
    immer((set, get) => ({
      ...initialSocialState,

      markMailRead: (mailId) =>
        set((s) => {
          if (s.readMailIds.includes(mailId)) return
          s.readMailIds.push(mailId)
        }),

      claimMail: (mailId) => {
        const state = get()
        if (state.claimedMailIds.includes(mailId)) return false
        set((s) => {
          if (!s.claimedMailIds.includes(mailId)) {
            s.claimedMailIds.push(mailId)
          }
          if (!s.readMailIds.includes(mailId)) {
            s.readMailIds.push(mailId)
          }
        })
        return true
      },

      markFriendGifted: (friendId) => {
        const today = getSocialTodayKey()
        if (get().friendGiftRecords[friendId] === today) return false
        set((s) => {
          s.friendGiftRecords[friendId] = today
        })
        return true
      },

      checkInGuild: () => {
        const today = getSocialTodayKey()
        if (get().guildCheckInDay === today) return false
        set((s) => {
          s.guildCheckInDay = today
        })
        return true
      },

      resetSocial: () =>
        set((s) => {
          if (
            s.readMailIds.length === 0
            && s.claimedMailIds.length === 0
            && Object.keys(s.friendGiftRecords).length === 0
            && s.guildCheckInDay === null
          ) return
          s.readMailIds = []
          s.claimedMailIds = []
          s.friendGiftRecords = {}
          s.guildCheckInDay = null
        }),
    })),
    {
      name: 'dldl-social-storage',
      version: 1,
      migrate: (persistedState: unknown, _version: number) => {
        return {
          ...initialSocialState,
          ...(persistedState as Partial<SocialState> | null),
        }
      },
    },
  )
)
