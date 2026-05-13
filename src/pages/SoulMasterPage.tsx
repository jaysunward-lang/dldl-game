import { Routes, Route, useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import DlProgressBar from '@components/atoms/DlProgressBar'

function SoulMasterOverview() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  if (!player) return null

  const { name, level, title, wuhun, stats, spiritRealm, spiritValue } = player

  const subPages = [
    { path: 'wuhun', label: '武魂', desc: wuhun.name },
    { path: 'soul-rings', label: '魂环', desc: `${wuhun.soulRings.length}/9` },
    { path: 'soul-bones', label: '魂骨', desc: '六部位' },
    { path: 'hidden-weapons', label: '暗器', desc: '暗器装备' },
    { path: 'domain', label: '领域', desc: '未觉醒' },
    { path: 'true-form', label: '武魂真身', desc: 'Lv.70解锁' },
    { path: 'backpack', label: '背包', desc: '物品管理' },
    { path: 'attributes', label: '属性', desc: '详细数值' },
  ]

  return (
    <div className="p-4">
      {/* 角色卡片 */}
      <div className="hud-card p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-surface-field flex items-center justify-center text-xl">
            {name[0]}
          </div>
          <div>
            <p className="text-hud-lg font-bold text-text-primary">{name}</p>
            <p className="text-hud-sm text-text-secondary">
              Lv.{level} · {title} · {spiritRealm}
            </p>
          </div>
        </div>
        <DlProgressBar value={stats.hp} max={stats.maxHp} color="hp" size="md" showLabel />
        <div className="mt-1.5">
          <DlProgressBar value={stats.mp} max={stats.maxMp} color="mp" size="sm" showLabel />
        </div>
      </div>

      {/* 子页面入口 */}
      <div className="grid grid-cols-2 gap-2">
        {subPages.map((page) => (
          <button
            key={page.path}
            onClick={() => navigate(page.path)}
            className="p-3 bg-surface-elevated rounded-hud border border-text-disabled/20 hover:border-accent-gold/30 text-left transition-all active:scale-95"
          >
            <p className="text-hud-sm font-bold text-text-primary">{page.label}</p>
            <p className="text-hud-xs text-text-muted mt-0.5">{page.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function SoulMasterPage() {
  return (
    <Routes>
      <Route index element={<SoulMasterOverview />} />
      <Route path="wuhun" element={<div className="p-4"><p className="text-text-secondary">武魂详情（开发中）</p></div>} />
      <Route path="soul-rings" element={<div className="p-4"><p className="text-text-secondary">魂环管理（开发中）</p></div>} />
      <Route path="soul-bones" element={<div className="p-4"><p className="text-text-secondary">魂骨系统（开发中）</p></div>} />
      <Route path="hidden-weapons" element={<div className="p-4"><p className="text-text-secondary">暗器系统（开发中）</p></div>} />
      <Route path="domain" element={<div className="p-4"><p className="text-text-secondary">领域系统（开发中）</p></div>} />
      <Route path="true-form" element={<div className="p-4"><p className="text-text-secondary">武魂真身（开发中）</p></div>} />
      <Route path="backpack" element={<div className="p-4"><p className="text-text-secondary">背包（开发中）</p></div>} />
      <Route path="attributes" element={<div className="p-4"><p className="text-text-secondary">属性面板（开发中）</p></div>} />
    </Routes>
  )
}