import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import DlButton from '@components/atoms/DlButton'
import {
  cloneTradeItem,
  currencyMeta,
  formatPrice,
  qualityColorMap,
  shopListings,
  typeIconMap,
  typeLabelMap,
  type TradeListing,
} from './tradeData'

type ShopTab = 'npc' | 'diamond' | 'soulCoin' | 'material'

const shopTabs: { id: ShopTab; label: string; desc: string }[] = [
  { id: 'npc', label: 'NPC商店', desc: '基础药剂' },
  { id: 'diamond', label: '钻石商城', desc: '限购道具' },
  { id: 'soulCoin', label: '魂币商城', desc: '付费便利' },
  { id: 'material', label: '材料商店', desc: '制作材料' },
]

function ShopItemCard({ listing, onBuy }: { listing: TradeListing; onBuy: (listing: TradeListing) => void }) {
  const player = usePlayerStore((s) => s.player)
  const balance = listing.currency === 'gold'
    ? player?.gold ?? 0
    : listing.currency === 'diamond'
    ? player?.diamond ?? 0
    : player?.soulCoin ?? 0
  const canAfford = balance >= listing.price
  const item = listing.item

  return (
    <div className="hud-card p-3 space-y-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-hud bg-surface-field flex items-center justify-center text-xl">
          {item.icon || typeIconMap[item.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-hud-sm font-bold truncate ${item.quality ? qualityColorMap[item.quality] || 'text-text-primary' : 'text-text-primary'}`}>
              {item.name}
            </p>
            <span className="text-hud-xs text-text-muted">×{item.quantity}</span>
          </div>
          <p className="text-hud-xs text-text-muted mt-0.5">{typeLabelMap[item.type]}</p>
          {item.description && <p className="text-hud-xs text-text-secondary mt-1 ">{item.description}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-text-disabled/10">
        <div>
          <p className={`text-hud-base font-mono font-bold ${currencyMeta[listing.currency].color}`}>{formatPrice(listing)}</p>
          {listing.limitPerDay && <p className="text-hud-xs text-text-disabled">每日限购 {listing.limitPerDay}</p>}
        </div>
        <DlButton size="sm" variant={canAfford ? 'primary' : 'ghost'} disabled={!canAfford} onClick={() => onBuy(listing)}>
          {canAfford ? '购买' : `${currencyMeta[listing.currency].label}不足`}
        </DlButton>
      </div>
    </div>
  )
}

export default function ShopPanel() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  const spendGold = usePlayerStore((s) => s.spendGold)
  const spendDiamond = usePlayerStore((s) => s.spendDiamond)
  const spendSoulCoin = usePlayerStore((s) => s.spendSoulCoin)
  const addGold = usePlayerStore((s) => s.addGold)
  const addItem = usePlayerStore((s) => s.addItem)
  const [activeTab, setActiveTab] = useState<ShopTab>('npc')
  const [toast, setToast] = useState<string | null>(null)

  const handleBuy = (listing: TradeListing) => {
    if (!player) return

    const success = listing.currency === 'gold'
      ? spendGold(listing.price)
      : listing.currency === 'diamond'
      ? spendDiamond(listing.price)
      : spendSoulCoin(listing.price)

    if (!success) {
      setToast(`${currencyMeta[listing.currency].label}不足，无法购买`)
      return
    }
    addItem(cloneTradeItem(listing.item))
    setToast(`购买成功：${listing.item.name}`)
  }

  const handleConvertSoulCoin = () => {
    if (!player) return

    const success = spendSoulCoin(10)
    if (!success) {
      setToast('魂币不足，无法兑换')
      return
    }
    addGold(1000)
    setToast('兑换成功：10魂币 → 1,000金币')
  }

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('..')} className="text-hud-sm text-text-secondary hover:text-text-primary transition-colors">
          ← 返回
        </button>
        <h2 className="text-hud-lg font-bold text-text-primary">商店</h2>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="hud-card p-2 text-center"><p className="text-hud-xs text-text-muted">金币</p><p className="text-hud-sm font-mono text-rarity-gold">🪙 {(player?.gold ?? 0).toLocaleString()}</p></div>
        <div className="hud-card p-2 text-center"><p className="text-hud-xs text-text-muted">钻石</p><p className="text-hud-sm font-mono text-rarity-blue">💎 {(player?.diamond ?? 0).toLocaleString()}</p></div>
        <div className="hud-card p-2 text-center"><p className="text-hud-xs text-text-muted">魂币</p><p className="text-hud-sm font-mono text-rarity-purple">💠 {(player?.soulCoin ?? 0).toLocaleString()}</p></div>
      </div>

      {toast && (
        <div className="mb-3 p-2 rounded-hud bg-accent-gold/10 border border-accent-gold/30 text-hud-sm text-accent-gold">
          {toast}
        </div>
      )}

      <div className="hud-card-gold p-3 mb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-hud-sm font-bold text-text-primary">魂币兑换金币</p>
            <p className="text-hud-xs text-text-secondary mt-0.5">单向兑换：1魂币 = 100金币</p>
          </div>
          <DlButton size="sm" variant="skill" disabled={(player?.soulCoin ?? 0) < 10} onClick={handleConvertSoulCoin}>
            10魂币→1000金币
          </DlButton>
        </div>
      </div>

      <div className="flex gap-1 mb-4 p-1 bg-surface-field rounded-hud overflow-x-auto">
        {shopTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 py-1.5 px-2.5 text-hud-xs font-bold rounded-hud transition-all ${
              activeTab === tab.id ? 'bg-surface-elevated text-text-primary shadow-hud' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="text-hud-xs text-text-muted mb-2">
        {shopTabs.find((t) => t.id === activeTab)?.desc}
      </p>

      <div className="space-y-2">
        {shopListings[activeTab].map((listing) => (
          <ShopItemCard key={listing.id} listing={listing} onBuy={handleBuy} />
        ))}
      </div>
    </div>
  )
}
