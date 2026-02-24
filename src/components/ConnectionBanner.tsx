import { useLiveData } from '../api/LiveDataContext'
import Icon from './Icon'
import { useTranslation } from 'react-i18next'

/**
 * ConnectionBanner — Persistent offline indicator
 *
 * Appears as a fixed, thin banner at the top of the content area when the Gateway
 * is unavailable. Disappears automatically when the connection is restored.
 *
 * Uses fixed positioning and does NOT affect the layout.
 * On desktop, the banner is offset by the sidebar width (240 px / lg:left-60).
 */
export default function ConnectionBanner() {
  const { isConnected, refresh, isRefreshing, lastUpdated, consecutiveErrors } = useLiveData()
  const { t } = useTranslation()

  //   – enten har vi haft mindst én succesfuld forbindelse (lastUpdated)
  //   – or we have received at least one error (consecutiveErrors > 0)
  // This avoids a false "flash" on first page load.
  const shouldShow = !isConnected && (lastUpdated !== null || consecutiveErrors > 0)

  return (
    <div
      aria-live="polite"
      aria-label={
        shouldShow
          ? t('connection.offlineBannerLabel', 'Connection to Gateway lost')
          : undefined
      }
      className="lg:left-60"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        zIndex: 45,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        // Glassmorphism red theme
        background: 'rgba(255, 59, 48, 0.13)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderBottom: '1px solid rgba(255, 59, 48, 0.28)',
        boxShadow: '0 2px 20px rgba(255, 59, 48, 0.18)',
        // Slide-down animation
        transform: shouldShow ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 320ms cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: shouldShow ? 'auto' : 'none',
      }}
    >
      <Icon
        name="exclamation-triangle"
        size={14}
        style={{ color: '#FF3B30', flexShrink: 0 }}
      />

      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.85)',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
        }}
      >
        {t(
          'connection.offlineBannerMsg',
          'Connection to Gateway lost — attempting to reconnect...'
        )}
      </span>

      <button
        onClick={refresh}
        disabled={isRefreshing}
        aria-label={t('connection.offlineBannerLabel', 'Connection to Gateway lost')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 4,
          paddingBottom: 4,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          color: 'white',
          background: isRefreshing ? 'rgba(0, 122, 255, 0.5)' : '#007AFF',
          border: 'none',
          cursor: isRefreshing ? 'not-allowed' : 'pointer',
          transition: 'background 150ms ease, opacity 150ms ease',
          outline: 'none',
          marginLeft: 2,
          opacity: isRefreshing ? 0.7 : 1,
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          if (!isRefreshing) e.currentTarget.style.background = '#0066DD'
        }}
        onMouseLeave={e => {
          if (!isRefreshing) e.currentTarget.style.background = '#007AFF'
        }}
      >
        <Icon
          name="restart"
          size={11}
          style={{
            // Spinner-effekt under refresh
            transition: 'transform 600ms ease',
            transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)',
          }}
        />
        {t('dashboard.retry', 'Try again')}
      </button>
    </div>
  )
}
