import type Viewport from './vp'
import utils from './utils'

export type MapTile = {
  x: number
  y: number
  size: number
  data: Promise<HTMLImageElement> | HTMLImageElement
}

const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname)
export const tileSize = 2048

const tileUrl = (size: number, x: number, y: number) =>
  `${process.env.IMG_HOST}/${size}/${x}-${y}.webp`

let tileCache: Record<string, Promise<HTMLImageElement> | HTMLImageElement> = {}

export const fetchTile = (
  size: number,
  x: number,
  y: number
): Promise<HTMLImageElement> | HTMLImageElement => {
  const url = tileUrl(size, x, y)
  return (
    tileCache[url] ??
    (tileCache[url] = new Promise<HTMLImageElement>(res => {
      const img = new Image()
      if (!isLocal) img.crossOrigin = 'use-credentials'
      img.onload = () => {
        res(img)
        tileCache[url] = img
      }
      img.src = url
    }))
  )
}

export function findFallback(tile: MapTile): MapTile | undefined {
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

export default (vp: Viewport, canvas: HTMLCanvasElement) => {
  const { coord2Tile } = utils(vp, canvas)
  return {
    fetchVpGroup(group: number): MapTile[] {
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
            data: fetchTile(group, x, y),
          })
        }
      }

      return tiles
    },

    idealGroup(): number {
      const totalMapHeight =
        (Math.min(window.innerHeight, window.innerWidth) * devicePixelRatio) /
        (vp.h / 100)
      const scale = 1 / Math.min(totalMapHeight / (256 * 128), 1)
      const group = 8 * 2 ** (Math.log2(scale) | 0)
      return Math.min(group, 128)
    },
  }
}
