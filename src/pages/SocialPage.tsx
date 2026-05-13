import { Routes, Route, useNavigate } from 'react-router-dom'
import ChatPanel from './social/ChatPanel'
import FriendsPanel from './social/FriendsPanel'
import GuildPanel from './social/GuildPanel'
import MailPanel from './social/MailPanel'
import LeaderboardPanel from './social/LeaderboardPanel'

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
      <Route path="chat" element={<ChatPanel />} />
      <Route path="friends" element={<FriendsPanel />} />
      <Route path="guild" element={<GuildPanel />} />
      <Route path="mail" element={<MailPanel />} />
      <Route path="leaderboard" element={<LeaderboardPanel />} />
    </Routes>
  )
}