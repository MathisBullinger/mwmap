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
      tags.includes('autoloc') && !cityExclude.some(v => v.test(name))
  )
  .map(({ id }) => id)

const groups = {
  capitals: ["Ald'ruhn", 'Balmora', 'Ebonheart', 'Sadrith Mora', 'Vivec'],
  towns: [
    'Caldera',
    'Gnisis',
    'Maar Gan',
    'Molag Mar',
    'Pelagiad',
    'Suran',
    'Tel Mora',
  ],
  villages: [
    'Ald Velothi',
    'Dagon Fel',
    'Gnaar Mok',
    'Hla Oad',
    'Khuul',
    'Tel Aruhn',
    'Tel Branora',
    'Seyda Neen',
    'Vos',
  ],
  towers: ['Tel Fyr', 'Tel Naga', 'Tel Vos'],
  forts: [
    'Buckmoth Legion Fort',
    'Fort Darius',
    'Fort Pelagiad',
    'Hawkmoth Legion Garrison',
    'Moonmoth Legion Fort',
    'Wolverine Hall',
  ],
  ashlander: [
    'Ahemmusa Camp',
    'Erabenimsun Camp',
    'Urshilaku Camp',
    'Zainab Camp',
  ],
  strongholds: ['Indarys Manor', 'Rethan Manor', 'Tel Uvirith'],
}

const out = {
  locations,
  groups: {
    cities,
    ...Object.fromEntries(
      Object.entries(groups).map(([name, group]) => [
        name,
        group.map(v => locations.find(({ name }) => name === v).id),
      ])
    ),
  },
}

fs.writeFileSync(dir + 'locations.json', JSON.stringify(out))
