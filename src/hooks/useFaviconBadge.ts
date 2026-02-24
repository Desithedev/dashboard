import { useEffect } from 'react'
import { useLiveData } from '../api/LiveDataContext'

// SVG favicon content (mirror of /public/favicon.svg)
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#0a0a0f"/>
  <g fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 32 8 L 24 32 L 32 32 L 28 56 L 48 28 L 36 28 L 40 8 Z"/>
  </g>
</svg>`

/**
 * Hook that dynamically updates the favicon with a status dot overlay via Canvas API.
 * Green dot (●) = Gateway connected
 * Red dot (●)   = Gateway not connected
 *
 * Place this hook in a component that is a child of LiveDataProvider.
 */
export function useFaviconBadge() {
  const { isConnected } = useLiveData()

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const svgBlob = new Blob([FAVICON_SVG], { type: 'image/svg+xml' })
    const objectUrl = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      // Draw SVG favicon
      ctx.drawImage(img, 0, 0, 64, 64)
      URL.revokeObjectURL(objectUrl)

      // Dot position: bottom right corner
      const dotX = 49
      const dotY = 49
      const dotRadius = 9

      // Dark ring background for contrast against all backgrounds
      ctx.beginPath()
      ctx.arc(dotX, dotY, dotRadius + 2.5, 0, Math.PI * 2)
      ctx.fillStyle = '#0a0a0f'
      ctx.fill()

      // Status-farvet dot
      ctx.beginPath()
      ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2)
      ctx.fillStyle = isConnected ? '#30d158' : '#ff453a'
      ctx.fill()

      // Set favicon
      const dataUrl = canvas.toDataURL('image/png')
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.type = 'image/png'
      link.href = dataUrl
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
    }

    img.src = objectUrl
  }, [isConnected])
}
