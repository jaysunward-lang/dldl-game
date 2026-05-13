import { Outlet } from 'react-router-dom'
import { useBattleStore } from '@stores'

export default function BattleLayout() {
  const battleState = useBattleStore((s) => s.state)

  if (battleState === 'idle') {
    return (
      <div className="flex items-center justify-center h-dvh bg-surface-base">
        <p className="text-text-secondary">加载战斗中...</p>
      </div>
    )
  }

  return (
    <div className="h-dvh w-dvw bg-surface-base overflow-hidden">
      <Outlet />
    </div>
  )
}