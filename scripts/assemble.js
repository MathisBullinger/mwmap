const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')
const path = require('path')

const imgSize = 2048

const tiles = new Array(128).fill().map((_, x) =>
  new Array(128).fill().map((_, y) => async () => {
    const img = await loadImage(
      path.join(
        __dirname,
        'data/raw',
        `${Math.min(x, 125)}-${Math.min(y, 125)}.jpeg`
      )
    )
    tiles[x][y] = async () => img
    return img
  })
)

async function drawLevel(lvl) {
  const canvas = createCanvas()
  canvas.width = imgSize
  canvas.height = imgSize
  const ctx = canvas.getContext('2d')

  const num = 2 ** (lvl - 1)
  const nt = tiles.length / num
  const ts = imgSize / nt
  if (ts > 256) return false
  const outDir = path.join(__dirname, `data/zoom/${nt}`)
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  console.log(`draw lvl ${lvl}`)

  for (let x = 0; x < num; x++) {
    for (let y = 0; y < num; y++) {
      console.log(`cell ${x} ${y} (${num})`)
      await renderCell(x, y)
    }
  }

  async function renderCell(ox, oy) {
    for (let x = 0; x < nt; x++) {
      for (let y = 0; y < nt; y++) {
        const img = await tiles[ox * nt + x][oy * nt + y]()
        ctx.drawImage(img, x * ts, y * ts, ts, ts)
      }
    }
    fs.writeFileSync(path.join(outDir, `${ox}-${oy}.png`), canvas.toBuffer())
  }

  return true
}

;(async () => {
  for (let i = 1; i < Infinity; i++) if (!(await drawLevel(i))) return
})()
