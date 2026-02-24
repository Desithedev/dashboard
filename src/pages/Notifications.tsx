import { useState, useEffect, useMemo } from 'react'
import Card from '../components/Card'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import { useTranslation } from 'react-i18next'
import { useNotifications, NotificationType } from '../context/NotificationContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { SkeletonCard, SkeletonRow } from '../components/SkeletonLoader'
import DataFreshness from '../components/DataFreshness'

type Filter = 'all' | NotificationType

type DateGroupId = 'today' | 'yesterday' | 'this_week' | 'older'
type DateGroup = { id: DateGroupId; label: string; items: any[] }

const getDateGroupId = (timestamp: string | number): DateGroupId => {
  const ts = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
  const now = Date.now()
  const todayStart = new Date().setHours(0, 0, 0, 0)
  const yesterdayStart = todayStart - 86400000
  const sevenDaysAgo = now - 7 * 86400000

  if (ts >= todayStart) return 'today'
  if (ts >= yesterdayStart) return 'yesterday'
  if (ts >= sevenDaysAgo) return 'this_week'
  return 'older'
}

const DATE_GROUP_IDS: DateGroupId[] = ['today', 'yesterday', 'this_week', 'older']

export default function Notifications() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US'

  usePageTitle(t('notifications.title', 'Notifications'))

  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, dismissNotification } = useNotifications()
  const [filter, setFilter] = useState<Filter>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const formatTime = (ts: number): string => {
    return new Date(ts).toLocaleString(locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const typeConfig: Record<NotificationType, { icon: string; color: string; bg: string; label: string }> = {
    error: { icon: 'exclamation-triangle', color: '#FF3B30', bg: 'rgba(255,59,48,0.1)', label: t('common.error', 'Error') },
    warning: { icon: 'exclamation-triangle', color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)', label: t('common.warning', 'Warning') },
    info: { icon: 'info', color: '#007AFF', bg: 'rgba(0,122,255,0.1)', label: t('common.info', 'Info') },
    success: { icon: 'check-circle', color: '#30D158', bg: 'rgba(48,209,88,0.1)', label: t('common.success', 'Success') },
  }

  const grouped = useMemo(() => {
    const filtered = notifications.filter(n => {
      if (filter === 'all') return true
      return n.type === filter
    })

    const groups: Record<DateGroupId, any[]> = {
      today: [],
      yesterday: [],
      this_week: [],
      older: []
    }

    filtered.forEach(n => {
      const gId = getDateGroupId(n.timestamp)
      groups[gId].push(n)
    })

    const labels: Record<DateGroupId, string> = {
      today: t('dates.today', 'Today'),
      yesterday: t('dates.yesterday', 'Yesterday'),
      this_week: t('dates.thisWeek', 'This week'),
      older: t('dates.older', 'Older')
    }

    return DATE_GROUP_IDS
      .map(id => ({
        id,
        label: labels[id],
        items: groups[id]
      }))
      .filter(g => g.items.length > 0)
  }, [notifications, filter, t])

  const filters: { id: Filter; label: string; count?: number }[] = [
    { id: 'all', label: t('common.all', 'All'), count: notifications.length },
    { id: 'error', label: t('common.error', 'Error'), count: notifications.filter(n => n.type === 'error').length },
    { id: 'warning', label: t('common.warning', 'Warning'), count: notifications.filter(n => n.type === 'warning').length },
    { id: 'info', label: t('common.info', 'Info') },
    { id: 'success', label: t('common.success', 'Success') },
  ]

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title={t('notifications.title', 'Notifications')}
          description={t('notifications.subtitle', 'Alerts for errors, warnings and important events')}
          breadcrumb={[{ label: t('nav.dashboard', 'Dashboard'), href: '#dashboard' }, { label: t('notifications.title', 'Notifications') }]}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} lines={2} />)}
        </div>
        <div className="mb-4" style={{ height: 32, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}></div>
        <Card>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-page-in">
      <PageHeader
        title={t('notifications.title', 'Notifications')}
        description={t('notifications.subtitle', 'Alerts for errors, warnings and important events')}
        breadcrumb={[{ label: t('nav.dashboard', 'Dashboard'), href: '#dashboard' }, { label: t('notifications.title', 'Notifications') }]}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DataFreshness />
            {unreadCount > 0 && (
              <span style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 10 }}>
                {t('notifications.unreadCount', '{{count}} unread', { count: unreadCount })}
              </span>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {(['error', 'warning', 'info', 'success'] as NotificationType[]).map((type, typeIdx) => {
          const config = typeConfig[type]
          const count = notifications.filter(n => n.type === type).length
          return (
            <Card key={type} style={{ cursor: 'pointer', animationDelay: `${typeIdx * 60}ms` }} onClick={() => setFilter(type)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={config.icon} size={18} style={{ color: config.color }} />
                </div>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{count}</p>
                  <p className="caption">{config.label}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div style={{ display: 'flex', gap: 6 }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: filter === f.id ? 'rgba(0,122,255,0.2)' : 'rgba(255,255,255,0.06)',
              color: filter === f.id ? '#4DA3FF' : 'rgba(255,255,255,0.5)', transition: 'all 150ms',
            }}>
              {f.label}{f.count !== undefined && f.count > 0 && <span style={{ marginLeft: 6, opacity: 0.7 }}>{f.count}</span>}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(0,122,255,0.3)',
              background: 'rgba(0,122,255,0.1)', color: '#4DA3FF', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}>{t('notifications.markAllRead', 'Mark all as read')}</button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,59,48,0.3)',
              background: 'rgba(255,59,48,0.1)', color: '#FF6961', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}>{t('notifications.clearAll', 'Clear all')}</button>
          )}
        </div>
      </div>

      <Card style={{ animationDelay: '240ms' }}>
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-page-in">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
              <Icon name="bell.slash" size={32} className="text-white/20" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t('notifications.noneTitle', 'No notifications')}
            </h3>
            <p className="text-sm text-white/40 max-w-xs mx-auto">
              {filter !== 'all' ? t('notifications.noneDescriptionFiltered', 'Try a different filter.') : t('notifications.noneDescriptionAll', 'You are fully up to date.')}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(group => (
              <div key={group.id} className="space-y-0">
                <div style={{
                  padding: '8px 12px',
                  margin: '8px -16px',
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(8px)',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.35)',
                }}>
                  {group.label}
                </div>
                {group.items.map(n => {
                  const config = typeConfig[n.type as NotificationType] || typeConfig.info
                  return (
                    <div key={n.id} onClick={() => !n.read && markAsRead(n.id)} style={{
                      padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: n.read ? 'default' : 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start', opacity: n.read ? 0.7 : 1,
                    }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name={config.icon} size={18} style={{ color: config.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13, fontWeight: n.read ? 500 : 600, color: n.read ? 'rgba(255,255,255,0.6)' : '#fff' }}>{n.title}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{formatTime(n.timestamp)}</span>
                            <button onClick={(e) => { e.stopPropagation(); dismissNotification(n.id) }} style={{
                              background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '2px 6px', fontSize: 16,
                            }}>×</button>
                          </div>
                        </div>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3, lineHeight: 1.5 }}>{n.message}</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                          {n.source && (
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>{n.source}</span>
                          )}
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: config.bg, color: config.color }}>{config.label}</span>
                          {!n.read && <span style={{ width: 6, height: 6, borderRadius: 3, background: '#007AFF' }} />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
