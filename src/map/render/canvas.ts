import throttle from 'lodash/throttle'
import type Viewport from './vp'

export default (vp: Viewport, renderCB: () => void) => {
  const canvas = document.getElementById('map') as HTMLCanvasElement
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  function setSize() {
    canvas.width = window.innerWidth * devicePixelRatio
    canvas.height = window.innerHeight * devicePixelRatio
    vp.resize()
  }

  window.addEventListener(
    'resize',
    throttle(
      () => {
        setSize()
        renderCB()
      },
      100,
      { leading: false, trailing: true }
    )
  )
  setSize()

  return {
    canvas,
    ctx,
  }
}
