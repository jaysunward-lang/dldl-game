// ============================================================
// 斗罗大陆 · 战斗状态管理
// 10状态战斗状态机 + 引擎驱动 + 回合编排
// ============================================================
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  BattleState, BattleUnit, BattleLog, LogEntry,
  BattleAction, Skill, Buff, Debuff,
} from '@types'
import {
  createPlayerUnit, generateEnemies, sortActionOrder,
  checkBattleEnd, executeBasicAttack, executeSkill,
  executeDefend, executeFlee, startRound, endRound,
  executeEnemyAI, generateBattleLoot, resetUnitCounter,
  type BattleEvent, type BattleResult,
} from '@engine/battleEngine'
import { getSkillsByWuhunType, getAvailableSkills, setSkillOnCooldown } from '@engine/skillDefinitions'
import type { LootTable } from '@engine/lootSystem'
import type { Player } from '@types'

// ---- Store State ----
interface BattleStoreState {
  // 状态机
  state: BattleState
  round: number
  maxRounds: number

  // 单位
  playerUnits: BattleUnit[]
  enemyUnits: BattleUnit[]
  actionOrder: string[]
  currentActorIndex: number

  // 玩家输入
  selectedAction: BattleAction | null
  selectedSkill: Skill | null
  selectedTarget: string | null
  playerSkills: Skill[]

  // 战斗日志
  logs: BattleLog[]
  pendingEvents: BattleEvent[]  // 当前动作产生的事件（UI动画用）

  // 战斗状态
  comboCount: number
  isPlayerTurn: boolean
  consecutiveFlees: number
  fledSuccess: boolean
  isBossFight: boolean
  dungeonType: string

  // 结算
  battleResult: BattleResult | null
  loot: LootTable | null

  // ---- Actions ----
  initBattle: (player: Player, dungeonType: string) => void
  setState: (state: BattleState) => void
  selectAction: (action: BattleAction) => void
  selectSkill: (skill: Skill | null) => void
  selectTarget: (unitId: string | null) => void
  executePlayerAction: () => void
  executeAITurn: () => void
  advanceToNextActor: () => void
  clearPendingEvents: () => void
  endBattle: (result: BattleResult) => void
  resetBattle: () => void
}

