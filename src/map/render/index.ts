import Viewport from './vp'
import { locations } from 'data/locations/locations.json'
import regData from 'data/locations/regions.js'
import tileFuncs, { fetchTile, findFallback, MapTile } from './tiles'
import utils from './utils'
import getCanvas from './canvas'
import store from '../store'
import { deepObserve } from 'mobx-utils'
import { pick } from 'src/utils/path'
import locFilters from '../filters'

const locById = Object.fromEntries(locations.map(v => [v.id, v]))

deepObserve(store, () => {
  startRender()
})

const [y, x, z] = location.hash
  .slice(1, -1)
  .split(',')
  .filter(Boolean)
  .map(v => parseFloat(v))
export const vp = Viewport.fromCenter(x ?? 50, y ?? 50, z ?? 80)

const { canvas, ctx } = getCanvas(vp, startRender)
const { world2Screen, tile2Coord, screenSpace } = utils(vp, canvas)
const { fetchVpGroup, idealGroup } = tileFuncs(vp, canvas)

;(fetchTile(128, 0, 0) as any).then?.(startRender)

const showBorders =
  new URLSearchParams(location.search).get('border') === 'show'

function render() {
  rId = undefined
  ctx.fillStyle = 'rgb(118,124,173)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#ff0'
  ctx.strokeStyle = '#f00'

  const group = idealGroup()

  const maps = fetchVpGroup(group)

  const tiles: (MapTile & { data: HTMLImageElement })[] = []

  for (const tile of maps) {
    if (tile.data instanceof HTMLImageElement) tiles.push(tile as any)
    else {
      const fallback = findFallback(tile)
      if (fallback) tiles.push(fallback as any)
      tile.data.then(startRender)
    }
  }

  const renderTiles = tiles
    .map(tile => ({ ...tile, key: `${tile.x}-${tile.y}-${tile.size}` }))
    .filter(({ key }, i, arr) => arr.findIndex(v => v.key === key) === i)
    .sort((a, b) => b.size - a.size)

  for (const tile of renderTiles)
    renderTile(tile.x, tile.y, tile.size, tile.data)

  ctx.textBaseline = 'middle'
  ctx.font = `${12 * devicePixelRatio}px monospace`
  if (store.Overlays.Regions) renderRegions()
  ctx.fillStyle = '#ff0'
  // renderLocations()
  renderLabels()

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
  const cx = Math.floor(((tile2Coord(x * size) - vp.x) / vp.w) * canvas.width)
  const cy = Math.floor(((tile2Coord(y * size) - vp.y) / vp.h) * canvas.height)
  const cw = Math.ceil((tile2Coord(size) / vp.w) * canvas.width)
  const ch = Math.ceil((tile2Coord(size) / vp.h) * canvas.height)

  ctx.drawImage(tile, cx, cy, cw, ch)

  if (!showBorders) return
  ctx.setLineDash([20, 20])
  ctx.beginPath()
  ctx.rect(cx, cy, cw + 1, ch + 1)
  ctx.stroke()
  ctx.fillText(`${x} ${y} (${size})`, cx + 15, cy + ch - 15)
}

class LabelBox {
  public readonly text: string
  public readonly width: number
  public readonly height: number
  public readonly x: number
  public readonly y: number

  constructor(id: string) {
    const location = locById[id]

    this.text = location.name

    this.x = location.coords[0]
    this.y = location.coords[1]

    const metrics = ctx.measureText(location.name)
    this.width = metrics.width
    this.height =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
  }
}

const labelCat: Record<string, LabelBox> = {}

function renderLabels() {
  const requested: string[] = []
  renderLocations(g => requested.push(...g.map(({ id }) => id)))

  for (const id of requested) {
    const label = labelCat[id] ?? (labelCat[id] = new LabelBox(id))
    renderLabel(label)
  }

  ctx.font = `${10 * devicePixelRatio}px monospace`
}

function renderLabel(label: LabelBox) {
  const [cx, cy] = screenSpace(label.x, label.y)
  const ms = 6 * devicePixelRatio
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#000'
  ctx.lineWidth = devicePixelRatio

  ctx.beginPath()
  ctx.arc(cx, cy, ms / 2, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  ctx.closePath()

  ctx.fillText(label.text, cx - label.width / 2, cy - label.height - ms)
}

const renderLocations = (
  cb: (group: Group) => void,
  node: any = store.Locations,
  path: string[] = ['Locations'],
  rendered = new Set<string>()
) => {
  if (!node) return
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === 'boolean') {
      if (v) {
        const group = pick(locFilters, ...path, k)
        if (vp.vMin > group.zoom) return
        cb(
          Object.assign(
            group.filter(
              ({ id }) => !rendered.has(id) && (rendered.add(id), true)
            ),
            { zoom: group.zoom }
          )
        )
      }
    } else renderLocations(cb, v, [...path, k], rendered)
  }
}

type Group = { id: string; name: string; coords: [x: number, y: number] }[] & {
  zoom: number
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
  for (const { coords, color, surrounds } of regData.regions) {
    ctx.fillStyle = color + '77'
    ctx.beginPath()
    drawPath(coords)
    for (let name of surrounds ?? []) {
      drawPath(regData.regions.find(v => v.name === name)?.coords ?? [])
    }
    ctx.fill()
    ctx.closePath()
  }
}

let hasChanged = false
let rId: number | undefined = undefined

export function startRender() {
  if (rId) hasChanged = true
  else rId = requestAnimationFrame(render)
}

startRender()
