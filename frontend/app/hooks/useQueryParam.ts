import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

export const useQueryParam = (key: string): string | null => {
  const searchParams = useSearchParams()

  return useMemo(
    () => searchParams.get(key),
    [key, searchParams]
  )
}
