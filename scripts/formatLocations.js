const fs = require('fs')
const path = require('path')

const outDir = path.join(__dirname, '../data/locations/')

const raw = require(outDir + 'raw.json')

const formatted = raw.map(v =>
  Object.fromEntries(
    Object.entries(v).map(([k, v]) => {
      v = decodeURIComponent(decodeURIComponent(v)) // yes, twice
      const i = parseInt(v)
      if (!isNaN(i)) v = i
      return [k, v]
    })
  )
)

formatted.forEach(v => {
  if (v.region) return
  v.region = v.tags
})

fs.writeFileSync(outDir + 'formatted.json', JSON.stringify(formatted))
