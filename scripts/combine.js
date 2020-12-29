const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')

combine()

async function combine() {
  const tileDir = `${__dirname}/data/raw/`
  const outDir = `${__dirname}/data/combined/`
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)

  const files = fs.readdirSync(tileDir)
  const sizes = files
    .map((v) => v.split('.')[0].split('-'))
    .filter((v) => v.length === 2)

  console.log(new Set(sizes.map((v) => v.length)))
  console.log(sizes.filter((v) => v.length !== 2))

  const buffer = 10
  const minX = buffer
  const minY = buffer
  const maxX = Math.max(...sizes.map(([x]) => parseInt(x))) - buffer
  const maxY = Math.max(...sizes.map(([, y]) => parseInt(y))) - buffer

  const canvas = createCanvas()
  const ctx = canvas.getContext('2d')

  const { width, height } = await loadImage(`${tileDir}0-0.jpeg`)

  canvas.width = width * (maxX + 1 - minX)
  canvas.height = height * (maxY + 1 - minY)

  function paintTile(x, y, img) {
    console.log('draw', x, y)
    ctx.drawImage(img, x * width, y * height, width, height)
  }

  console.log({ minX, minY, maxX, maxY })

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      paintTile(x, y, await loadImage(`${tileDir}${x}-${y}.jpeg`))
    }
  }

  fs.writeFileSync(outDir + 'combined.png', canvas.toBuffer())
}
