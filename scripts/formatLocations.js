const fs = require('fs')
const path = require('path')

const outDir = path.join(__dirname, '../data/locations/')

const raw = require(outDir + 'raw.json')

const formatted = raw.map((v) =>
  Object.fromEntries(
    Object.entries(v).map(([k, v]) => {
      v = decodeURIComponent(v)
      const i = parseInt(v)
      if (!isNaN(i)) v = i
      return [k, v]
    })
  )
)

fs.writeFileSync(outDir + 'formatted.json', JSON.stringify(formatted))
