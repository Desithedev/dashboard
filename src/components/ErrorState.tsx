import { useTranslation } from 'react-i18next'
import Icon from './Icon'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  compact?: boolean
}

/**
 * Reusable inline error state for data fetching pages.
 * Shown when an API call fails – with icon, message and optional retry button.
 */
export default function ErrorState({
  title,
  message,
  onRetry,
  compact = false,
}: ErrorStateProps) {
  const { t } = useTranslation()
  const displayTitle = title || t('common.errors.title', 'Something went wrong')
  const displayMessage = message || t('common.errors.message', 'An error occurred. Please try to fetch data again.')
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
      {/* Icon */}
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

      {/* Title */}
      <p
        style={{
          fontSize: compact ? '14px' : '15px',
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.85)',
          marginBottom: '6px',
          lineHeight: '1.3',
        }}
      >
        {displayTitle}
      </p>

      {/* Message */}
      <p
        style={{
          fontSize: compact ? '12px' : '13px',
          color: 'rgba(255, 255, 255, 0.4)',
          marginBottom: onRetry ? (compact ? '14px' : '20px') : '0',
          lineHeight: '1.55',
          maxWidth: '300px',
        }}
      >
        {displayMessage}
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
          {t('common.retry', 'Try again')}
        </button>
      )}
    </div>
  )
}
