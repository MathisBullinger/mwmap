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

const transform = (x, y) => [
  Math.round(((x + 278528) / 520192) * 10000),
  Math.round(((y - 303104) / -520192) * 10000),
]
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
        coords: transform(...v.coords),
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

out.locations.find(({ name }) => name === 'Ramoran Manor').coords = [5104, 4696]
out.locations.find(({ name }) => name === 'Venim Manor').coords = [5133, 4697]
out.locations.find(({ name }) => name === 'Arobar Manor').coords = [5138, 4658]
out.locations.find(({ name }) => name === 'Llethri Manor').coords = [5104, 4657]
out.locations.find(({ name }) => name === 'Sarethi Manor').coords = [5093, 4677]

const getId = ({ wiki }) => out.locations.find(v => v.wiki === wiki).id
const byName = (...names) =>
  names.map(v => {
    const loc = out.locations.find(({ name }) => name === v)
    if (!loc) return console.warn(`couldn't find '${v}'`)
    return loc.id
  })

const settle = locations.Settlements
const other = locations['Other Landmarks']

console.log('\n')
out.groups = {
  cities: settle.Cities.map(getId),
  towns: settle.Towns.map(getId),
  towers: byName(
    'Tel Aruhn',
    'Tel Branora',
    'Tel Fyr',
    'Tel Mora',
    'Tel Naga',
    'Tel Uvirith',
    'Tel Vos'
  ),
  forts: settle['Imperial Forts'].map(getId),
  bigCamps: settle['Ashlander Camps']['Major Tribal Camps'].map(getId),
  smallCamps: settle['Ashlander Camps']['Minor Camps'].map(getId),
  strongholds: settle['House Strongholds'].map(getId),
  tombs: other['Ancestral Tombs'].map(getId),
  caves: other.Caves.map(getId),
  malacath: other['Daedric Shrines']['Shrines to Malacath'].map(getId),
  md: other['Daedric Shrines']['Shrines to Mehrunes Dagon'].map(getId),
  mb: other['Daedric Shrines']['Shrines to Molag Bal'].map(getId),
  sheogorath: other['Daedric Shrines']['Shrines to Sheogorath'].map(getId),
  otherShrines: other['Daedric Shrines']['Other Shrines'].map(getId),
  dunmer: other['Dunmer Strongholds'].map(getId),
  dwemer: other['Dwemer Ruins'].map(getId),
  grottos: other.Grottos.map(getId),
  manors: [...other.Homes.Manors, ...other.Homes['Manor District Homes']].map(
    getId
  ),
  plantations: other.Homes.Plantations.map(getId),
  farms: other.Homes.Farmhouses.map(getId),
  otherHomes: other.Homes.Other.map(getId),
  ebony: other.Mines['Ebony Mines'].map(getId),
  glass: other.Mines['Glass Mines'].map(getId),
  diamond: other.Mines['Diamond Mine'].map(getId),
  egg: other.Mines['Egg Mines'].map(getId),
  ships: other.Ships['Full Ships'].map(getId),
  boats: other.Ships['Open Boats'].map(getId),
  wrecks: other.Ships['Shipwrecks'].map(getId),
  velothi: other['Velothi Towers'].map(getId),
}

// remove ureferenced
const references = Object.values(out.groups).flat()
out.locations = out.locations.filter(({ id }) => references.includes(id))

fs.writeFileSync(outDir + '../locations.json', JSON.stringify(out))
