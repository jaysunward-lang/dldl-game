import clsx from 'clsx'

interface TabItem {
  path: string
  label: string
  icon: string
}

interface BottomTabProps {
  tabs: readonly TabItem[]
  activeTab: string
  onTabChange: (path: string) => void
}

export default function BottomTab({ tabs, activeTab, onTabChange }: BottomTabProps) {
  return (
    <nav className="flex-shrink-0 bg-surface-elevated border-t border-text-disabled/20 safe-area-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.path || activeTab.startsWith(tab.path + '/')
          return (
            <button
              key={tab.path}
              onClick={() => onTabChange(tab.path)}
              className={clsx(
                'flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 py-1 rounded-lg transition-colors duration-150',
                isActive
                  ? 'text-accent-gold'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className={clsx(
                'text-hud-xs leading-none',
                isActive && 'font-bold'
              )}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 rounded-full bg-accent-gold mt-0.5" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}