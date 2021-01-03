export default {
  Places: ['Cities'],
  Overlays: ['Regions', 'Almsivi Intervention', 'Divine Intervention'],
} as const

export type Filter = { [K: string]: Filter | readonly string[] }
