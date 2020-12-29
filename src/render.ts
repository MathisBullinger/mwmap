import throttle from 'lodash/throttle'
import Viewport from './vp'

type Box = {
  x: number
  y: number
  w: number
  h: number
}

export const canvas = document.querySelector<HTMLCanvasElement>('#map')
const ctx = canvas.getContext('2d')

export const vp = Viewport.fromCenter(50, 50)

let hasChanged = false
let rId: number = undefined

let fetches: Record<string, Promise<HTMLImageElement>> = {}

const fetchTile = async (url: string) =>
  fetches[url] ??
  (fetches[url] = new Promise<HTMLImageElement>((res) => {
    const img = new Image()
    img.onload = () => {
      res(img)
    }
    img.src = url
  }))

type MapTile = {
  x: number
  y: number
  size: number
  data: Promise<HTMLImageElement>
}

const showBorders =
  new URLSearchParams(location.search).get('border') === 'show'

function fetchVpGroup(group: number): MapTile[] {
  const bound = (n: number) => Math.min(Math.max(n, 0), 128 / group - 1)
  const minX = bound(Math.floor(vp.x / group))
  const maxX = bound(Math.floor((vp.x + vp.w) / group))
  const minY = bound(Math.floor(vp.y / group))
  const maxY = bound(Math.floor((vp.y + vp.h) / group))

  const tiles: MapTile[] = []

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      tiles.push({
        x,
        y,
        size: group,
        data: fetchTile(`/data/${group}/${x}-${y}.png`),
      })
    }
  }

  return tiles
}

function getMaps(): MapTile[] {
  const totalMapHeight = (canvas.height * 1) / (vp.h / 100)
  const scale = 1 / Math.min(totalMapHeight / (256 * 128), 1)
  const group = 8 * 2 ** (Math.log2(scale) | 0)

  return fetchVpGroup(Math.min(group, 128))
}

function render() {
  rId = undefined
  ctx.fillStyle = 'rgb(118,124,173)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const maps = getMaps()
  for (const { x, y, size, data } of maps) {
    data.then((img) => {
      renderTile(x, y, size, img)
    })
  }

  if (!hasChanged) return
  hasChanged = false
  rId = requestAnimationFrame(render)
}

const tile2Coord = (n: number) => n * (100 / 127)

function renderTile(
  x: number,
  y: number,
  size: number,
  tile: HTMLImageElement
) {
  // const offX = -(vp.x / vp.w) * canvas.width
  // const offY = -(vp.y / vp.h) * canvas.height

  // const cx = ((tile2Coord(x) * tile2Coord(size)) / vp.w) * canvas.width + offX

  const cx = ((tile2Coord(x * size) - vp.x) / vp.w) * canvas.width
  const cy = ((tile2Coord(y * size) - vp.y) / vp.h) * canvas.height

  const cw = (tile2Coord(size) / vp.w) * canvas.width
  const ch = (tile2Coord(size) / vp.h) * canvas.height

  ctx.drawImage(tile, cx, cy, cw, ch)

  if (!showBorders) return
  ctx.strokeStyle = '#f00'
  ctx.setLineDash([20, 20])
  ctx.beginPath()
  ctx.rect(cx, cy, cw + 1, ch + 1)
  ctx.stroke()
  ctx.font = `${10 * devicePixelRatio}px monospace`
  ctx.fillStyle = '#f00'
  ctx.fillText(`${x} ${y} (${size})`, cx + 15, cy + ch - 15)
}

export function startRender() {
  if (rId) hasChanged = true
  else requestAnimationFrame(render)
}

window.addEventListener(
  'resize',
  throttle(
    () => {
      setSize()
      startRender()
    },
    100,
    { leading: false, trailing: true }
  )
)
setSize()
startRender()

function setSize() {
  canvas.width = window.innerWidth * devicePixelRatio
  canvas.height = window.innerHeight * devicePixelRatio
  vp.resize()
}
