export default {
  Locations: {
    Settlements: {
      Cities: 0,
      Towns: 0,
      'Wizard Towers': 0,
      'Imperial Forts': 0,
      'Ashlander Camps': {
        'Major Tribal Camps': 0,
        'Minor Camps': 0,
      },
      'House Strongholds': 0,
    },
  },
  Overlays: {
    Regions: 0,
    'Almsivi Intervention': 0,
    'Divine Intervention': 0,
  },
} as const

export type Filter = { [K: string]: Filter | 0 }
