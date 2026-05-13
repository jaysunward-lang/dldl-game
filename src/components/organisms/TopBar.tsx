import { usePlayerStore } from '@stores'
import DlProgressBar from '@components/atoms/DlProgressBar'

export default function TopBar() {
  const player = usePlayerStore((s) => s.player)
  if (!player) return null

  const { name, level, title, stats, stamina, maxStamina, gold, diamond, soulCoin, phase, actionWindows } = player
  const expPercent = 0 // TODO: 经验条进度

  return (
    <header className="flex-shrink-0 bg-surface-elevated border-b border-text-disabled/20 px-3 py-2">
      {/* 第一行：体力 + 时间线 + 货币 */}
      <div className="flex items-center justify-between mb-1.5">
        {/* 左侧：体力 */}
        <div className="flex items-center gap-1.5">
          <span className="text-hud-xs text-text-muted">⚡</span>
          <span className={`text-hud-sm font-mono ${stamina < 20 ? 'text-accent-crimson' : 'text-text-primary'}`}>
            {stamina}/{maxStamina}
          </span>
          <div className="w-12 h-1 bg-surface-field rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-emerald rounded-full transition-all duration-1000"
              style={{ width: `${(stamina / maxStamina) * 100}%` }}
            />
          </div>
        </div>

        {/* 中央：时间线 */}
        <div className="flex items-center gap-1.5">
          <span className="text-hud-xs text-text-secondary">{phase.phaseName}</span>
          <span className="text-hud-xs text-text-muted">·</span>
          <span className="text-hud-xs text-text-muted">{phase.age}岁</span>
          <div className="flex gap-0.5 ml-1">
            {Array.from({ length: actionWindows.total }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < actionWindows.used
                    ? 'bg-text-muted'
                    : i === actionWindows.used && actionWindows.used >= actionWindows.total
                    ? 'bg-accent-crimson animate-pulse'
                    : 'bg-accent-gold'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 右侧：货币 */}
        <div className="flex items-center gap-2">
          <span className="text-hud-xs text-rarity-gold font-mono">🪙 {gold.toLocaleString()}</span>
          <span className="text-hud-xs text-rarity-blue font-mono hidden sm:inline">💎 {diamond.toLocaleString()}</span>
          <span className="text-hud-xs text-rarity-purple font-mono">💠 {soulCoin.toLocaleString()}</span>
        </div>
      </div>

      {/* 第二行：角色信息 */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-surface-field flex items-center justify-center text-hud-xs text-text-muted">
          {name[0]}
        </div>
        <span className="text-hud-sm font-bold text-text-primary">{name}</span>
        <span className="text-hud-xs px-1.5 py-0.5 rounded bg-accent-gold/20 text-accent-gold font-bold">
          Lv.{level}
        </span>
        <span className="text-hud-xs text-text-secondary">{title}</span>
        <div className="flex-1" />
        <span className="text-hud-xs text-text-muted">
          HP {stats.hp}/{stats.maxHp}
        </span>
      </div>
    </header>
  )
}