import Viewport from './vp'
import locs from 'data/locations/locations.json'
import regData from 'data/locations/regions.js'
import tileFuncs, { fetchTile, findFallback, MapTile } from './tiles'
import utils, { locCoord } from './utils'
import getCanvas from './canvas'
import store from '../store'
import { deepObserve } from 'mobx-utils'

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

  ctx.font = `${10 * devicePixelRatio}px monospace`
  const renderTiles = tiles
    .map(tile => ({ ...tile, key: `${tile.x}-${tile.y}-${tile.size}` }))
    .filter(({ key }, i, arr) => arr.findIndex(v => v.key === key) === i)
    .sort((a, b) => b.size - a.size)

  for (const tile of renderTiles)
    renderTile(tile.x, tile.y, tile.size, tile.data)

  ctx.textBaseline = 'middle'
  ctx.font = `${12 * devicePixelRatio}px monospace`
  if (store.Overlays.Regions) renderRegions()
  renderLocations()

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

const groups = Object.fromEntries(
  Object.entries(locs.groups).map(([k, v]) => [
    k,
    v.map(n => locs.locations.find(({ id }) => id === n)!),
  ])
)

function renderLocations() {
  ctx.fillStyle = '#ff0'

  if (store.Locations.Settlements.Cities) renderGroupMarkers(groups.cities)
  if (store.Locations.Settlements.Towns) renderGroupMarkers(groups.towns)
  if (store.Locations.Settlements['Wizard Towers'])
    renderGroupMarkers(groups.towers)
  if (store.Locations.Settlements['Imperial Forts'])
    renderGroupMarkers(groups.forts)
  if (store.Locations.Settlements['Ashlander Camps']['Major Tribal Camps'])
    renderGroupMarkers(groups.bigCamps)
  if (store.Locations.Settlements['Ashlander Camps']['Minor Camps'])
    renderGroupMarkers(groups.smallCamps)
  if (store.Locations.Settlements['House Strongholds'])
    renderGroupMarkers(groups.strongholds)
}

function renderGroupMarkers(group: any[]) {
  for (const {
    name,
    coords: [x, y],
  } of group) {
    const [cx, cy] = screenSpace(...locCoord(x, y))
    const ms = 6 * devicePixelRatio
    ctx.fillRect(cx - ms / 2, cy - ms / 2, ms, ms)
    ctx.fillText(name, cx + ms, cy)
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
