import { memo } from 'react'
import Card from '../Card'
import { DonutChart } from '../Chart'
import type { SystemInfo } from './types'

interface SystemInfoGridProps {
  parsedStatus: Record<string, string>
  systemInfo: SystemInfo
  runningCount: number
  completedCount: number
  formattedCost: string
  tokensIn: number
  tokensOut: number
  costUSD: number
}

const SystemInfoGrid = memo(function SystemInfoGrid({
  parsedStatus,
  systemInfo,
  runningCount,
  completedCount,
  formattedCost,
  tokensIn,
  tokensOut,
  costUSD,
}: SystemInfoGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
      {/* Systeminformation */}
      <Card title="System">
        <div className="space-y-2 text-sm min-w-0">
          {parsedStatus.version && (
            <div className="flex justify-between">
              <span className="caption">Version</span>
              <span className="font-medium truncate ml-2">{parsedStatus.version}</span>
            </div>
          )}
          {parsedStatus.runtime && (
            <div className="flex justify-between">
              <span className="caption">Runtime</span>
              <span className="font-medium truncate ml-2">{parsedStatus.runtime}</span>
            </div>
          )}
          {parsedStatus.session && (
            <div className="flex justify-between gap-2 min-w-0">
              <span className="caption flex-shrink-0">Session</span>
              <span className="font-medium truncate">{parsedStatus.session}</span>
            </div>
          )}
          {parsedStatus.queue && (
            <div className="flex justify-between">
              <span className="caption">Koe</span>
              <span className="font-medium truncate ml-2">{parsedStatus.queue}</span>
            </div>
          )}
          {systemInfo.host && (
            <div className="flex justify-between">
              <span className="caption">Vaert</span>
              <span className="font-medium truncate ml-2">{systemInfo.host}</span>
            </div>
          )}
          {systemInfo.os && (
            <div className="flex justify-between">
              <span className="caption">OS</span>
              <span className="font-medium truncate ml-2">{systemInfo.os}</span>
            </div>
          )}
          {systemInfo.ramUsed && systemInfo.ramTotal && (
            <div className="flex justify-between">
              <span className="caption">RAM</span>
              <span className="font-medium truncate ml-2">{systemInfo.ramUsed} / {systemInfo.ramTotal}</span>
            </div>
          )}
          {systemInfo.diskUsed && systemInfo.diskTotal && (
            <div className="flex justify-between">
              <span className="caption">Disk</span>
              <span className="font-medium truncate ml-2">
                {systemInfo.diskUsed} / {systemInfo.diskTotal} ({systemInfo.diskPercent}%)
              </span>
            </div>
          )}
          {systemInfo.uptime && (
            <div className="flex justify-between">
              <span className="caption">Oppetid</span>
              <span className="font-medium truncate ml-2">{systemInfo.uptime}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Agentstatus donut */}
      <Card title="Agentstatus" className="col-span-1">
        {runningCount === 0 && completedCount === 0 ? (
          <div className="text-center py-8 text-white/50 text-sm">Ingen sessioner</div>
        ) : (
          <DonutChart segments={[
            { value: runningCount || 1, color: '#34C759', label: 'Kørende' },
            { value: completedCount || 0, color: '#007AFF', label: 'Afsluttet' },
          ].filter(s => s.value > 0)} />
        )}
      </Card>

      {/* Estimeret forbrug */}
      <Card title="Estimeret Forbrug">
        <div className="text-center py-8 min-w-0">
          <p className="text-3xl font-bold text-white mb-2">{formattedCost}</p>
          <p className="caption mb-4">Aktuel session</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="caption">Input tokens</span>
              <span className="font-medium">
                {tokensIn >= 1_000_000
                  ? `${(tokensIn / 1_000_000).toFixed(2)}M`
                  : `${Math.round(tokensIn / 1000)}k`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="caption">Output tokens</span>
              <span className="font-medium">
                {tokensOut >= 1_000_000
                  ? `${(tokensOut / 1_000_000).toFixed(2)}M`
                  : `${Math.round(tokensOut / 1000)}k`}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="caption">Estimeret USD</span>
              <span className="font-medium">${costUSD.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
})

export default SystemInfoGrid
