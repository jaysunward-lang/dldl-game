import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Player, PlayerStats, WuhunInfo, GamePhase, TitleRank, SpiritRealm } from '@types'

interface PlayerState {
  player: Player | null
  isNewGame: boolean

  // Actions
  createPlayer: (name: string, wuhun: WuhunInfo) => void
  updateStats: (stats: Partial<PlayerStats>) => void
  addExp: (amount: number) => void
  addGold: (amount: number) => void
  addDiamond: (amount: number) => void
  addSoulCoin: (amount: number) => void
  spendGold: (amount: number) => boolean
  spendDiamond: (amount: number) => boolean
  spendSoulCoin: (amount: number) => boolean
  useStamina: (amount: number) => boolean
  recoverStamina: (amount: number) => void
  advancePhase: (phase: GamePhase) => void
  setActionWindows: (used: number, total: number) => void
  levelUp: () => void
  updateRelationShip: (npcId: string, delta: number) => void
  unlockAchievement: (id: string) => void
  setTitle: (title: string) => void
  resetGame: () => void
}

const initialStats: PlayerStats = {
  hp: 200, maxHp: 200,
  mp: 100, maxMp: 100,
  attack: 25, defense: 19,
  speed: 13, spirit: 58,
  constitution: 36, strength: 30,
  agility: 18, intelligence: 24,
  critRate: 5, critDmg: 150,
  dodgeRate: 3, hitRate: 95,
}

const initialPhase: GamePhase = {
  chapter: 1,
  chapterName: '觉醒之路',
  phaseIndex: 1,
  phaseName: '圣魂村·武魂觉醒',
  age: 6,
  levelCap: 10,
  unlockedFeatures: [],
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    immer((set, get) => ({
      player: null,
      isNewGame: true,

      createPlayer: (name, wuhun) =>
        set((s) => {
          s.player = {
            id: crypto.randomUUID(),
            name,
            level: 1,
            exp: 0,
            title: '魂士',
            wuhun,
            stats: { ...initialStats },
            spiritRealm: '凡境' as SpiritRealm,
            spiritValue: wuhun.quality === 'T0' ? 200 : wuhun.quality === 'T1' ? 150 : wuhun.quality === 'T2' ? 120 : 90,
            gold: 500,
            diamond: 100,
            soulCoin: 0,
            stamina: 120,
            maxStamina: 120,
            phase: { ...initialPhase },
            actionWindows: { used: 0, total: 3 },
            relationShips: {},
            achievements: [],
            currentTitle: '',
          }
          s.isNewGame = false
        }),

      updateStats: (stats) =>
        set((s) => {
          if (!s.player) return
          Object.assign(s.player.stats, stats)
        }),

      addExp: (amount) =>
        set((s) => {
          if (!s.player) return
          s.player.exp += amount
        }),

      addGold: (amount) =>
        set((s) => {
          if (!s.player) return
          s.player.gold += amount
        }),

      addDiamond: (amount) =>
        set((s) => {
          if (!s.player) return
          s.player.diamond += amount
        }),

      addSoulCoin: (amount) =>
        set((s) => {
          if (!s.player) return
          s.player.soulCoin += amount
        }),

      spendGold: (amount) => {
        const p = get().player
        if (!p || p.gold < amount) return false
        set((s) => { if (s.player) s.player.gold -= amount })
        return true
      },

      spendDiamond: (amount) => {
        const p = get().player
        if (!p || p.diamond < amount) return false
        set((s) => { if (s.player) s.player.diamond -= amount })
        return true
      },

      spendSoulCoin: (amount) => {
        const p = get().player
        if (!p || p.soulCoin < amount) return false
        set((s) => { if (s.player) s.player.soulCoin -= amount })
        return true
      },

      useStamina: (amount) => {
        const p = get().player
        if (!p || p.stamina < amount) return false
        set((s) => { if (s.player) s.player.stamina -= amount })
        return true
      },

      recoverStamina: (amount) =>
        set((s) => {
          if (!s.player) return
          s.player.stamina = Math.min(s.player.stamina + amount, s.player.maxStamina)
        }),

      advancePhase: (phase) =>
        set((s) => {
          if (!s.player) return
          s.player.phase = phase
          s.player.actionWindows = { used: 0, total: 5 }
        }),

      setActionWindows: (used, total) =>
        set((s) => {
          if (!s.player) return
          s.player.actionWindows = { used, total }
        }),

      levelUp: () =>
        set((s) => {
          if (!s.player) return
          s.player.level += 1
          // 等级成长公式（指数曲线 × 品质系数）
          const qm = s.player.wuhun.qualityMultiplier
          const lv = s.player.level
          s.player.stats.maxHp = Math.round(180 * Math.exp(0.022 * lv) * qm)
          s.player.stats.hp = s.player.stats.maxHp
          s.player.stats.maxMp = Math.round(90 * Math.exp(0.022 * lv) * qm)
          s.player.stats.mp = s.player.stats.maxMp
          s.player.stats.attack = Math.round(18 * Math.exp(0.020 * lv) * qm)
          s.player.stats.defense = Math.round(13 * Math.exp(0.020 * lv) * qm)
          s.player.stats.speed = Math.round(9 * Math.exp(0.018 * lv) * qm)
          s.player.stats.spirit = Math.round(45 * Math.exp(0.025 * lv) * qm)
          // 次要属性成长（基础值 × 指数 × 品质系数）
          s.player.stats.constitution = Math.round(30 * Math.exp(0.020 * lv) * qm)
          s.player.stats.strength = Math.round(25 * Math.exp(0.020 * lv) * qm)
          s.player.stats.agility = Math.round(15 * Math.exp(0.018 * lv) * qm)
          s.player.stats.intelligence = Math.round(20 * Math.exp(0.020 * lv) * qm)
        }),

      updateRelationShip: (npcId, delta) =>
        set((s) => {
          if (!s.player) return
          const current = s.player.relationShips[npcId] || 0
          s.player.relationShips[npcId] = current + delta
        }),

      unlockAchievement: (id) =>
        set((s) => {
          if (!s.player) return
          if (!s.player.achievements.includes(id)) {
            s.player.achievements.push(id)
          }
        }),

      setTitle: (title) =>
        set((s) => {
          if (!s.player) return
          s.player.currentTitle = title
        }),

      resetGame: () =>
        set((s) => {
          s.player = null
          s.isNewGame = true
        }),
    })),
    {
      name: 'dldl-player-storage',
      version: 1,
    }
  )
)