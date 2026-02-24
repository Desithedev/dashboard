import { useEffect, useRef } from 'react'

/**
 * useScrollToTop — Scrolls the window to the top on page change.
 * Run `window.scrollTo(0, 0)` immediately when `page` changes,
 * so the user always starts at the top of the new page.
 *
 * @param page - The active page key (e.g. 'dashboard', 'tasks')
 */
export function useScrollToTop(page: string): void {
  const prevPageRef = useRef(page)

  useEffect(() => {
    if (prevPageRef.current !== page) {
      window.scrollTo(0, 0)
      prevPageRef.current = page
    }
  }, [page])
}
