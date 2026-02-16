import { useState, useRef, useEffect } from 'react'
import Icon from './Icon'
import { useNotifications, NotificationType } from '../api/NotificationContext'

const typeConfig: Record<NotificationType, { icon: string; color: string; bg: string }> = {
  error: { icon: 'exclamation-triangle', color: '#FF3B30', bg: 'rgba(255,59,48,0.1)' },
  warning: { icon: 'exclamation-triangle', color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)' },
  info: { icon: 'info', color: '#007AFF', bg: 'rgba(0,122,255,0.1)' },
  success: { icon: 'check-circle', color: '#30D158', bg: 'rgba(48,209,88,0.1)' },
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60000) return 'lige nu'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min siden`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}t siden`
  return new Date(ts).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, dismissNotification } = useNotifications()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{
        position: 'relative', padding: '8px', borderRadius: '10px',
        background: isOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: 'none', cursor: 'pointer', transition: 'background 150ms',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
      onMouseLeave={e => (e.currentTarget.style.background = isOpen ? 'rgba(255,255,255,0.08)' : 'transparent')}>
        <Icon name={unreadCount > 0 ? 'bell-badge' : 'bell'} size={20} className="text-white/70" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8,
            background: '#FF3B30', color: '#fff', fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
          }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 380, maxHeight: 480,
          borderRadius: 16, background: 'rgba(20, 20, 30, 0.95)',
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden', zIndex: 100, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Notifikationer</span>
              {unreadCount > 0 && (
                <span style={{
                  background: 'rgba(255,59,48,0.15)', color: '#FF3B30', fontSize: 11,
                  fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                }}>{unreadCount} ulæste</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} style={{
                  background: 'none', border: 'none', color: 'rgba(0,122,255,0.9)',
                  fontSize: 12, cursor: 'pointer', padding: '4px 8px', borderRadius: 6,
                }}>Markér alle læst</button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                  fontSize: 12, cursor: 'pointer', padding: '4px 8px', borderRadius: 6,
                }}>Ryd alle</button>
              )}
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                <Icon name="bell" size={32} className="text-white/20" style={{ marginBottom: 12 }} />
                <p>Ingen notifikationer</p>
              </div>
            ) : (
              notifications.slice(0, 50).map(n => {
                const config = typeConfig[n.type]
                return (
                  <div key={n.id} onClick={() => !n.read && markAsRead(n.id)} style={{
                    padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    cursor: n.read ? 'default' : 'pointer',
                    background: n.read ? 'transparent' : 'rgba(255,255,255,0.02)',
                    transition: 'background 150ms', display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, background: config.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                    }}>
                      <Icon name={config.icon} size={16} style={{ color: config.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: n.read ? 500 : 600, color: n.read ? 'rgba(255,255,255,0.6)' : '#fff' }}>
                          {n.title}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); dismissNotification(n.id) }} style={{
                          background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)',
                          cursor: 'pointer', padding: 2, fontSize: 14, lineHeight: 1,
                        }}>×</button>
                      </div>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2, lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{formatTime(n.timestamp)}</span>
                        {n.source && (
                          <span style={{
                            fontSize: 10, color: 'rgba(255,255,255,0.2)',
                            background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: 4,
                          }}>{n.source}</span>
                        )}
                        {!n.read && <span style={{ width: 6, height: 6, borderRadius: 3, background: '#007AFF' }} />}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
