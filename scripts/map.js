const fetch = require('node-fetch')
const fs = require('fs')

const tileDir = `${__dirname}/data/raw/`
if (!fs.existsSync(tileDir)) fs.mkdirSync(tileDir, { recursive: true })

async function fetchTile(x, y) {
  console.log('fetch', x, y)
  const res = await fetch(
    `https://maps.uesp.net/mwmap/zoom17/vvardenfell-${x}-${y}-17.jpg`
  )
  if (res.status === 404) return false

  fs.writeFileSync(tileDir + `${x}-${y}.jpeg`, await res.buffer())
  return true
}

async function fetchTiles() {
  for (let y = 0; y < Infinity; y++) {
    for (let x = 0; x <= 127; x++) {
      if (!(await fetchTile(x, y))) return console.log('done')
    }
  }
}

fetchTiles()
