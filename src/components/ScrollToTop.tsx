import { useState, useEffect, useCallback } from 'react'
import Icon from './Icon'

// ScrollToTop — floating knap der vises når brugeren har scrollet 300px ned.
// Apple HIG-inspireret glassmorphism design med smooth fade-in/fade-out.

const SCROLL_THRESHOLD = 300 // px før knappen vises

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  // Lyt på scroll-events og opdater synlighed
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll smooth til toppen
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Beregn dynamiske styles baseret på tilstand
  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 32,
    right: 32,
    width: 44,
    height: 44,
    borderRadius: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    outline: 'none',
    zIndex: 50,

    // Glassmorphism baggrund
    background: pressed
      ? 'rgba(255, 255, 255, 0.15)'
      : hovered
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(20, 20, 30, 0.75)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',

    // Subtle shadow for dybde
    boxShadow: hovered
      ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08)'
      : '0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.04)',

    // Fade-in/fade-out animation via opacity + transform
    opacity: visible ? 1 : 0,
    transform: visible
      ? pressed
        ? 'translateY(0) scale(0.92)'
        : hovered
          ? 'translateY(-2px) scale(1.05)'
          : 'translateY(0) scale(1)'
      : 'translateY(8px) scale(0.9)',
    pointerEvents: visible ? 'auto' : 'none',

    // Smooth transitions
    transition: 'opacity 250ms ease, transform 200ms ease, background 150ms ease, box-shadow 150ms ease',
  }

  return (
    <button
      style={buttonStyle}
      onClick={scrollToTop}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      aria-label="Scroll til toppen"
      title="Scroll til toppen"
    >
      <Icon
        name="chevron-up"
        size={18}
        style={{ color: 'rgba(255, 255, 255, 0.85)' }}
      />
    </button>
  )
}
