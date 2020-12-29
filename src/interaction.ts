import { canvas, vp, startRender } from './render'

canvas.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault()
    const dZ = 1 + e.deltaY / 200
    vp.w *= dZ
    vp.h *= dZ
    vp.x += (vp.w / dZ - vp.w) / 2
    vp.y += (vp.h / dZ - vp.h) / 2
    startRender()
  } else {
    vp.x += e.deltaX / (1 / vp.vMin) / 1500
    vp.y += e.deltaY / (1 / vp.vMin) / 1500
    startRender()
  }
})
