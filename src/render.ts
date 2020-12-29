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

let map: HTMLImageElement

function render() {
  rId = undefined
  ctx.fillStyle = 'rgb(118,124,173)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const imgBox: Box = {
    x: 0,
    y: 0,
    w: 100,
    h: 100,
  }

  if (map) {
    ctx.drawImage(
      map,
      ((imgBox.x - vp.x) / vp.w) * canvas.width,
      ((imgBox.y - vp.y) / vp.h) * canvas.height,
      (imgBox.w / vp.w) * canvas.width,
      (imgBox.h / vp.h) * canvas.height
    )
  }

  if (!hasChanged) return
  hasChanged = false
  rId = requestAnimationFrame(render)
}

export function startRender() {
  if (rId) hasChanged = true
  else requestAnimationFrame(render)
}

const fetchMap = async () =>
  new Promise<void>((res) => {
    const img = new Image()
    img.onload = () => {
      map = img
      res()
    }
    img.src = '/data/128/0-0.png'
  })

fetchMap().then(startRender)

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
