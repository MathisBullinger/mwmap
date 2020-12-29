import { startRender as render } from './render'
import './interaction'

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw')

render()
