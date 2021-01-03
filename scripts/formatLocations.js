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

const replace = {
  'Tel Naga Great Hall': 'Tel Naga',
  'Tower Upper': 'Tel Uvirith',
}

formatted.forEach(v => {
  v.name = replace[v.name] || v.name
  if (v.region) return
  v.tags = v.tags.split(',').map(w => w.trim())
})

fs.writeFileSync(outDir + 'formatted.json', JSON.stringify(formatted))
