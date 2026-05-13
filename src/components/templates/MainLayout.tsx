import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import TopBar from '@components/organisms/TopBar'
import BottomTab from '@components/organisms/BottomTab'

const tabs = [
  { path: '/world', label: '世界', icon: '🌍' },
  { path: '/soul-master', label: '魂师', icon: '⚔️' },
  { path: '/battle', label: '战斗', icon: '⚡' },
  { path: '/social', label: '社交', icon: '👥' },
  { path: '/trade', label: '交易', icon: '💰' },
] as const

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isNewGame = usePlayerStore((s) => s.isNewGame)

  const currentTab = '/' + location.pathname.split('/')[1]

  // 新游戏 → 跳转登录页（使用 useEffect 避免 render 期间 navigate）
  useEffect(() => {
    if (isNewGame) {
      navigate('/login', { replace: true })
    }
  }, [isNewGame, navigate])

  // 新游戏时显示空白等待跳转
  if (isNewGame) {
    return (
      <div className="flex items-center justify-center h-dvh bg-surface-base">
        <p className="text-text-muted">加载中...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-dvh bg-surface-base overflow-hidden">
      {/* 顶部状态栏 */}
      <TopBar />

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>

      {/* 底部Tab导航 */}
      <BottomTab
        tabs={tabs}
        activeTab={currentTab}
        onTabChange={(path) => navigate(path)}
      />
    </div>
  )
}