// ---- Store Implementation ----
export const useBattleStore = create<BattleStoreState>()(
  immer((set, get) => ({
    state: 'idle',
    round: 0,
    maxRounds: 100,
    playerUnits: [],
    enemyUnits: [],
    actionOrder: [],
    currentActorIndex: 0,
    selectedAction: null,
    selectedSkill: null,
    selectedTarget: null,
    playerSkills: [],
    logs: [],
    pendingEvents: [],
    comboCount: 0,
    isPlayerTurn: false,
    consecutiveFlees: 0,
    fledSuccess: false,
    isBossFight: false,
    dungeonType: '',
    battleResult: null,
    loot: null,

    // ===== 初始化战斗 =====
    initBattle: (player, dungeonType) =>
      set((s) => {
        resetUnitCounter()
        s.state = 'init'
        s.round = 0
        s.maxRounds = 100
        s.consecutiveFlees = 0
        s.fledSuccess = false
        s.comboCount = 0
        s.battleResult = null
        s.loot = null
        s.dungeonType = dungeonType
        s.pendingEvents = []

        // 创建玩家单位
        const playerUnit = createPlayerUnit(player.name, player.level, {
          ...player.stats,
          constitution: player.stats.constitution ?? 30 + player.level * 6,
          strength: player.stats.strength ?? 25 + player.level * 5,
          agility: player.stats.agility ?? 15 + player.level * 3,
          intelligence: player.stats.intelligence ?? 20 + player.level * 4,
        })

        // 加载玩家魂技
        s.playerSkills = getSkillsByWuhunType(player.wuhun.type)
        s.playerUnits = [playerUnit]

        // 生成敌人
        s.enemyUnits = generateEnemies(dungeonType, player.level)
        s.isBossFight = s.enemyUnits.some((e) => e.isBoss)

        // 第一回合开始（含 DOT 判定、行动排序、回合开始事件）
        s.round = 1
        const roundEvents = startRound(s.playerUnits, s.enemyUnits, s.round)
        s.pendingEvents = roundEvents.events
        s.actionOrder = roundEvents.actionOrder
        s.currentActorIndex = 0
        s.isPlayerTurn = s.actionOrder.length > 0
          && s.playerUnits.some((p) => p.id === s.actionOrder[0] && p.alive)

        // 初始化日志
        s.logs = [{
          round: 0,
          entries: [{ actor: '系统', action: `进入战斗！副本：${dungeonType}`, type: 'system' }],
        }]

        s.state = s.isPlayerTurn ? 'actionSelect' : 'actionExec'
      }),

    setState: (state) => set((s) => { s.state = state }),

    // ===== 玩家选择操作 =====
    selectAction: (action) =>
      set((s) => {
        s.selectedAction = action
        if (action === 'attack') {
          s.selectedSkill = null
        }
        if (action === 'defend') {
          s.selectedSkill = null
          s.selectedTarget = null
        }
        if (action === 'flee') {
          s.selectedSkill = null
          s.selectedTarget = null
        }
      }),

    selectSkill: (skill) =>
      set((s) => {
        s.selectedSkill = skill
        if (skill) {
          s.selectedAction = 'skill'
        }
      }),

    selectTarget: (unitId) =>
      set((s) => {
        s.selectedTarget = unitId
      }),

    // ===== 执行玩家操作 =====
    executePlayerAction: () =>
      set((s) => {
        const { selectedAction, selectedSkill, selectedTarget, playerUnits, enemyUnits } = s
        if (!selectedAction) return

        const playerUnit = playerUnits.find((u) => u.alive)
        if (!playerUnit) return

        const events: BattleEvent[] = []
        s.state = 'actionExec'

        switch (selectedAction) {
          case 'attack': {
            const targetId = selectedTarget || enemyUnits.find((e) => e.alive)?.id
            const target = enemyUnits.find((e) => e.id === targetId)
            if (!target) break

            const result = executeBasicAttack(playerUnit, target)
            events.push(...result.events)
            s.comboCount += 1
            break
          }

          case 'skill': {
            if (!selectedSkill) break
            if (playerUnit.stats.mp < selectedSkill.mpCost) break

            const targetId = selectedTarget || enemyUnits.find((e) => e.alive)?.id
            const target = enemyUnits.find((e) => e.id === targetId)
            if (!target && selectedSkill.target !== 'self') break

            const result = executeSkill(
              playerUnit,
              target || playerUnit,
              selectedSkill,
              enemyUnits,
              playerUnits,
            )
            events.push(...result.events)
            setSkillOnCooldown(selectedSkill)
            break
          }

          case 'defend': {
            const result = executeDefend(playerUnit)
            events.push(...result.events)
            break
          }

          case 'flee': {
            const result = executeFlee(playerUnit, enemyUnits, s.consecutiveFlees + 1)
            events.push(...result.events)
            if (result.success) {
              s.fledSuccess = true
              s.battleResult = 'player_lose'
              s.state = 'result'
              s.pendingEvents = events
              s.selectedAction = null
              s.selectedSkill = null
              s.selectedTarget = null
              return
            } else {
              s.consecutiveFlees += 1
            }
            break
          }

          case 'item': {
            events.push({
              type: 'system', actorId: playerUnit.id, actorName: playerUnit.name,
              message: '道具系统尚未开放',
            })
            break
          }
        }

        // 检查战斗结束
        const result = checkBattleEnd(playerUnits, enemyUnits)
        s.battleResult = result === 'ongoing' ? null : result

        // 记录战斗日志
        const logEntries: LogEntry[] = events.map((e) => ({
          actor: e.actorName,
          action: e.message,
          target: e.targetName,
          value: e.value,
          type: e.type as LogEntry['type'],
          isCrit: e.type === 'crit',
        }))
        s.logs.push({ round: s.round, entries: logEntries })

        s.pendingEvents = events
        s.selectedAction = null
        s.selectedSkill = null
        s.selectedTarget = null

        if (result !== 'ongoing') {
          s.state = 'result'
          if (result === 'player_win') {
            s.loot = generateBattleLoot(enemyUnits, 1.0, s.isBossFight)
            s.state = 'reward'
          }
        } else {
          s.state = 'actionPost'
        }
      }),

    // ===== 执行AI回合 =====
    executeAITurn: () =>
      set((s) => {
        const currentId = s.actionOrder[s.currentActorIndex]
        const enemy = s.enemyUnits.find((e) => e.id === currentId && e.alive)
        if (!enemy) return

        const events: BattleEvent[] = []

        // AI决策
        const aiResult = executeEnemyAI(enemy, s.playerUnits, s.enemyUnits)
        let target: BattleUnit | undefined

        if (aiResult.action === 'defend') {
          const result = executeDefend(enemy)
          events.push(...result.events)
        } else {
          target = s.playerUnits.find((u) => u.id === aiResult.targetId && u.alive)
          if (!target) target = s.playerUnits.find((u) => u.alive)
          if (!target) return

          const result = executeBasicAttack(enemy, target)
          events.push(...result.events)
        }

        // 检查战斗结束
        const result = checkBattleEnd(s.playerUnits, s.enemyUnits)
        s.battleResult = result === 'ongoing' ? null : result

        // 记录日志
        const logEntries: LogEntry[] = events.map((e) => ({
          actor: e.actorName,
          action: e.message,
          target: e.targetName,
          value: e.value,
          type: e.type as LogEntry['type'],
          isCrit: e.type === 'crit',
        }))
        s.logs.push({ round: s.round, entries: logEntries })

        s.pendingEvents = events

        if (result !== 'ongoing') {
          s.state = 'result'
          if (result === 'player_win') {
            s.loot = generateBattleLoot(s.enemyUnits, 1.0, s.isBossFight)
            s.state = 'reward'
          }
        } else {
          s.state = 'actionPost'
        }
      }),

    // ===== 推进到下一个行动者 =====
    advanceToNextActor: () =>
      set((s) => {
        // 找下一个存活行动者
        let nextIndex = (s.currentActorIndex + 1) % s.actionOrder.length
        let attempts = 0

        while (attempts < s.actionOrder.length) {
          const nextId = s.actionOrder[nextIndex]
          const unit = [...s.playerUnits, ...s.enemyUnits].find((u) => u.id === nextId)
          if (unit && unit.alive) break
          nextIndex = (nextIndex + 1) % s.actionOrder.length
          attempts++
        }

        // 如果绕了一圈（nextIndex ∈ [0, currentActorIndex]），回合结束
        if (nextIndex <= s.currentActorIndex) {
          // 回合结束
          const endEvents = endRound(s.playerUnits, s.enemyUnits, s.playerSkills)
          s.pendingEvents = endEvents.events
          s.round += 1

          // 回合上限
          if (s.round > s.maxRounds) {
            s.state = 'result'
            s.battleResult = 'player_lose'
            return
          }

          // 新回合开始
          const roundEvents = startRound(s.playerUnits, s.enemyUnits, s.round)
          s.pendingEvents = [...s.pendingEvents, ...roundEvents.events]
          s.actionOrder = roundEvents.actionOrder
          s.currentActorIndex = 0

          // 检查战斗结束
          const result = checkBattleEnd(s.playerUnits, s.enemyUnits)
          if (result !== 'ongoing') {
            s.battleResult = result
            s.state = 'result'
            if (result === 'player_win') {
              s.loot = generateBattleLoot(s.enemyUnits, 1.0, s.isBossFight)
              s.state = 'reward'
            }
            return
          }

          s.isPlayerTurn = s.playerUnits.some((p) => p.id === s.actionOrder[0] && p.alive)
        } else {
          s.currentActorIndex = nextIndex
          const currentId = s.actionOrder[nextIndex]
          s.isPlayerTurn = s.playerUnits.some((p) => p.id === currentId && p.alive)
        }

        s.state = s.isPlayerTurn ? 'actionSelect' : 'actionExec'
      }),

    clearPendingEvents: () =>
      set((s) => { s.pendingEvents = [] }),

    endBattle: (result) =>
      set((s) => {
        s.battleResult = result
        s.state = result === 'player_win' ? 'reward' : 'result'
      }),

    // ===== 重置 =====
    resetBattle: () =>
      set((s) => {
        s.state = 'idle'
        s.round = 0
        s.actionOrder = []
        s.currentActorIndex = 0
        s.playerUnits = []
        s.enemyUnits = []
        s.selectedAction = null
        s.selectedSkill = null
        s.selectedTarget = null
        s.playerSkills = []
        s.logs = []
        s.pendingEvents = []
        s.comboCount = 0
        s.isPlayerTurn = false
        s.consecutiveFlees = 0
        s.fledSuccess = false
        s.isBossFight = false
        s.dungeonType = ''
        s.battleResult = null
        s.loot = null
      }),
  }))
)
