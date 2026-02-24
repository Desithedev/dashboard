import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '../Card'
import Icon from '../Icon'
import { MiniLineChart } from '../Chart'
import type { SystemInfo } from './types'

interface SystemHealthProps {
  systemInfo: SystemInfo
  ramPct: number | null
  diskPctValue: number | null
  ramHistory: number[]
  diskHistory: number[]
  consecutiveErrors: number
}

const SystemHealth = memo(function SystemHealth({
  systemInfo,
  ramPct,
  diskPctValue,
  ramHistory,
  diskHistory,
  consecutiveErrors,
}: SystemHealthProps) {
  const { t } = useTranslation()

  const ramColor =
    ramPct === null ? '#8E8E93' :
      ramPct > 90 ? '#FF3B30' :
        ramPct > 70 ? '#FF9F0A' : '#34C759'

  const diskColor =
    diskPctValue === null ? '#8E8E93' :
      diskPctValue > 90 ? '#FF3B30' :
        diskPctValue > 70 ? '#FF9F0A' : '#34C759'

  const connScore = consecutiveErrors === 0 ? 100 : Math.max(0, 100 - consecutiveErrors * 20)
  const connColor =
    connScore >= 80 ? '#34C759' :
      connScore >= 50 ? '#FF9F0A' : '#FF3B30'

  return (
    <Card title={t('components.systemStatus', 'System Status')} subtitle={t('components.status', 'Status')} className="mb-8" style={{ animationDelay: '300ms' }}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gateway Uptime */}
        <div className="flex items-start gap-3">
          <div style={{
            flexShrink: 0, width: 32, height: 32, borderRadius: 8,
            background: 'rgba(48,209,88,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="server" size={16} style={{ color: '#34C759' }} />
          </div>
          <div className="min-w-0">
            <p className="caption text-xs">{t('components.gatewayUptime', 'Gateway Uptime')}</p>
            <p className="text-sm font-semibold text-white truncate">
              {systemInfo.uptime || t('components.unknown', 'Unknown')}
            </p>
          </div>
        </div>

        {/* RAM */}
        <div className="flex items-start gap-3">
          <div style={{
            flexShrink: 0, width: 32, height: 32, borderRadius: 8,
            background: `${ramColor}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="gauge" size={16} style={{ color: ramColor }} />
          </div>
          <div className="min-w-0">
            <p className="caption text-xs">{t('components.workingMemory', 'Working Memory')}</p>
            <p className="text-sm font-semibold text-white truncate">
              {ramPct !== null ? `${ramPct}%` : 'N/A'}
            </p>
            <p className="caption text-xs truncate">
              {systemInfo.ramUsed && systemInfo.ramTotal
                ? `${systemInfo.ramUsed} / ${systemInfo.ramTotal}`
                : ''}
            </p>
            {ramHistory.length >= 2 && (
              <div style={{ marginTop: 4 }}>
                <MiniLineChart data={ramHistory} color="#007AFF" width={80} height={28} />
              </div>
            )}
          </div>
        </div>

        {/* Disk */}
        <div className="flex items-start gap-3">
          <div style={{
            flexShrink: 0, width: 32, height: 32, borderRadius: 8,
            background: `${diskColor}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="folder" size={16} style={{ color: diskColor }} />
          </div>
          <div className="min-w-0">
            <p className="caption text-xs">{t('components.memory', 'Memory')}</p>
            <p className="text-sm font-semibold text-white truncate">
              {diskPctValue !== null ? `${diskPctValue}%` : 'N/A'}
            </p>
            <p className="caption text-xs truncate">
              {systemInfo.diskUsed && systemInfo.diskTotal
                ? `${systemInfo.diskUsed} / ${systemInfo.diskTotal}`
                : ''}
            </p>
            {diskHistory.length >= 2 && (
              <div style={{ marginTop: 4 }}>
                <MiniLineChart data={diskHistory} color="#30D158" width={80} height={28} />
              </div>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-start gap-3">
          <div style={{
            flexShrink: 0, width: 32, height: 32, borderRadius: 8,
            background: `${connColor}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="zap" size={16} style={{ color: connColor }} />
          </div>
          <div className="min-w-0">
            <p className="caption text-xs">{t('pages.dashboard.header', 'Dashboard')}</p>
            <p className="text-sm font-semibold truncate" style={{ color: connColor }}>
              {connScore}%
            </p>
            <p className="caption text-xs truncate">
              {consecutiveErrors === 0 ? t('common.stable', 'Stable') : t('dashboard.errorsCount', '{{count}} errors', { count: consecutiveErrors })}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
})

export default SystemHealth
