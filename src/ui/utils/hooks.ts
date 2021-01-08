import { useState, useEffect, useRef } from 'react'

export function useComputed<T extends any[], R>(
  compute: (...v: T) => R,
  ...deps: T
): R {
  let didMount = useRef(false)
  const [state, setState] = useState(compute(...deps))

  useEffect(() => {
    if (!didMount.current) didMount.current = true
    else setState(compute(...deps))
  }, [...deps])

  return state
}
