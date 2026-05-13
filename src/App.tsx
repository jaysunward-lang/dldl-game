import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@components/templates/MainLayout'
import BattleLayout from '@components/templates/BattleLayout'

import LoginPage from '@pages/LoginPage'
import WorldMapPage from '@pages/WorldMapPage'
import SoulMasterPage from '@pages/SoulMasterPage'
import BattleListPage from '@pages/BattleListPage'
import SocialPage from '@pages/SocialPage'
import TradePage from '@pages/TradePage'
import BattleScenePage from '@pages/BattleScenePage'

export default function App() {
  return (
    <Routes>
      {/* 登录/角色创建：独立全屏，不套MainLayout */}
      <Route path="/login" element={<LoginPage />} />

      {/* 主布局：底部Tab五入口 */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/world" replace />} />
        <Route path="world/*" element={<WorldMapPage />} />
        <Route path="soul-master/*" element={<SoulMasterPage />} />
        <Route path="battle/*" element={<BattleListPage />} />
        <Route path="social/*" element={<SocialPage />} />
        <Route path="trade/*" element={<TradePage />} />
      </Route>

      {/* 战斗场景：独立全屏层 */}
      <Route path="/battle-scene/:dungeonId" element={<BattleLayout />}>
        <Route index element={<BattleScenePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/world" replace />} />
    </Routes>
  )
}