import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import DlProgressBar from '@components/atoms/DlProgressBar'
import { achievements } from './worldData'

export default function AchievementHall() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)

  const unlockedIds = player?.achievements ?? []
  const unlockedCount = achievements.filter((achievement) => unlockedIds.includes(achievement.id)).length
  const total = achievements.length
  const completion = total > 0 ? Math.round((unlockedCount / total) * 100) : 0

  return (
    <div className="p-4 animate-fade-in">
      <button onClick={() => navigate('/world')} className="text-hud-sm text-text-secondary hover:text-text-primary transition-colors mb-4">
        ← 返回世界
      </button>

      <div className="hud-card-gold p-4 mb-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-hud-xl font-bold text-text-primary">成就殿堂</h2>
            <p className="text-hud-xs text-text-muted mt-1">记录魂师生涯中的关键节点</p>
          </div>
          <div className="text-right">
            <p className="text-hud-lg font-bold text-accent-gold">{completion}%</p>
            <p className="text-hud-xs text-text-muted">完成度</p>
          </div>
        </div>
        <DlProgressBar value={unlockedCount} max={total} color="gold" size="md" showLabel />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {achievements.map((achievement) => {
          const unlocked = unlockedIds.includes(achievement.id)
          return (
            <div
              key={achievement.id}
              className={`hud-card p-3 border ${unlocked ? 'border-accent-gold/40 bg-accent-gold/5' : 'border-text-disabled/20 opacity-70'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-hud flex items-center justify-center text-xl ${unlocked ? 'bg-accent-gold/15' : 'bg-surface-field grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-hud-base font-bold text-text-primary">{achievement.name}</p>
                    <span className={unlocked ? 'text-hud-xs text-accent-emerald' : 'text-hud-xs text-text-muted'}>
                      {unlocked ? '已达成' : '未达成'}
                    </span>
                  </div>
                  <p className="text-hud-sm text-text-secondary mt-1">{achievement.desc}</p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-hud-xs">
                    <div className="bg-surface-field rounded-hud p-2">
                      <span className="text-text-muted">条件：</span>
                      <span className="text-text-secondary">{achievement.condition}</span>
                    </div>
                    <div className="bg-surface-field rounded-hud p-2">
                      <span className="text-text-muted">奖励：</span>
                      <span className="text-accent-gold">{achievement.reward}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
