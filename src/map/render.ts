import throttle from 'lodash/throttle'
import Viewport from './vp'
import locations from '../../data/locations/formatted.json'
import regData from '../../data/locations/regions'

export const canvas = document.getElementById('map') as HTMLCanvasElement
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

export const vp = Viewport.fromCenter(50, 50)

let hasChanged = false
let rId: number | undefined = undefined

const tile2Coord = (n: number) => n * (100 / 127)
const coord2Tile = (n: number) => n * (127 / 100)
const screenSpace = (x: number, y: number): [number, number] => {
  const cx = (x * (100 / vp.w) - vp.x / vp.w) * canvas.width
  const cy = (y * (100 / vp.h) - vp.y / vp.h) * canvas.height
  return [cx, cy]
}
const world2Screen = (x: number, y: number): [number, number] => [
  ((x - vp.x) / vp.w) * canvas.width,
  ((y - vp.y) / vp.h) * canvas.height,
]

const tileUrl = (size: number, x: number, y: number) =>
  `https://mwmap.s3.amazonaws.com/${size}/${x}-${y}.webp`

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
  rId = undefined
  ctx.fillStyle = 'rgb(118,124,173)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#ff0'
  ctx.strokeStyle = '#f00'

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

  ctx.font = `${10 * devicePixelRatio}px monospace`
  tiles
    .map((tile) => ({ ...tile, key: `${tile.x}-${tile.y}-${tile.size}` }))
    .filter(({ key }, i, arr) => arr.findIndex((v) => v.key === key) === i)
    .sort((a, b) => b.size - a.size)
    .forEach((v) => renderTile(v.x, v.y, v.size, v.data))

  ctx.textBaseline = 'middle'
  ctx.font = `${12 * devicePixelRatio}px monospace`
  // renderRegions()
  // renderLocations()

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
  ctx.setLineDash([20, 20])
  ctx.beginPath()
  ctx.rect(cx, cy, cw + 1, ch + 1)
  ctx.stroke()
  ctx.fillText(`${x} ${y} (${size})`, cx + 15, cy + ch - 15)
}

const worldSpace = {
  left: -278528,
  right: 245760 - 8192 / 2,
  top: 303104,
  bottom: -221184 + 8192 / 2,
}

const locCoord = (x: number, y: number): [number, number] => [
  (x - worldSpace.left) / (worldSpace.right - worldSpace.left),
  (y - worldSpace.top) / (worldSpace.bottom - worldSpace.top),
]

function renderLocations() {
  for (const loc of locations) {
    const [cx, cy] = screenSpace(...locCoord(loc.X, loc.Y))
    const ms = 6 * devicePixelRatio
    ctx.fillRect(cx - ms / 2, cy - ms / 2, ms, ms)
    ctx.fillText(loc.name, cx + ms, cy)
  }
}

function drawPath(path: number[][]) {
  ctx.moveTo(...world2Screen(...(regData.coords[path[0]] as [number, number])))
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(
      ...world2Screen(...(regData.coords[path[i]] as [number, number]))
    )
  }
  ctx.closePath()
}

function renderRegions() {
  for (const { name, coords, color, surrounds } of regData.regions) {
    ctx.fillStyle = color + '77'
    ctx.beginPath()
    drawPath(coords)
    for (let name of surrounds ?? []) {
      drawPath(regData.regions.find((v) => v.name === name)?.coords ?? [])
    }
    ctx.fill()
  }
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
