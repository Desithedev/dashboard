import Icon from './Icon'
import { NUMBER_SHORTCUTS } from '../hooks/useKeyboardShortcuts'

interface KeyboardShortcutsHelpProps {
  open: boolean
  onClose: () => void
}

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Oversigt',
  tasks: 'Opgaver',
  agents: 'Agenter',
  skills: 'Færdigheder',
  communication: 'Kommunikation',
  journal: 'Journal',
  documents: 'Dokumenter',
  intelligence: 'Intelligens',
  settings: 'Indstillinger',
}

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
  if (!open) return null

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
        aria-label="Keyboard shortcuts"
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
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>Keyboard shortcuts</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 }}>Tryk Esc for at lukke</div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Luk"
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
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Globalt</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 10, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Kbd>Cmd</Kbd>
                  <Kbd>K</Kbd>
                  <span style={{ color: 'rgba(255,255,255,0.35)', padding: '0 4px' }}>/</span>
                  <Kbd>Ctrl</Kbd>
                  <Kbd>K</Kbd>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Åbn kommandopalet</div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Kbd>Esc</Kbd>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Luk overlays og modals</div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Kbd>?</Kbd>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Vis denne oversigt</div>
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
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Navigation</div>

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
                Tip: Tal-genveje virker kun når du ikke skriver i et inputfelt.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
