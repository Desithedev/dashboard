import Icon from './Icon'
import { useTranslation } from 'react-i18next'
import { NUMBER_SHORTCUTS } from '../hooks/useKeyboardShortcuts'

interface KeyboardShortcutsHelpProps {
  open: boolean
  onClose: () => void
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      style={{
        padding: '2px 8px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 650,
        background: 'rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.75)',
        border: '1px solid rgba(255,255,255,0.12)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      }}
    >
      {children}
    </kbd>
  )
}

export default function KeyboardShortcutsHelp({ open, onClose }: KeyboardShortcutsHelpProps) {
  const { t } = useTranslation()
  if (!open) return null

  const PAGE_LABELS: Record<string, string> = {
    dashboard: t('shortcuts.pages.dashboard', 'Dashboard'),
    tasks: t('shortcuts.pages.tasks', 'Tasks'),
    agents: t('shortcuts.pages.agents', 'Agents'),
    skills: t('shortcuts.pages.skills', 'Skills'),
    communication: t('shortcuts.pages.communication', 'Communication'),
    journal: t('shortcuts.pages.journal', 'Journal'),
    documents: t('shortcuts.pages.documents', 'Documents'),
    intelligence: t('shortcuts.pages.intelligence', 'Intelligence'),
    settings: t('shortcuts.pages.settings', 'Settings'),
  }

  const navShortcuts = Object.entries(NUMBER_SHORTCUTS)
    .map(([key, pageId]) => ({
      key,
      pageId,
      label: PAGE_LABELS[pageId] || pageId,
    }))

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(10,10,15,0.72)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '10vh 16px 24px',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('shortcuts.title', 'Keyboard shortcuts')}
        style={{
          width: '100%',
          maxWidth: 860,
          background: 'rgba(20,20,30,0.75)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 18,
          boxShadow: '0 24px 90px rgba(0,0,0,0.65)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '16px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(59,130,246,0.14)',
                border: '1px solid rgba(255,255,255,0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="command" size={18} style={{ color: '#60a5fa' }} />
            </div>
            <div className="min-w-0">
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{t('shortcuts.title', 'Keyboard shortcuts')}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 }}>{t('shortcuts.closeHint', 'Press Esc to close')}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={t('common.cancel', 'Cancel')}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.75)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon name="xmark" size={18} />
          </button>
        </div>

        <div style={{ padding: 18 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Global */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 14,
              }}
            >
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{t('shortcuts.global', 'Global')}</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 10, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Kbd>Cmd</Kbd>
                  <Kbd>K</Kbd>
                  <span style={{ color: 'rgba(255,255,255,0.35)', padding: '0 4px' }}>/</span>
                  <Kbd>Ctrl</Kbd>
                  <Kbd>K</Kbd>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{t('shortcuts.palette', 'Open command palette')}</div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Kbd>Esc</Kbd>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{t('shortcuts.closeOverlays', 'Close overlays and modals')}</div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Kbd>?</Kbd>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{t('shortcuts.showHelp', 'Show this overview')}</div>
              </div>
            </div>

            {/* Navigation */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 14,
              }}
            >
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{t('shortcuts.navigation', 'Navigation')}</div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 10,
                }}
              >
                {navShortcuts.map(s => (
                  <div
                    key={s.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      minWidth: 0,
                    }}
                  >
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                    <Kbd>{s.key}</Kbd>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                {t('shortcuts.navHint', 'Tip: Number shortcuts only work when you are not typing in an input field.')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
