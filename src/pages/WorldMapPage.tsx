import { Routes, Route, useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import DlButton from '@components/atoms/DlButton'
import RegionDetail from './world/RegionDetail'
import QuestLog from './world/QuestLog'
import AchievementHall from './world/AchievementHall'
import CollectionBook from './world/CollectionBook'
import { worldRegions } from './world/worldData'

function WorldOverview() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)

  const playerLevel = player?.level ?? 0

  return (
    <div className="p-4">
      <h1 className="text-hud-xl font-bold text-text-primary mb-4">斗罗大陆</h1>
      <div className="grid grid-cols-2 gap-3">
        {worldRegions.map((region) => {
          const unlocked = playerLevel >= region.minLevel
          return (
            <button
              key={region.id}
              disabled={!unlocked}
              onClick={() => navigate(`/world/region/${region.id}`)}
              className={`p-4 rounded-hud-lg border text-left transition-all ${
                unlocked
                  ? 'bg-surface-elevated border-text-disabled/30 hover:border-accent-gold/40 active:scale-95'
                  : 'bg-surface-base border-text-disabled/10 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{region.icon}</span>
                <p className="text-hud-base font-bold text-text-primary">{region.name}</p>
              </div>
              <p className="text-hud-xs text-text-muted">第{region.chapter}章 · Lv.{region.minLevel}</p>
              <p className="text-hud-xs text-text-secondary mt-1">{region.theme}</p>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <DlButton variant="ghost" onClick={() => navigate('/world/quests')}>
          📋 任务日志
        </DlButton>
        <DlButton variant="ghost" onClick={() => navigate('/world/achievements')}>
          🏆 成就殿堂
        </DlButton>
        <DlButton variant="ghost" onClick={() => navigate('/world/collection')}>
          📖 图鉴
        </DlButton>
      </div>
    </div>
  )
}

export default function WorldMapPage() {
  return (
    <Routes>
      <Route index element={<WorldOverview />} />
      <Route path="region/:regionId" element={<RegionDetail />} />
      <Route path="quests" element={<QuestLog />} />
      <Route path="achievements" element={<AchievementHall />} />
      <Route path="collection" element={<CollectionBook />} />
    </Routes>
  )
}