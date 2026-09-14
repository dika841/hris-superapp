import * as React from 'react'

/**
 * Hook to debounce any fast changing value.
 * @param value The value to debounce
 * @param delay Delay in milliseconds (default 300)
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook that returns a memoized debounced callback.
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay = 300
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  const callbackRef = React.useRef(callback)
  callbackRef.current = callback

  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancel = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const debounced = React.useCallback(
    (...args: Parameters<T>) => {
      cancel()
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
        timeoutRef.current = null
      }, delay)
    },
    [cancel, delay]
  ) as ((...args: Parameters<T>) => void) & { cancel: () => void }

  debounced.cancel = cancel

  React.useEffect(() => {
    return cancel
  }, [cancel])

  return debounced
}
