import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSocialTodayKey, usePlayerStore, useSocialStore } from '@stores'
import DlButton from '@components/atoms/DlButton'
import { friendList } from './socialData'

function getIntimacyLabel(value: number): string {
  if (value >= 80) return '生死之交'
  if (value >= 60) return '亲密伙伴'
  if (value >= 40) return '熟识好友'
  if (value >= 20) return '点头之交'
  return '初识'
}

export default function FriendsPanel() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  const updateRelationShip = usePlayerStore((s) => s.updateRelationShip)
  const friendGiftRecords = useSocialStore((s) => s.friendGiftRecords)
  const markFriendGifted = useSocialStore((s) => s.markFriendGifted)
  const [filter, setFilter] = useState<'all' | 'online'>('all')
  const [toast, setToast] = useState<string | null>(null)
  const todayKey = getSocialTodayKey()

  const friends = useMemo(() => {
    return friendList.filter((friend) => filter === 'all' || friend.online)
  }, [filter])
  const onlineFriendCount = useMemo(() => friendList.filter((friend) => friend.online).length, [])

  const handleGift = (friendId: string, friendName: string) => {
    if (!player) {
      setToast('请先创建角色后再赠礼')
      return
    }
    const marked = markFriendGifted(friendId)
    if (!marked) {
      setToast('今日已经赠礼过该好友')
      return
    }
    updateRelationShip(friendId, 5)
    setToast(`已向${friendName}赠送友情礼物，羁绊 +5`)
  }

  const getRelationBonus = (friendId: string) => player?.relationShips[friendId] ?? 0

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('..')} className="text-hud-sm text-text-secondary hover:text-text-primary transition-colors">
          ← 返回
        </button>
        <h2 className="text-hud-lg font-bold text-text-primary">好友</h2>
        <span className="ml-auto text-hud-xs text-text-muted">{onlineFriendCount}/{friendList.length} 在线</span>
      </div>

      <div className="grid grid-cols-2 gap-1 mb-3 p-1 bg-surface-field rounded-hud">
        <button
          onClick={() => setFilter('all')}
          className={`py-1.5 text-hud-xs font-bold rounded-hud transition-all ${filter === 'all' ? 'bg-surface-elevated text-text-primary shadow-hud' : 'text-text-muted'}`}
        >
          全部好友
        </button>
        <button
          onClick={() => setFilter('online')}
          className={`py-1.5 text-hud-xs font-bold rounded-hud transition-all ${filter === 'online' ? 'bg-surface-elevated text-text-primary shadow-hud' : 'text-text-muted'}`}
        >
          在线好友
        </button>
      </div>

      {toast && (
        <div className="mb-3 p-2 rounded-hud bg-accent-emerald/10 border border-accent-emerald/30 text-hud-sm text-accent-emerald">
          {toast}
        </div>
      )}

      <div className="hud-card p-3 mb-3">
        <p className="text-hud-sm font-bold text-text-primary">羁绊联动</p>
        <p className="text-hud-xs text-text-secondary mt-1">
          赠礼会写入角色关系数据，可与世界 NPC 互动共享同一份 player.relationShips。
        </p>
      </div>

      <div className="space-y-2">
        {friends.map((friend) => {
          const relationBonus = getRelationBonus(friend.id)
          const intimacy = Math.min(100, friend.intimacy + relationBonus)
          const gifted = friendGiftRecords[friend.id] === todayKey
          return (
            <div key={friend.id} className="hud-card p-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-surface-field flex items-center justify-center">
                  <span className={`w-2.5 h-2.5 rounded-full ${friend.online ? 'bg-accent-emerald' : 'bg-text-disabled'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-hud-sm font-bold text-text-primary truncate">{friend.name}</p>
                    <span className="text-hud-xs text-text-muted">Lv.{friend.level}</span>
                    <span className="text-hud-xs text-rarity-gold">{friend.title}</span>
                  </div>
                  <p className="text-hud-xs text-text-muted mt-0.5">{friend.guildName ?? '暂无公会'} · {friend.online ? '在线' : '离线'}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-hud-xs text-text-secondary">羁绊：{getIntimacyLabel(intimacy)}</span>
                      <span className="text-hud-xs font-mono text-accent-gold">{intimacy}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-field overflow-hidden">
                      <div className="h-full rounded-full bg-accent-gold" style={{ width: `${intimacy}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-text-disabled/10">
                <DlButton size="sm" variant="ghost" disabled={!friend.online}>私聊</DlButton>
                <DlButton size="sm" variant="ghost" disabled={!friend.online}>邀请组队</DlButton>
                <DlButton size="sm" variant={gifted ? 'ghost' : 'primary'} disabled={gifted} onClick={() => handleGift(friend.id, friend.name)}>
                  {gifted ? '已赠礼' : '赠礼'}
                </DlButton>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
