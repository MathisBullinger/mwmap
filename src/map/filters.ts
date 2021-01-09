import l from 'data/locations/locations.json'
const g = l.groups

for (const loc of l.locations) loc.coords = loc.coords.map(n => n / 10000)

const filters = {
  Locations: {
    Settlements: {
      Cities: g.cities,
      Towns: g.towns,
      'Wizard Towers': g.towers,
      'Imperial Forts': g.forts,
      'Ashlander Camps': {
        'Major Tribal Camps': g.bigCamps,
        'Minor Camps': g.smallCamps,
      },
      'House Strongholds': g.strongholds,
    },
    Landmarks: g.landmarks,
    'Ancestral Tombs': g.tombs,
    Caves: g.caves,
    'Daedric Shrines': {
      Malacath: g.malacath,
      'Mehrunes Dagon': g.md,
      'Molag Bal': g.mb,
      Sheogorath: g.sheogorath,
      'Other Shrines': g.otherShrines,
    },
    'Dunmer Strongholds': g.dunmer,
    'Dwemer Ruins': g.dwemer,
    Grottos: g.grottos,
    Homes: {
      Manors: g.manors,
      Plantations: g.plantations,
      Farmhouses: g.farms,
      Other: g.otherHomes,
    },
    Mines: {
      'Ebony Mines': g.ebony,
      'Glass Mines': g.glass,
      'Diamond Mine': g.diamond,
      'Egg Mines': g.egg,
    },
    Ships: {
      'Full Ships': g.ships,
      'Open Boats': g.boats,
      Shipwrecks: g.wrecks,
    },
    'Velothi Towers': g.velothi,
  },
  Overlays: {
    Regions: [],
    'Almsivi Intervention': [],
    'Divine Intervention': [],
  },
} as const

const assignGroups = (node: any = filters.Locations) => {
  for (const [k, v] of Object.entries(node))
    if (Array.isArray(v))
      node[k] = Object.assign(
        v.map(id => l.locations.find(v => v.id === id)),
        { zoom: 20 }
      )
    else assignGroups(node[k])
}
assignGroups()
;(filters.Locations.Settlements.Cities as any).zoom = 100
;(filters.Locations.Settlements.Towns as any).zoom = 80
;(filters.Locations['Ancestral Tombs'] as any).zoom = 12

export default filters
export type Filter = { [K: string]: Filter | readonly any[] }
