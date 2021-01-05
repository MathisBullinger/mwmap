const { outDir } = require('./shared')
const fs = require('fs')
const crypto = require('crypto')

let locations = require(outDir + 'scrape_coords.json').places

const walk = (cb, obj = locations, lvl = 0) =>
  Object.fromEntries(
    Object.entries(obj)
      .map(([k, v]) => {
        if (cb.group) if (cb.group(k, v, lvl) === null) return
        const nv =
          !cb.location || !Array.isArray(v)
            ? v
            : v.map(cb.location).filter(Boolean)
        if (!nv) return
        return Array.isArray(v) ? [k, nv] : [k, walk(cb, v, lvl + 1)]
      })
      .filter(Boolean)
  )

const find = (name, obj = locations) => {
  for (const v of Object.values(obj)) {
    const loc = Array.isArray(v) ? v.find(l => l.name === name) : find(name, v)
    if (loc) return loc
  }
}
const setCoords = (name, coords) => {
  const loc = find(name)
  if (!loc) throw Error(`couldn't find '${name}'`)
  loc.coords = coords
}

setCoords('Tel Uvirith', [88064, 9500])

// remove no coords
locations = walk({ location: v => v.coords && v })
locations = walk({
  group: (_, v) => Array.isArray(v) && v.length === 0 && null,
})

// print groups
walk({
  group(name, v, lvl) {
    const isList = Array.isArray(v)
    const out = `${' '.repeat(lvl * 2)}- ${name}`
    console.log(out + (isList ? ' '.repeat(35 - out.length) + v.length : ''))
  },
})

const out = { locations: [] }

console.log('\n')
walk({
  location(v) {
    if (out.locations.find(({ wiki }) => wiki === v.wiki))
      console.log('duplicate', v.name)
    else {
      out.locations.push({
        id: crypto.createHash('sha1').update(v.wiki).digest('hex').slice(0, 6),
        ...v,
        description: v.description.replace(/\s*\(map\)/g, ''),
      })
      delete out.locations.slice(-1)[0].map
    }
    return v
  },
})

for (const loc of out.locations)
  if (
    out.locations.findIndex(({ id }) => id === loc.id) !==
    out.locations.indexOf(loc)
  )
    throw Error('duplicate id')

const getId = ({ wiki }) => out.locations.find(v => v.wiki === wiki).id
const byName = (...names) =>
  names.map(v => {
    const loc = out.locations.find(({ name }) => name === v)
    if (!loc) return console.warn(`couldn't find '${v}'`)
    return loc.id
  })

console.log('\n')
out.groups = {
  cities: locations.Settlements.Cities.map(getId),
  towns: locations.Settlements.Towns.map(getId),
  towers: byName(
    'Tel Aruhn',
    'Tel Branora',
    'Tel Fyr',
    'Tel Mora',
    'Tel Naga',
    'Tel Uvirith',
    'Tel Vos'
  ),
  forts: locations.Settlements['Imperial Forts'].map(getId),
  bigCamps: locations.Settlements['Ashlander Camps']['Major Tribal Camps'].map(
    getId
  ),
  smallCamps: locations.Settlements['Ashlander Camps']['Minor Camps'].map(
    getId
  ),
  strongholds: locations.Settlements['House Strongholds'].map(getId),
}

// remove ureferenced
const references = Object.values(out.groups).flat()
out.locations = out.locations.filter(({ id }) => references.includes(id))

fs.writeFileSync(outDir + '../locations.json', JSON.stringify(out))
