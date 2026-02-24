import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '../Card'
import Icon from '../Icon'
import { useToast } from '../../hooks/useToast'

interface QuickActionsProps {
  onHealthcheck: () => void
}

const QuickActions = memo(function QuickActions({ onHealthcheck }: QuickActionsProps) {
  const { t } = useTranslation()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [confirmRestart, setConfirmRestart] = useState(false)
  const toast = useToast()

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.2s ease', flex: '1 1 0',
    justifyContent: 'center', minWidth: 140,
  }

  const handleAction = async (key: string, action: () => Promise<void> | void) => {
    setLoadingAction(key)
    try { await action() } finally {
      setTimeout(() => setLoadingAction(null), 600)
    }
  }

  return (
    <div className="mb-8">
      <Card title={t('dashboard.quickActions', 'Quick Actions')} subtitle={t('dashboard.quickActionsSubtitle', 'Common actions')}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {/* Restart Gateway */}
          {confirmRestart ? (
            <div style={{ ...btnBase, flexDirection: 'column', gap: 8, background: 'rgba(255,59,48,0.1)', borderColor: 'rgba(255,59,48,0.3)' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t('dashboard.confirmRestart', 'Confirm restart?')}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    setConfirmRestart(false)
                    handleAction('restart', async () => {
                      toast.warning(t('dashboard.restartingGateway', 'Restarting Gateway...'))
                      try {
                        await fetch('/api/gateway/restart', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('gateway_token') || ''}` },
                        })
                      } catch { }
                    })
                  }}
                  style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: '#FF3B30', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  {t('dashboard.yesRestart', 'Yes, restart')}
                </button>
                <button
                  onClick={() => setConfirmRestart(false)}
                  style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  {t('common.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          ) : (
            <button
              style={btnBase}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              onClick={() => setConfirmRestart(true)}
              disabled={loadingAction === 'restart'}
            >
              <Icon name="restart" size={16} /> {loadingAction === 'restart' ? t('dashboard.restarting', 'Restarting...') : t('dashboard.restartGateway', 'Restart Gateway')}
            </button>
          )}

          {/* Clear Cache */}
          <button
            style={btnBase}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            onClick={() => handleAction('cache', async () => {
              toast.info(t('dashboard.clearingCache', 'Cache cleared — reloading...'))
              localStorage.clear()
              window.location.reload()
            })}
            disabled={loadingAction === 'cache'}
          >
            <Icon name="xmark" size={16} /> {loadingAction === 'cache' ? t('dashboard.clearing', 'Clearing...') : t('dashboard.clearCache', 'Clear Cache')}
          </button>

          {/* Run Healthcheck */}
          <button
            style={btnBase}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            onClick={() => handleAction('health', async () => { onHealthcheck(); toast.success(t('dashboard.healthcheckStarted', 'Healthcheck started')) })}
            disabled={loadingAction === 'health'}
          >
            <Icon name="gauge" size={16} /> {loadingAction === 'health' ? t('dashboard.checking', 'Checking...') : t('dashboard.runHealthcheck', 'Run Healthcheck')}
          </button>

          {/* Open GitHub */}
          <button
            style={btnBase}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            onClick={() => window.open('https://github.com/MartinSarvio/mission-kontrol', '_blank')}
          >
            <Icon name="globe" size={16} /> {t('dashboard.openGithub', 'Open GitHub')}
          </button>
        </div>
      </Card>
    </div>
  )
})

export default QuickActions
