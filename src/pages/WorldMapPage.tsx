import { Routes, Route, useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import DlButton from '@components/atoms/DlButton'

function WorldOverview() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)

  const regions = [
    { id: 'shenghun', name: '圣魂村', unlocked: true, chapter: 1 },
    { id: 'nuoding', name: '诺丁城', unlocked: (player?.level ?? 0) >= 5, chapter: 1 },
    { id: 'shrek', name: '史莱克学院', unlocked: (player?.level ?? 0) >= 10, chapter: 2 },
    { id: 'suotuo', name: '索托城', unlocked: (player?.level ?? 0) >= 20, chapter: 3 },
    { id: 'tiandou', name: '天斗城', unlocked: (player?.level ?? 0) >= 30, chapter: 4 },
    { id: 'wuhun', name: '武魂城', unlocked: (player?.level ?? 0) >= 40, chapter: 5 },
    { id: 'shalu', name: '杀戮之都', unlocked: (player?.level ?? 0) >= 51, chapter: 6 },
    { id: 'haishen', name: '海神岛', unlocked: (player?.level ?? 0) >= 65, chapter: 7 },
    { id: 'jialing', name: '嘉陵关', unlocked: (player?.level ?? 0) >= 81, chapter: 8 },
  ]

  return (
    <div className="p-4">
      <h1 className="text-hud-xl font-bold text-text-primary mb-4">斗罗大陆</h1>
      <div className="grid grid-cols-2 gap-3">
        {regions.map((region) => (
          <button
            key={region.id}
            disabled={!region.unlocked}
            onClick={() => navigate(`/world/region/${region.id}`)}
            className={`p-4 rounded-hud-lg border text-left transition-all ${
              region.unlocked
                ? 'bg-surface-elevated border-text-disabled/30 hover:border-accent-gold/40 active:scale-95'
                : 'bg-surface-base border-text-disabled/10 opacity-40 cursor-not-allowed'
            }`}
          >
            <p className="text-hud-base font-bold text-text-primary">{region.name}</p>
            <p className="text-hud-xs text-text-muted mt-1">第{region.chapter}章</p>
          </button>
        ))}
      </div>

      {/* 任务入口 */}
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

function RegionPlaceholder() {
  return (
    <div className="p-4">
      <p className="text-text-secondary">区域详情（开发中）</p>
    </div>
  )
}

export default function WorldMapPage() {
  return (
    <Routes>
      <Route index element={<WorldOverview />} />
      <Route path="region/:regionId" element={<RegionPlaceholder />} />
      <Route path="quests" element={<div className="p-4"><p className="text-text-secondary">任务日志（开发中）</p></div>} />
      <Route path="achievements" element={<div className="p-4"><p className="text-text-secondary">成就殿堂（开发中）</p></div>} />
      <Route path="collection" element={<div className="p-4"><p className="text-text-secondary">图鉴（开发中）</p></div>} />
    </Routes>
  )
}