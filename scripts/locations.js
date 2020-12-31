const fs = require('fs')
const path = require('path')
const dir = path.join(__dirname, '../data/locations/')
let locations = require(dir + 'formatted.json')

// remove duplicates
locations = locations.filter(
  ({ name }, i) => locations.findIndex(v => v.name === name) === i
)

const cityExclude = [/vivec,\s/i, /grave/i]

const cities = locations
  .filter(
    ({ tags, name }) =>
      tags === 'autoloc' && !cityExclude.some(v => v.test(name))
  )
  .map(({ id }) => id)

const out = { locations, groups: { cities } }

fs.writeFileSync(dir + 'locations.json', JSON.stringify(out))
