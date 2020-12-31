import React from 'react'
import SearchPanel from './SearchPanel'
import { BrowserRouter as Router } from 'react-router-dom'

export default function App() {
  return (
    <Router>
      <SearchPanel />
    </Router>
  )
}
