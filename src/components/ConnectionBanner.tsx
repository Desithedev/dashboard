import { useLiveData } from '../api/LiveDataContext'
import Icon from './Icon'

/**
 * ConnectionBanner — Persistent offline-indikator
 *
 * Vises som en fast, tynd banner øverst i indholds-området når Gateway
 * er utilgængelig. Forsvinder automatisk ved genoprettet forbindelse.
 *
 * Bruger fixed positioning og påvirker IKKE layoutet.
 * På desktop forskydes banneren med sidebarens bredde (240 px / lg:left-60).
 */
export default function ConnectionBanner() {
  const { isConnected, refresh, isRefreshing, lastUpdated, consecutiveErrors } = useLiveData()

  // Vis kun banneren hvis vi aktivt har opdaget manglende forbindelse:
  //   – enten har vi haft mindst én succesfuld forbindelse (lastUpdated)
  //   – eller vi har fået mindst én fejl (consecutiveErrors > 0)
  // Det undgår et falsk "flash" ved første sideindlæsning.
  const shouldShow = !isConnected && (lastUpdated !== null || consecutiveErrors > 0)

  return (
    <div
      aria-live="polite"
      aria-label={shouldShow ? 'Ingen forbindelse til Gateway' : undefined}
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
        // Glassmorphism rødt tema
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
        Ingen forbindelse til Gateway
      </span>

      <button
        onClick={refresh}
        disabled={isRefreshing}
        aria-label="Prøv at genoprette forbindelsen"
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
        Prøv igen
      </button>
    </div>
  )
}
