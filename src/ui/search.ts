import { useState, useEffect } from 'react'
import Fuse from 'fuse.js'
import locs from 'data/locations/locations.json'

const fuse = new Fuse(locs.locations, { keys: ['name'], threshold: 0.4 })

export function useSearch(term: string) {
  const [results, setResults] = useState<string[]>([])

  useEffect(() => {
    if (!term) return
    setResults(fuse.search(term).map(({ item }) => item.id))
  }, [term])

  return results
}
