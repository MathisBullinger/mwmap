import { vp, startRender } from './render'
import debounce from 'lodash/debounce'

const round = (n: number, digits = 0) => {
  const f = 10 ** digits
  return Math.round(n * f) / f
}

const storeURL = debounce(() => {
  const [x, y] = vp.center
  history.pushState(
    '',
    document.title,
    `#${round(y, 2)},${round(x, 2)},${round(vp.vMin, 2)}z`
  )
}, 200)

const minZoom = 3
const maxZoom = 100

const mapRoot = document.getElementById('map-root')!

mapRoot.addEventListener('wheel', e => {
  e.preventDefault()
  const min = Math.min(vp.w, vp.h)
  if (e.ctrlKey) {
    let dZ = 1 + e.deltaY / 200
    if (min * dZ < minZoom) dZ = minZoom / min
    if (min * dZ > maxZoom) dZ = maxZoom / min
    vp.w *= dZ
    vp.h *= dZ
    const cx = e.clientX / window.innerWidth
    const cy = e.clientY / window.innerHeight
    vp.x += ((vp.w / dZ - vp.w) / 2) * (cx * 2)
    vp.y += ((vp.h / dZ - vp.h) / 2) * (cy * 2)
    startRender()
  } else {
    vp.x += e.deltaX / (1 / vp.vMin) / 1500
    vp.y += e.deltaY / (1 / vp.vMin) / 1500
    startRender()
  }
  const limit = min / 2
  if (vp.x < -limit) vp.x = -limit
  if (vp.y < -limit) vp.y = -limit
  if (vp.x + vp.w > 100 + limit) vp.x = 100 + limit - vp.w
  if (vp.y + vp.h > 100 + limit) vp.y = 100 + limit - vp.h
  storeURL()
})

mapRoot.addEventListener('mousedown', () => {
  mapRoot.style.cursor = 'grabbing'
  mapRoot.addEventListener('mousemove', drag)

  const remove = () => {
    mapRoot.removeEventListener('mousemove', drag)
    mapRoot.removeEventListener('mouseenter', onEnter)
    mapRoot.style.cursor = 'grab'
  }

  const onEnter = (e: MouseEvent) => {
    if (e.buttons === 0) remove()
  }

  mapRoot.addEventListener('mouseenter', onEnter)
  mapRoot.addEventListener('mouseup', remove, { once: true })
})

function drag(e: MouseEvent) {
  const dx = e.movementX / window.innerWidth
  const dy = e.movementY / window.innerHeight
  vp.x -= dx * vp.w
  vp.y -= dy * vp.h
  startRender()
  storeURL()
}

mapRoot.addEventListener('click', ({ clientX, clientY, target }) => {
  const canvas = target as HTMLCanvasElement
  const x = vp.x + (clientX / canvas.offsetWidth) * vp.w
  const y = vp.y + (clientY / canvas.offsetHeight) * vp.h
  console.log(...[x, y].map(v => Math.round(v * 100)))
})
