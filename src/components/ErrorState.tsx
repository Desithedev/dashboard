import Icon from './Icon'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  compact?: boolean
}

/**
 * Genbrugelig inline fejl-state til sider der fetcher data.
 * Vis når et API-kald fejler – med ikon, besked og valgfri retry-knap.
 */
export default function ErrorState({
  title = 'Noget gik galt',
  message = 'Der opstod en fejl. Prøv at hente data igen.',
  onRetry,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? '24px 16px' : '48px 24px',
        textAlign: 'center',
      }}
    >
      {/* Ikon */}
      <div
        style={{
          width: compact ? '40px' : '56px',
          height: compact ? '40px' : '56px',
          borderRadius: compact ? '10px' : '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 69, 58, 0.1)',
          border: '1px solid rgba(255, 69, 58, 0.2)',
          marginBottom: compact ? '12px' : '16px',
          flexShrink: 0,
        }}
      >
        <Icon
          name="exclamation-triangle"
          size={compact ? 20 : 28}
          style={{ color: '#FF453A' }}
        />
      </div>

      {/* Titel */}
      <p
        style={{
          fontSize: compact ? '14px' : '15px',
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.85)',
          marginBottom: '6px',
          lineHeight: '1.3',
        }}
      >
        {title}
      </p>

      {/* Besked */}
      <p
        style={{
          fontSize: compact ? '12px' : '13px',
          color: 'rgba(255, 255, 255, 0.4)',
          marginBottom: onRetry ? (compact ? '14px' : '20px') : '0',
          lineHeight: '1.55',
          maxWidth: '300px',
        }}
      >
        {message}
      </p>

      {/* Retry-knap */}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: compact ? '8px 16px' : '10px 20px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#007AFF',
            background: 'rgba(0, 122, 255, 0.08)',
            border: '1px solid rgba(0, 122, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 122, 255, 0.15)'
            e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.35)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 122, 255, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.2)'
          }}
        >
          <Icon name="arrow-path" size={13} />
          Prøv igen
        </button>
      )}
    </div>
  )
}
