import { canvas, vp, startRender } from './render'

canvas.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault()
    const dZ = 1 + e.deltaY / 200
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
})

canvas.addEventListener('mousedown', () => {
  canvas.addEventListener('mousemove', drag)
  canvas.addEventListener(
    'mouseup',
    () => {
      canvas.removeEventListener('mousemove', drag)
    },
    { once: true }
  )
})

function drag(e: MouseEvent) {
  const dx = e.movementX / window.innerWidth
  const dy = e.movementY / window.innerHeight
  vp.x -= dx * vp.w
  vp.y -= dy * vp.h
  startRender()
}
