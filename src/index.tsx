import './style/reset.css'
import './style/master.css'
import { startRender } from './map/render'
import './map/interaction'
import React from 'react'
import { render } from 'react-dom'
import App from './ui/App'

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js')

startRender()
render(<App />, document.getElementById('app'))
