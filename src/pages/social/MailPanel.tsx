import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore, useSocialStore } from '@stores'
import DlButton from '@components/atoms/DlButton'
import { cloneRewardItem, mailCategoryMeta, mailSeed, type MailCategory, type SocialMail } from './socialData'

const categories: (MailCategory | 'all')[] = ['all', 'system', 'battle', 'guild', 'player']

function RewardSummary({ mail }: { mail: SocialMail }) {
  const rewards = mail.rewards
  if (!rewards) return <span className="text-hud-xs text-text-disabled">无附件</span>

  const parts: string[] = []
  if (rewards.gold) parts.push(`金币×${rewards.gold}`)
  if (rewards.diamond) parts.push(`钻石×${rewards.diamond}`)
  if (rewards.soulCoin) parts.push(`魂币×${rewards.soulCoin}`)
  if (rewards.items?.length) parts.push(...rewards.items.map((item) => `${item.name}×${item.quantity}`))

  return <span className="text-hud-xs text-accent-gold">附件：{parts.join('、')}</span>
}

export default function MailPanel() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  const addGold = usePlayerStore((s) => s.addGold)
  const addDiamond = usePlayerStore((s) => s.addDiamond)
  const addSoulCoin = usePlayerStore((s) => s.addSoulCoin)
  const addItems = usePlayerStore((s) => s.addItems)
  const readMailIds = useSocialStore((s) => s.readMailIds)
  const claimedMailIds = useSocialStore((s) => s.claimedMailIds)
  const markMailRead = useSocialStore((s) => s.markMailRead)
  const claimMail = useSocialStore((s) => s.claimMail)
  const [category, setCategory] = useState<MailCategory | 'all'>('all')
  const [selectedId, setSelectedId] = useState(mailSeed[0]?.id ?? '')
  const [toast, setToast] = useState<string | null>(null)

  const mails = useMemo(() => {
    return mailSeed.map((mail) => ({
      ...mail,
      read: mail.read || readMailIds.includes(mail.id),
      claimed: mail.claimed || claimedMailIds.includes(mail.id),
    }))
  }, [claimedMailIds, readMailIds])

  const filteredMails = useMemo(() => {
    return mails.filter((mail) => category === 'all' || mail.category === category)
  }, [category, mails])

  const selectedMail = useMemo(() => {
    return mails.find((mail) => mail.id === selectedId) ?? filteredMails[0]
  }, [filteredMails, mails, selectedId])

  const handleSelect = (mailId: string) => {
    if (selectedId !== mailId) setSelectedId(mailId)
    markMailRead(mailId)
  }

  const handleClaim = (mail: SocialMail) => {
    if (!player) {
      setToast('请先创建角色后再领取附件')
      return
    }
    if (!mail.rewards) {
      setToast('该邮件没有可领取附件')
      return
    }
    const claimed = claimMail(mail.id)
    if (!claimed) {
      setToast('附件已领取')
      return
    }

    if (mail.rewards.gold) addGold(mail.rewards.gold)
    if (mail.rewards.diamond) addDiamond(mail.rewards.diamond)
    if (mail.rewards.soulCoin) addSoulCoin(mail.rewards.soulCoin)
    if (mail.rewards.items?.length) addItems(mail.rewards.items.map(cloneRewardItem))

    setToast(`已领取邮件附件：${mail.title}`)
  }

  const mailStats = useMemo(() => {
    return mails.reduce(
      (stats, mail) => {
        if (!mail.read) stats.unread += 1
        if (mail.rewards && !mail.claimed) stats.unclaimed += 1
        return stats
      },
      { unread: 0, unclaimed: 0 },
    )
  }, [mails])

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('..')} className="text-hud-sm text-text-secondary hover:text-text-primary transition-colors">
          ← 返回
        </button>
        <h2 className="text-hud-lg font-bold text-text-primary">邮件</h2>
        <span className="ml-auto text-hud-xs text-text-muted">未读 {mailStats.unread} · 附件 {mailStats.unclaimed}</span>
      </div>

      {toast && (
        <div className="mb-3 p-2 rounded-hud bg-accent-emerald/10 border border-accent-emerald/30 text-hud-sm text-accent-emerald">
          {toast}
        </div>
      )}

      <div className="flex gap-1 mb-3 p-1 bg-surface-field rounded-hud overflow-x-auto">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-hud text-hud-xs font-bold transition-all ${category === item ? 'bg-surface-elevated text-text-primary shadow-hud' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {item === 'all' ? '全部' : mailCategoryMeta[item].label}
          </button>
        ))}
      </div>

      <div className="space-y-2 mb-3">
        {filteredMails.map((mail) => (
          <button
            key={mail.id}
            onClick={() => handleSelect(mail.id)}
            className={`w-full hud-card p-3 text-left transition-all ${selectedMail?.id === mail.id ? 'border-accent-gold/40' : ''}`}
          >
            <div className="flex items-start gap-2">
              <span className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${mail.read ? 'bg-text-disabled' : 'bg-accent-gold'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-hud-xs font-bold ${mailCategoryMeta[mail.category].color}`}>{mailCategoryMeta[mail.category].label}</span>
                  <p className={`text-hud-sm truncate ${mail.read ? 'text-text-secondary' : 'text-text-primary font-bold'}`}>{mail.title}</p>
                  {mail.rewards && !mail.claimed && <span className="text-hud-xs text-accent-gold">附件</span>}
                </div>
                <p className="text-hud-xs text-text-muted mt-0.5">{mail.sender} · {mail.time}</p>
                <p className="text-hud-xs text-text-disabled mt-1 truncate">{mail.content}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedMail && (
        <div className="hud-card-gold p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-hud-base font-bold text-text-primary">{selectedMail.title}</p>
              <p className="text-hud-xs text-text-muted mt-1">来自 {selectedMail.sender} · {selectedMail.time}</p>
            </div>
            <span className={`text-hud-xs font-bold ${mailCategoryMeta[selectedMail.category].color}`}>{mailCategoryMeta[selectedMail.category].label}</span>
          </div>
          <p className="text-hud-sm text-text-secondary leading-relaxed mb-3">{selectedMail.content}</p>
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-text-disabled/10">
            <RewardSummary mail={selectedMail} />
            <DlButton
              size="sm"
              variant={selectedMail.rewards && !selectedMail.claimed ? 'primary' : 'ghost'}
              disabled={!selectedMail.rewards || selectedMail.claimed}
              onClick={() => handleClaim(selectedMail)}
            >
              {selectedMail.claimed ? '已领取' : selectedMail.rewards ? '领取附件' : '无附件'}
            </DlButton>
          </div>
        </div>
      )}
    </div>
  )
}
