import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSocialTodayKey, usePlayerStore, useSocialStore } from '@stores'
import DlButton from '@components/atoms/DlButton'
import { guildActivities, guildInfo, guildMembers } from './socialData'

export default function GuildPanel() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  const addGold = usePlayerStore((s) => s.addGold)
  const updateRelationShip = usePlayerStore((s) => s.updateRelationShip)
  const guildCheckInDay = useSocialStore((s) => s.guildCheckInDay)
  const checkInGuild = useSocialStore((s) => s.checkInGuild)
  const [toast, setToast] = useState<string | null>(null)
  const todayKey = getSocialTodayKey()

  const checkedIn = guildCheckInDay === todayKey
  const memberCount = player ? guildInfo.memberCount + 1 : guildInfo.memberCount
  const onlineMemberCount = useMemo(() => guildMembers.filter((member) => member.online).length, [])
  const contributionRank = useMemo(() => {
    const playerContribution = Math.max(0, Math.round((player?.level ?? 1) * 180 + (player?.achievements.length ?? 0) * 120))
    return [
      ...guildMembers,
      ...(player
        ? [{ id: player.id, name: player.name, level: player.level, title: player.title, position: '成员' as const, contribution: playerContribution, online: true }]
        : []),
    ].sort((a, b) => b.contribution - a.contribution)
  }, [player])

  const handleCheckIn = () => {
    if (!player) {
      setToast('请先创建角色后再参与宗门签到')
      return
    }
    const checkInSuccess = checkInGuild()
    if (!checkInSuccess) {
      setToast('今日已经完成宗门签到')
      return
    }
    addGold(300)
    updateRelationShip(guildInfo.id, 10)
    setToast('宗门签到成功：金币 +300，宗门羁绊 +10')
  }

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('..')} className="text-hud-sm text-text-secondary hover:text-text-primary transition-colors">
          ← 返回
        </button>
        <h2 className="text-hud-lg font-bold text-text-primary">公会</h2>
        <span className="ml-auto text-hud-xs text-text-muted">Lv.{guildInfo.level} 宗门</span>
      </div>

      {toast && (
        <div className="mb-3 p-2 rounded-hud bg-accent-gold/10 border border-accent-gold/30 text-hud-sm text-accent-gold">
          {toast}
        </div>
      )}

      <div className="hud-card-gold p-4 mb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-hud-lg font-bold text-text-primary">{guildInfo.name}</p>
            <p className="text-hud-xs text-text-secondary mt-1">宗主：{guildInfo.leaderName}</p>
            <p className="text-hud-xs text-text-muted mt-2 leading-relaxed">{guildInfo.announcement}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-hud-xs text-text-muted">成员</p>
            <p className="text-hud-base font-mono text-rarity-gold">{memberCount}/{guildInfo.maxMembers}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-surface-base/50 rounded-hud p-2 text-center">
            <p className="text-hud-xs text-text-muted">仓库格位</p>
            <p className="text-hud-sm font-mono text-text-primary">{guildInfo.warehouseSlots}</p>
          </div>
          <div className="bg-surface-base/50 rounded-hud p-2 text-center">
            <p className="text-hud-xs text-text-muted">在线成员</p>
            <p className="text-hud-sm font-mono text-accent-emerald">{onlineMemberCount + (player ? 1 : 0)}</p>
          </div>
          <div className="bg-surface-base/50 rounded-hud p-2 text-center">
            <p className="text-hud-xs text-text-muted">宗门羁绊</p>
            <p className="text-hud-sm font-mono text-rarity-purple">{player?.relationShips[guildInfo.id] ?? 0}</p>
          </div>
        </div>
        <div className="mt-3">
          <DlButton size="sm" variant={checkedIn ? 'ghost' : 'skill'} disabled={checkedIn} onClick={handleCheckIn}>
            {checkedIn ? '今日已签到' : '宗门签到'}
          </DlButton>
        </div>
      </div>

      <div className="hud-card p-3 mb-3">
        <p className="text-hud-sm font-bold text-text-primary mb-2">宗门活动</p>
        <div className="space-y-2">
          {guildActivities.map((activity) => (
            <div key={activity.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-hud-xs font-bold text-text-secondary">{activity.name}</span>
                <span className="text-hud-xs text-accent-gold">{activity.status}</span>
              </div>
              <div className="h-2 rounded-full bg-surface-field overflow-hidden">
                <div className="h-full rounded-full bg-rarity-purple" style={{ width: `${activity.progress}%` }} />
              </div>
              <p className="text-hud-xs text-text-disabled mt-1">奖励：{activity.reward}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="hud-card p-3">
        <p className="text-hud-sm font-bold text-text-primary mb-2">贡献排行</p>
        <div className="space-y-2">
          {contributionRank.map((member, index) => (
            <div key={member.id} className="flex items-center gap-2 p-2 rounded-hud bg-surface-field/60">
              <span className={`w-6 text-center text-hud-xs font-mono ${index < 3 ? 'text-rarity-gold' : 'text-text-muted'}`}>#{index + 1}</span>
              <span className={`w-2 h-2 rounded-full ${member.online ? 'bg-accent-emerald' : 'bg-text-disabled'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-hud-xs font-bold text-text-primary truncate">{member.name}</p>
                <p className="text-hud-xs text-text-muted">{member.position} · Lv.{member.level} {member.title}</p>
              </div>
              <span className="text-hud-xs font-mono text-accent-gold">{member.contribution.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
