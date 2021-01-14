import { vp, startRender } from './render'
import debounce from 'lodash/debounce'
import { locations } from 'data/locations/locations.json'

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

const pinchControl =
  /Macintosh/.test(navigator.userAgent) && !/Apple/.test(navigator.vendor)

const limit = (n: number, b: number) =>
  Math.min(Math.abs(n), b) * (n < 0 ? -1 : 1)

const pan = (dx: number, dy: number) => {
  vp.x += dx / (1 / vp.vMin) / 1500
  vp.y += dy / (1 / vp.vMin) / 1500
  keepBound()
  startRender()
}

const zoom = (dZ: number, [x, y]: [x: number, y: number], absolute = false) => {
  if (absolute) dZ = dZ / vp.vMin

  const min = Math.min(vp.w, vp.h)
  if (min * dZ < minZoom) dZ = minZoom / min
  if (min * dZ > maxZoom) dZ = maxZoom / min
  vp.w *= dZ
  vp.h *= dZ
  vp.x += ((vp.w / dZ - vp.w) / 2) * (x * 2)
  vp.y += ((vp.h / dZ - vp.h) / 2) * (y * 2)
  keepBound()
  startRender()
}

let afId: number | undefined = undefined
const animZoom = (dZ: number, [x, y]: [x: number, y: number]) => {
  let steps = 10

  const stepSize = (vp.vMin * dZ - vp.vMin) / steps

  let step = (n = 0) => {
    zoom(vp.vMin + stepSize, [x, y], true)
    if (n >= 1) return
    afId = requestAnimationFrame(() => step(n + 1 / steps))
  }
  step()
}

const keepBound = () => {
  const zLim = Math.min(vp.w, vp.h) / 2
  if (vp.x < -zLim) vp.x = -zLim
  if (vp.y < -zLim) vp.y = -zLim
  if (vp.x + vp.w > 100 + zLim) vp.x = 100 + zLim - vp.w
  if (vp.y + vp.h > 100 + zLim) vp.y = 100 + zLim - vp.h
}

mapRoot.addEventListener('wheel', e => {
  e.preventDefault()
  cancelAnimationFrame(afId!)
  if (pinchControl ? e.ctrlKey : !e.ctrlKey) {
    const discrete = Math.abs(e.deltaY) > 40

    const dM = limit(e.deltaY, 40) / 100
    let dZ = dM < 0 ? 1 / (1 + Math.abs(dM)) : 1 + dM

    if (discrete)
      animZoom(dZ, [
        e.clientX / window.innerWidth,
        e.clientY / window.innerHeight,
      ])
    else
      zoom(dZ, [e.clientX / window.innerWidth, e.clientY / window.innerHeight])
  } else pan(e.deltaX, e.deltaY)

  storeURL()
})

mapRoot.addEventListener('mousedown', () => {
  cancelAnimationFrame(afId!)
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

const printClickCoord = false

mapRoot.addEventListener('click', ({ clientX, clientY, target }) => {
  if (!printClickCoord) return
  const canvas = target as HTMLCanvasElement
  const x = vp.x + (clientX / canvas.offsetWidth) * vp.w
  const y = vp.y + (clientY / canvas.offsetHeight) * vp.h
  console.log(...[x, y].map(v => Math.round(v * 100)))
})

export const goto = (id: string) => {
  const location = locations.find(v => v.id === id)
  if (!location) return
  const [x, y] = location.coords

  const vx = (x * 100 - vp.x) / vp.w
  const vy = (y * 100 - vp.y) / vp.h

  animZoom(5 / vp.vMin, [vx, vy])
}
