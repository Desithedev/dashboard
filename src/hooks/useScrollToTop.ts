import { useEffect, useRef } from 'react'

/**
 * useScrollToTop — scroller vinduet til toppen ved page-skift.
 * Kør `window.scrollTo(0, 0)` umiddelbart når `page` ændres,
 * så brugeren altid starter øverst på den nye side.
 *
 * @param page - Den aktive side-nøgle (f.eks. 'dashboard', 'tasks')
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
