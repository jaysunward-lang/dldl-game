import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import DlButton from '@components/atoms/DlButton'
import {
  auctionListings,
  categoryTabs,
  cloneTradeItem,
  currencyMeta,
  formatPrice,
  qualityColorMap,
  typeIconMap,
  typeLabelMap,
  type TradeCategory,
  type TradeListing,
} from './tradeData'

function ListingCard({ listing, onBuy }: { listing: TradeListing; onBuy: (listing: TradeListing) => void }) {
  const player = usePlayerStore((s) => s.player)
  const canAfford = (player?.soulCoin ?? 0) >= listing.price
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
            <span className="text-hud-xs px-1.5 py-0.5 rounded bg-surface-field text-text-muted">
              {typeLabelMap[item.type]}
            </span>
          </div>
          <p className="text-hud-xs text-text-muted mt-0.5">
            卖家：{listing.sellerName || '匿名'} · 剩余 {listing.remainingTime || '未知'}
          </p>
          {item.description && (
            <p className="text-hud-xs text-text-secondary mt-1 leading-tight line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-text-disabled/10">
        <div>
          <p className={`text-hud-base font-mono font-bold ${currencyMeta[listing.currency].color}`}>
            {formatPrice(listing)}
          </p>
          <p className="text-hud-xs text-text-disabled">一口价 · 卖方税5%</p>
        </div>
        <DlButton
          size="sm"
          variant={canAfford ? 'primary' : 'ghost'}
          disabled={!canAfford}
          onClick={() => onBuy(listing)}
        >
          {canAfford ? '一口价购买' : '魂币不足'}
        </DlButton>
      </div>
    </div>
  )
}

export default function AuctionHouse() {
  const navigate = useNavigate()
  const spendSoulCoin = usePlayerStore((s) => s.spendSoulCoin)
  const addItem = usePlayerStore((s) => s.addItem)
  const player = usePlayerStore((s) => s.player)
  const [activeTab, setActiveTab] = useState<TradeCategory>('all')
  const [keyword, setKeyword] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const tabs = [
    ...categoryTabs,
    { id: 'myBids' as TradeCategory, label: '我的竞拍' },
    { id: 'myListings' as TradeCategory, label: '我的上架' },
  ]

  const filteredListings = useMemo(() => {
    if (activeTab === 'myBids' || activeTab === 'myListings') return []
    return auctionListings.filter((listing) => {
      const matchesTab = activeTab === 'all' || listing.item.type === activeTab
      const text = `${listing.item.name} ${listing.item.quality ?? ''} ${listing.sellerName ?? ''}`
      const matchesKeyword = keyword.trim() === '' || text.toLowerCase().includes(keyword.trim().toLowerCase())
      return matchesTab && matchesKeyword
    })
  }, [activeTab, keyword])

  const handleBuyout = (listing: TradeListing) => {
    if (!player) return

    const success = spendSoulCoin(listing.price)
    if (!success) {
      setToast('魂币不足，无法购买')
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
        <h2 className="text-hud-lg font-bold text-text-primary">拍卖行</h2>
        <span className="ml-auto text-hud-sm font-mono text-rarity-purple">💠 {(player?.soulCoin ?? 0).toLocaleString()}</span>
      </div>

      <div className="hud-card p-3 mb-3">
        <p className="text-hud-sm font-bold text-text-primary">魂币拍卖市场</p>
        <p className="text-hud-xs text-text-secondary mt-1">
          拍卖行使用魂币结算，支持一口价与竞拍。当前版本先开放系统托管一口价商品。
        </p>
      </div>

      {toast && (
        <div className="mb-3 p-2 rounded-hud bg-accent-gold/10 border border-accent-gold/30 text-hud-sm text-accent-gold">
          {toast}
        </div>
      )}

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索物品/品质/卖家"
        className="w-full mb-3 px-3 py-2 bg-surface-field border border-text-disabled/20 rounded-hud text-hud-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-accent-gold/50"
      />

      <div className="flex gap-1 mb-4 p-1 bg-surface-field rounded-hud overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 py-1.5 px-2.5 text-hud-xs font-bold rounded-hud transition-all ${
              activeTab === tab.id
                ? 'bg-surface-elevated text-text-primary shadow-hud'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'myBids' || activeTab === 'myListings' ? (
        <div className="hud-card p-8 text-center">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-hud-sm text-text-muted">
            {activeTab === 'myBids' ? '暂无竞拍记录' : '暂无上架物品'}
          </p>
          <p className="text-hud-xs text-text-disabled mt-1">玩家上架与竞拍状态机将在后续版本开放</p>
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="space-y-2">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onBuy={handleBuyout} />
          ))}
        </div>
      ) : (
        <div className="hud-card p-8 text-center">
          <p className="text-hud-sm text-text-muted">没有找到匹配的拍卖品</p>
        </div>
      )}
    </div>
  )
}
