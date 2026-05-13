import { Routes, Route, useNavigate } from 'react-router-dom'

const socialEntries = [
  { path: 'chat', label: '聊天', icon: '💬', desc: '世界/公会/队伍/私聊' },
  { path: 'friends', label: '好友', icon: '👤', desc: '好友列表与羁绊值' },
  { path: 'guild', label: '公会', icon: '🏰', desc: '宗门首页与公会战' },
  { path: 'mail', label: '邮件', icon: '✉️', desc: '系统/玩家/战斗报告' },
  { path: 'leaderboard', label: '排行榜', icon: '🏅', desc: '战力/等级/财富六榜' },
]

function SocialOverview() {
  const navigate = useNavigate()

  return (
    <div className="p-4">
      <h1 className="text-hud-xl font-bold text-text-primary mb-4">社交</h1>
      <div className="space-y-2">
        {socialEntries.map((entry) => (
          <button
            key={entry.path}
            onClick={() => navigate(entry.path)}
            className="w-full p-4 bg-surface-elevated rounded-hud border border-text-disabled/20 hover:border-accent-gold/30 text-left transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{entry.icon}</span>
              <div>
                <p className="text-hud-base font-bold text-text-primary">{entry.label}</p>
                <p className="text-hud-xs text-text-muted mt-0.5">{entry.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function SocialPage() {
  return (
    <Routes>
      <Route index element={<SocialOverview />} />
      <Route path="chat" element={<div className="p-4"><p className="text-text-secondary">聊天（开发中）</p></div>} />
      <Route path="friends" element={<div className="p-4"><p className="text-text-secondary">好友（开发中）</p></div>} />
      <Route path="guild" element={<div className="p-4"><p className="text-text-secondary">公会（开发中）</p></div>} />
      <Route path="mail" element={<div className="p-4"><p className="text-text-secondary">邮件（开发中）</p></div>} />
      <Route path="leaderboard" element={<div className="p-4"><p className="text-text-secondary">排行榜（开发中）</p></div>} />
    </Routes>
  )
}