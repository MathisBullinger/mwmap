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
  canvas.style.cursor = 'grabbing'
  canvas.addEventListener('mousemove', drag)

  const remove = () => {
    canvas.removeEventListener('mousemove', drag)
    canvas.removeEventListener('mouseenter', onEnter)
    canvas.style.cursor = 'grab'
  }

  const onEnter = (e: MouseEvent) => {
    if (e.buttons === 0) remove()
  }

  canvas.addEventListener('mouseenter', onEnter)
  canvas.addEventListener('mouseup', remove, { once: true })
})

function drag(e: MouseEvent) {
  const dx = e.movementX / window.innerWidth
  const dy = e.movementY / window.innerHeight
  vp.x -= dx * vp.w
  vp.y -= dy * vp.h
  startRender()
}

let pts: [number, number][] = []
canvas.addEventListener('click', (e) => {
  const x = (e.clientX / window.innerWidth) * vp.w + vp.x
  const y = (e.clientY / window.innerHeight) * vp.h + vp.y
  console.log(x, y)
  pts.push([x, y].map((v) => Math.round(v * 100) / 100) as any)
  console.log(pts)
})
