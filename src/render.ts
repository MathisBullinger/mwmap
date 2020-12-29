import throttle from 'lodash/throttle'
import Viewport from './vp'

export const canvas = document.querySelector<HTMLCanvasElement>('#map')
const ctx = canvas.getContext('2d')

export const vp = Viewport.fromCenter(50, 50)

let hasChanged = false
let rId: number = undefined

const tile2Coord = (n: number) => n * (100 / 127)
const coord2Tile = (n: number) => n * (127 / 100)

const tileUrl = (size: number, x: number, y: number) =>
  `/data/${size}/${x}-${y}.webp`

let tileCache: Record<string, Promise<HTMLImageElement> | HTMLImageElement> = {}

const fetchTile = (url: string): Promise<HTMLImageElement> | HTMLImageElement =>
  tileCache[url] ??
  (tileCache[url] = new Promise<HTMLImageElement>((res) => {
    const img = new Image()
    img.onload = () => {
      res(img)
      tileCache[url] = img
    }
    img.src = url
  }))

type MapTile = {
  x: number
  y: number
  size: number
  data: Promise<HTMLImageElement> | HTMLImageElement
}

const showBorders =
  new URLSearchParams(location.search).get('border') === 'show'

function fetchVpGroup(group: number): MapTile[] {
  const bound = (n: number) => Math.min(Math.max(n, 0), 128 / group - 1)
  const minX = bound(Math.floor(coord2Tile(vp.x) / group))
  const maxX = bound(Math.floor(coord2Tile(vp.x + vp.w) / group))
  const minY = bound(Math.floor(coord2Tile(vp.y) / group))
  const maxY = bound(Math.floor(coord2Tile(vp.y + vp.h) / group))

  const tiles: MapTile[] = []

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      tiles.push({
        x,
        y,
        size: group,
        data: fetchTile(tileUrl(group, x, y)),
      })
    }
  }

  return tiles
}

function findFallback(tile: MapTile): MapTile | undefined {
  let x = tile.x
  let y = tile.y
  for (let size = tile.size * 2; size <= 128; size *= 2) {
    x = (x / 2) | 0
    y = (y / 2) | 0
    const url = tileUrl(size, x, y)
    if (tileCache[url] instanceof HTMLImageElement)
      return { size, x, y, data: tileCache[url] }
  }
  return
}

function getMaps(): MapTile[] {
  const totalMapHeight = (canvas.height * 1) / (vp.h / 100)
  const scale = 1 / Math.min(totalMapHeight / (256 * 128), 1)
  const group = 8 * 2 ** (Math.log2(scale) | 0)

  return fetchVpGroup(Math.min(group, 128))
}

function render() {
  console.log('render')
  rId = undefined
  ctx.fillStyle = 'rgb(118,124,173)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const maps = getMaps()

  const tiles: (MapTile & { data: HTMLImageElement })[] = []

  for (const tile of maps) {
    if (tile.data instanceof HTMLImageElement) tiles.push(tile as any)
    else {
      const fallback = findFallback(tile)
      if (fallback) tiles.push(fallback as any)
      tile.data.then(startRender)
    }
  }

  tiles
    .map((tile) => ({ ...tile, key: `${tile.x}-${tile.y}-${tile.size}` }))
    .filter(({ key }, i, arr) => arr.findIndex((v) => v.key === key) === i)
    .sort((a, b) => b.size - a.size)
    .forEach((v) => renderTile(v.x, v.y, v.size, v.data))

  if (!hasChanged) return
  hasChanged = false
  rId = requestAnimationFrame(render)
}

function renderTile(
  x: number,
  y: number,
  size: number,
  tile: HTMLImageElement
) {
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
  else rId = requestAnimationFrame(render)
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
