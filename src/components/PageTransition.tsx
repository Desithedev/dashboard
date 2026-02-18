import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * PageTransition — Wrapper-komponent til smooth sideskift-animationer.
 *
 * Bruger ren CSS (ingen externe libraries):
 *   - Fade-in: opacity 0 → 1
 *   - Subtle slide-up: translateY(8px) → translateY(0)
 *   - Varighed: 200ms med ease-out kurve
 *
 * Animationen er defineret via `.animate-page-in` i index.css.
 *
 * Brug `key={page}` i App.tsx, så React unmounter og remounter
 * komponenten ved hvert sideskift, hvilket trigger animationen forfra.
 */
export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="animate-page-in">
      {children}
    </div>
  )
}
