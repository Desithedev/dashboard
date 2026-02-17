import Icon from '../components/Icon'

export default function NotFound() {
  const hash = window.location.hash.replace('#', '') || '/'

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '6px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <Icon name="map" size={64} style={{ color: 'rgba(255, 255, 255, 0.35)' }} />
        </div>

        <h1
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: 'rgba(255, 255, 255, 0.12)',
            marginBottom: '8px',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'rgba(255, 255, 255, 0.92)',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}
        >
          Side ikke fundet
        </h2>

        <p
          style={{
            fontSize: '15px',
            color: 'rgba(255, 255, 255, 0.55)',
            marginBottom: '8px',
            lineHeight: '1.6',
          }}
        >
          Ruten du leder efter findes ikke.
        </p>

        <p
          style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.3)',
            marginBottom: '32px',
            fontFamily: 'monospace',
          }}
        >
          #{hash}
        </p>

        <button
          onClick={() => { window.location.hash = '#dashboard' }}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'white',
            background: 'linear-gradient(135deg, #007AFF 0%, rgba(0, 122, 255, 0.9) 100%)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3), 0 0 40px rgba(0, 122, 255, 0.15)',
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #0066d6 0%, rgba(0, 102, 214, 0.9) 100%)'
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 122, 255, 0.4), 0 0 60px rgba(0, 122, 255, 0.2)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, rgba(0, 122, 255, 0.9) 100%)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 122, 255, 0.3), 0 0 40px rgba(0, 122, 255, 0.15)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="arrow-left" size={14} />
            Gå til Dashboard
          </span>
        </button>
      </div>
    </div>
  )
}
