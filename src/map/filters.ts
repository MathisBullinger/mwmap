export default {
  Locations: {
    'Cities & Towns': [
      'Capitals',
      'Towns',
      'Villages',
      'Wizard Towers',
      'Imperial Forts',
      'Ashlander Camps',
      'House Strongholds',
    ],
  },
  Overlays: ['Regions', 'Almsivi Intervention', 'Divine Intervention'],
} as const

export type Filter = { [K: string]: Filter | readonly string[] }
