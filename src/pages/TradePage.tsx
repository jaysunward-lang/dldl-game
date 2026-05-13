import { Routes, Route, useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import AuctionHouse from './trade/AuctionHouse'
import StallMarket from './trade/StallMarket'
import ShopPanel from './trade/ShopPanel'
import SoulBoneExchange from './trade/SoulBoneExchange'

const tradeEntries = [
  { path: 'auction', label: '拍卖行', icon: '🔨', desc: '搜索/竞拍/上架' },
  { path: 'stall', label: '摆摊', icon: '🏪', desc: '区域摊位交易' },
  { path: 'shop', label: '商店', icon: '🛒', desc: 'NPC/公会/活动商店' },
  { path: 'soul-bone-exchange', label: '魂骨交易所', icon: '🦴', desc: '魂骨专属市场' },
]

function TradeOverview() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)

  return (
    <div className="p-4">
      <h1 className="text-hud-xl font-bold text-text-primary mb-4">交易</h1>
      {player && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="hud-card p-2 text-center"><p className="text-hud-xs text-text-muted">金币</p><p className="text-hud-sm font-mono text-rarity-gold">🪙 {player.gold.toLocaleString()}</p></div>
          <div className="hud-card p-2 text-center"><p className="text-hud-xs text-text-muted">钻石</p><p className="text-hud-sm font-mono text-rarity-blue">💎 {player.diamond.toLocaleString()}</p></div>
          <div className="hud-card p-2 text-center"><p className="text-hud-xs text-text-muted">魂币</p><p className="text-hud-sm font-mono text-rarity-purple">💠 {player.soulCoin.toLocaleString()}</p></div>
        </div>
      )}
      <div className="space-y-2">
        {tradeEntries.map((entry) => (
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

export default function TradePage() {
  return (
    <Routes>
      <Route index element={<TradeOverview />} />
      <Route path="auction" element={<AuctionHouse />} />
      <Route path="stall" element={<StallMarket />} />
      <Route path="shop" element={<ShopPanel />} />
      <Route path="soul-bone-exchange" element={<SoulBoneExchange />} />
    </Routes>
  )
}