import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import DlButton from '@components/atoms/DlButton'
import {
  cloneTradeItem,
  currencyMeta,
  formatPrice,
  qualityColorMap,
  soulBoneListings,
  type TradeListing,
} from './tradeData'

const partFilters = ['全部', '头部', '胸部', '左臂', '右臂', '左腿', '右腿']
const qualityFilters = ['全部', '黄色', '紫色', '黑色', '红色', '金色']

function SoulBoneCard({ listing, onBuy }: { listing: TradeListing; onBuy: (listing: TradeListing) => void }) {
  const player = usePlayerStore((s) => s.player)
  const canAfford = (player?.soulCoin ?? 0) >= listing.price
  const item = listing.item

  return (
    <div className="hud-card p-3 space-y-2 border-l-4" style={{ borderLeftColor: item.quality === '黑色' ? '#2C3E50' : undefined }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-hud bg-surface-field flex items-center justify-center text-xl">🦴</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-hud-sm font-bold truncate ${item.quality ? qualityColorMap[item.quality] || 'text-text-primary' : 'text-text-primary'}`}>{item.name}</p>
            {item.quality && <span className="text-hud-xs text-text-muted">{item.quality}</span>}
          </div>
          <p className="text-hud-xs text-text-muted mt-0.5">{listing.tags?.join(' · ') || '魂骨'}</p>
          {item.description && <p className="text-hud-xs text-text-secondary mt-1 ">{item.description}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-text-disabled/10">
        <div>
          <p className={`text-hud-base font-mono font-bold ${currencyMeta[listing.currency].color}`}>{formatPrice(listing)}</p>
          <p className="text-hud-xs text-text-disabled">剩余 {listing.remainingTime} · 交易税5%</p>
        </div>
        <DlButton size="sm" variant={canAfford ? 'primary' : 'ghost'} disabled={!canAfford} onClick={() => onBuy(listing)}>
          {canAfford ? '购买魂骨' : '魂币不足'}
        </DlButton>
      </div>
    </div>
  )
}

export default function SoulBoneExchange() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  const spendSoulCoin = usePlayerStore((s) => s.spendSoulCoin)
  const addItem = usePlayerStore((s) => s.addItem)
  const [part, setPart] = useState('全部')
  const [quality, setQuality] = useState('全部')
  const [toast, setToast] = useState<string | null>(null)

  const filteredListings = useMemo(() => {
    return soulBoneListings.filter((listing) => {
      const matchesPart = part === '全部' || listing.tags?.includes(part)
      const matchesQuality = quality === '全部' || listing.item.quality === quality
      return listing.item.type === 'soulBone' && matchesPart && matchesQuality
    })
  }, [part, quality])

  const handleBuy = (listing: TradeListing) => {
    if (!player) return

    const success = spendSoulCoin(listing.price)
    if (!success) {
      setToast('魂币不足，无法购买魂骨')
      return
    }
    addItem(cloneTradeItem(listing.item))
    setToast(`购买成功：${listing.item.name}`)
  }

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('..')} className="text-hud-sm text-text-secondary hover:text-text-primary transition-colors">
          ← 返回
        </button>
        <h2 className="text-hud-lg font-bold text-text-primary">魂骨交易所</h2>
        <span className="ml-auto text-hud-sm font-mono text-rarity-purple">💠 {(player?.soulCoin ?? 0).toLocaleString()}</span>
      </div>

      <div className="hud-card p-3 mb-3 bg-accent-crimson/5 border-accent-crimson/20">
        <p className="text-hud-sm font-bold text-accent-crimson">交易红线</p>
        <p className="text-hud-xs text-text-secondary mt-1">
          仅千年及以上常规魂骨可交易。外附魂骨、神赐魂环、百万年魂环、神级领域不可直接购买或上架。
        </p>
      </div>

      {toast && (
        <div className="mb-3 p-2 rounded-hud bg-accent-gold/10 border border-accent-gold/30 text-hud-sm text-accent-gold">
          {toast}
        </div>
      )}

      <div className="hud-card p-3 mb-3 space-y-2">
        <div>
          <p className="text-hud-xs text-text-muted mb-1">部位筛选</p>
          <div className="flex gap-1 overflow-x-auto">
            {partFilters.map((p) => (
              <button
                key={p}
                onClick={() => setPart(p)}
                className={`flex-shrink-0 px-2 py-1 rounded-hud text-hud-xs ${part === p ? 'bg-accent-gold/20 text-accent-gold' : 'bg-surface-field text-text-muted'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-hud-xs text-text-muted mb-1">品质筛选</p>
          <div className="flex gap-1 overflow-x-auto">
            {qualityFilters.map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`flex-shrink-0 px-2 py-1 rounded-hud text-hud-xs ${quality === q ? 'bg-accent-gold/20 text-accent-gold' : 'bg-surface-field text-text-muted'}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredListings.length > 0 ? (
        <div className="space-y-2">
          {filteredListings.map((listing) => (
            <SoulBoneCard key={listing.id} listing={listing} onBuy={handleBuy} />
          ))}
        </div>
      ) : (
        <div className="hud-card p-8 text-center">
          <p className="text-hud-sm text-text-muted">没有符合筛选条件的魂骨</p>
        </div>
      )}
    </div>
  )
}
