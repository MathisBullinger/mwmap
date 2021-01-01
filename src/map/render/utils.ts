import type Viewport from './vp'

export default (vp: Viewport, canvas: HTMLCanvasElement) => ({
  tile2Coord: (n: number) => n * (100 / 127),
  coord2Tile: (n: number) => n * (127 / 100),
  screenSpace: (x: number, y: number): [number, number] => {
    const cx = (x * (100 / vp.w) - vp.x / vp.w) * canvas.width
    const cy = (y * (100 / vp.h) - vp.y / vp.h) * canvas.height
    return [cx, cy]
  },
  world2Screen: (x: number, y: number): [number, number] => [
    ((x - vp.x) / vp.w) * canvas.width,
    ((y - vp.y) / vp.h) * canvas.height,
  ],
})

export const worldSpace = {
  left: -278528,
  right: 245760 - 8192 / 2,
  top: 303104,
  bottom: -221184 + 8192 / 2,
}

export const locCoord = (x: number, y: number): [number, number] => [
  (x - worldSpace.left) / (worldSpace.right - worldSpace.left),
  (y - worldSpace.top) / (worldSpace.bottom - worldSpace.top),
]
