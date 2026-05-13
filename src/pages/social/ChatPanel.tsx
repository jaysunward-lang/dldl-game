import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@stores'
import DlButton from '@components/atoms/DlButton'
import { channelMeta, chatMessages, type ChatChannel, type ChatMessage } from './socialData'

const channels: ChatChannel[] = ['world', 'guild', 'team', 'private']

function MessageBubble({ message, isSelf }: { message: ChatMessage; isSelf: boolean }) {
  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[86%] rounded-hud p-3 border ${isSelf ? 'bg-accent-gold/10 border-accent-gold/30' : 'bg-surface-elevated border-text-disabled/20'}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-hud-xs font-bold ${channelMeta[message.channel].color}`}>
            [{channelMeta[message.channel].label}]
          </span>
          <span className="text-hud-xs font-bold text-text-primary">{message.sender}</span>
          <span className="text-hud-xs text-text-disabled">{message.title}</span>
          <span className="ml-auto text-hud-xs text-text-disabled">{message.time}</span>
        </div>
        <p className="text-hud-sm text-text-secondary leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
}

export default function ChatPanel() {
  const navigate = useNavigate()
  const player = usePlayerStore((s) => s.player)
  const [activeChannel, setActiveChannel] = useState<ChatChannel>('world')
  const [draft, setDraft] = useState('')
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const visibleMessages = useMemo(() => {
    return [...chatMessages, ...localMessages].filter((message) => message.channel === activeChannel)
  }, [activeChannel, localMessages])

  const onlineCount = useMemo(() => {
    return chatMessages.filter((message) => message.online).length + (player ? 1 : 0)
  }, [player])

  const handleSend = () => {
    const text = draft.trim()
    if (!text) {
      setToast('请输入聊天内容')
      return
    }
    if (!player) {
      setToast('请先创建角色后再发言')
      return
    }

    setLocalMessages((messages) => [
      ...messages,
      {
        id: `local-${Date.now()}`,
        channel: activeChannel,
        sender: player.name,
        title: player.title,
        content: text,
        time: '刚刚',
        online: true,
      },
    ])
    setDraft('')
    setToast('消息已发送到当前频道')
  }

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('..')} className="text-hud-sm text-text-secondary hover:text-text-primary transition-colors">
          ← 返回
        </button>
        <h2 className="text-hud-lg font-bold text-text-primary">聊天</h2>
        <span className="ml-auto text-hud-xs text-text-muted">在线 {onlineCount}</span>
      </div>

      <div className="flex gap-1 mb-3 p-1 bg-surface-field rounded-hud overflow-x-auto">
        {channels.map((channel) => (
          <button
            key={channel}
            onClick={() => setActiveChannel(channel)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-hud text-hud-xs font-bold transition-all ${
              activeChannel === channel
                ? 'bg-surface-elevated text-text-primary shadow-hud'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {channelMeta[channel].label}
          </button>
        ))}
      </div>

      <div className="hud-card p-3 mb-3">
        <p className="text-hud-sm font-bold text-text-primary">{channelMeta[activeChannel].label}频道</p>
        <p className="text-hud-xs text-text-secondary mt-1">{channelMeta[activeChannel].desc}</p>
      </div>

      {toast && (
        <div className="mb-3 p-2 rounded-hud bg-accent-gold/10 border border-accent-gold/30 text-hud-sm text-accent-gold">
          {toast}
        </div>
      )}

      <div className="space-y-2 mb-4 max-h-[420px] overflow-y-auto pr-1">
        {visibleMessages.map((message) => (
          <MessageBubble key={message.id} message={message} isSelf={message.sender === player?.name} />
        ))}
      </div>

      <div className="hud-card p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`发送到${channelMeta[activeChannel].label}频道`}
          className="w-full min-h-[72px] px-3 py-2 bg-surface-field border border-text-disabled/20 rounded-hud text-hud-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-accent-gold/50 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-hud-xs text-text-disabled">当前版本为本地聊天演示，后续接入实时频道与私聊会话。</p>
          <DlButton size="sm" variant="primary" onClick={handleSend}>发送</DlButton>
        </div>
      </div>
    </div>
  )
}
