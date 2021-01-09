import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import Fuse from 'fuse.js'
import locs from 'data/locations/locations.json'

const fuse = new Fuse(locs.locations, { keys: ['name'], threshold: 0.4 })

export function useSearch(term: string) {
  const [results, setResults] = useState<string[]>([])
  const history = useHistory()

  useEffect(() => {
    if (location.pathname !== '/') history.push('/')
    if (!term) setResults([])
    else setResults(fuse.search(term).map(({ item }) => item.id))
  }, [term])

  return results
}
