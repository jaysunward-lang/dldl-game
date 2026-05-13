import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import DlButton from '@components/atoms/DlButton'
import {
  cloneTradeItem,
  currencyMeta,
  formatPrice,
  qualityColorMap,
  stallListings,
  typeIconMap,
  typeLabelMap,
  type TradeListing,
} from './tradeData'

function StallItemCard({ listing, onBuy }: { listing: TradeListing; onBuy: (listing: TradeListing) => void }) {
  const player = usePlayerStore((s) => s.player)
  const canAfford = (player?.gold ?? 0) >= listing.price
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
          <p className="text-hud-xs text-text-muted mt-0.5">
            {listing.sellerName} · {typeLabelMap[item.type]}
          </p>
          {item.description && <p className="text-hud-xs text-text-secondary mt-1 ">{item.description}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-text-disabled/10">
        <div>
          <p className={`text-hud-base font-mono font-bold ${currencyMeta[listing.currency].color}`}>{formatPrice(listing)}</p>
          <p className="text-hud-xs text-text-disabled">库存 {listing.stock ?? 1}</p>
        </div>
        <DlButton size="sm" variant={canAfford ? 'primary' : 'ghost'} disabled={!canAfford} onClick={() => onBuy(listing)}>
          {canAfford ? '购买' : '金币不足'}
        </DlButton>
      </div>
    </div>
  )
}

export default function StallMarket() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  const spendGold = usePlayerStore((s) => s.spendGold)
  const addItem = usePlayerStore((s) => s.addItem)
  const [tab, setTab] = useState<'market' | 'mine'>('market')
  const [keyword, setKeyword] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const filteredListings = useMemo(() => {
    const key = keyword.trim().toLowerCase()
    if (!key) return stallListings
    return stallListings.filter((l) => `${l.item.name} ${l.sellerName ?? ''}`.toLowerCase().includes(key))
  }, [keyword])

  const handleBuy = (listing: TradeListing) => {
    if (!player) return

    const success = spendGold(listing.price)
    if (!success) {
      setToast('金币不足，无法购买')
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
        <h2 className="text-hud-lg font-bold text-text-primary">摆摊</h2>
        <span className="ml-auto text-hud-sm font-mono text-rarity-gold">🪙 {(player?.gold ?? 0).toLocaleString()}</span>
      </div>

      <div className="hud-card p-3 mb-3">
        <p className="text-hud-sm font-bold text-text-primary">圣魂村集市</p>
        <p className="text-hud-xs text-text-secondary mt-1">区域摊位使用金币结算，适合购买基础材料、药剂与暗器零件。</p>
      </div>

      {toast && (
        <div className="mb-3 p-2 rounded-hud bg-accent-emerald/10 border border-accent-emerald/30 text-hud-sm text-accent-emerald">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-2 gap-1 mb-3 p-1 bg-surface-field rounded-hud">
        <button
          onClick={() => setTab('market')}
          className={`py-1.5 text-hud-xs font-bold rounded-hud ${tab === 'market' ? 'bg-surface-elevated text-text-primary shadow-hud' : 'text-text-muted'}`}
        >
          当前区域摊位
        </button>
        <button
          onClick={() => setTab('mine')}
          className={`py-1.5 text-hud-xs font-bold rounded-hud ${tab === 'mine' ? 'bg-surface-elevated text-text-primary shadow-hud' : 'text-text-muted'}`}
        >
          我的摊位
        </button>
      </div>

      {tab === 'market' ? (
        <>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索摊位商品/摊主"
            className="w-full mb-3 px-3 py-2 bg-surface-field border border-text-disabled/20 rounded-hud text-hud-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-accent-gold/50"
          />
          <div className="space-y-2">
            {filteredListings.map((listing) => (
              <StallItemCard key={listing.id} listing={listing} onBuy={handleBuy} />
            ))}
          </div>
        </>
      ) : (
        <div className="hud-card p-8 text-center">
          <p className="text-3xl mb-2">🏪</p>
          <p className="text-hud-sm text-text-muted">你还没有开设摊位</p>
          <p className="text-hud-xs text-text-disabled mt-1">后续版本将开放背包物品上架、议价与摊位收益领取</p>
        </div>
      )}
    </div>
  )
}
