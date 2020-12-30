const marker = {
  ag1: [65.92, 32.75],
  ag2: [66.73, 49.73],
  g1: [66.52, 32.08],
  g2: [67.52, 49.77],
}

const coords = [
  // red mountain
  [55.18, 50.59],
  [59.14, 50.59],
  [59.64, 50.31],
  [60.04, 49.87],
  [60.32, 49.1],
  [60.56, 48.54],
  [60.78, 47.99],
  [60.95, 47.45],
  [61.3, 46.99],
  [61.59, 46.47],
  [61.76, 45.92],
  [61.99, 45.39],
  [62.19, 44.82],
  [62.5, 44.3],
  [62.57, 43.74],
  [62.59, 43.13],
  [62.63, 42.36],
  [62.66, 41.77],
  [62.52, 41.18],
  [62.28, 40.65],
  [61.96, 40.13],
  [61.49, 39.78],
  [60.95, 39.58],
  [60.37, 39.44],
  [59.82, 39.45],
  [59.39, 39.36],
  [58.47, 39.34],
  [57.69, 39.34],
  [57.37, 39.37],
  [57.1, 39.41],
  [56.53, 39.54],
  [55.96, 39.54],
  [55.38, 39.4],
  [54.83, 39.24],
  [54.28, 39.04],
  [53.17, 39.37],
  [52.59, 39.38],
  [52.01, 39.51],
  [51.58, 39.9],
  [51.16, 40.36],
  [50.62, 40.62],
  [50.11, 40.93],
  [50, 41.69],
  [49.95, 42.3],
  [50.08, 43.06],
  [50.81, 43.34],
  [51.55, 43.67],
  [52.03, 44],
  [52.46, 44.38],
  [52.92, 44.76],
  [53.49, 44.88],
  [54, 45.12],
  [54.45, 45.49],
  [54.84, 45.94],
  [54.95, 46.53],
  [55.11, 47.07],
  [55.13, 47.84],
  [55.03, 48.38],
  [54.88, 48.92],
  [54.75, 49.49],
  [54.83, 50.11],
  // ashlands
  [45.78, 28.77],
  [48.05, 28.15],
  [49.58, 28.73],
  [51.61, 27.14],
  [55.29, 28.87],
  [57.3, 31.29],
  [59.01, 30.65],
  [61.28, 31.13],
  [61.61, 32.77],
  marker.ag1,
  marker.ag2,
  [53.23, 59.9],
  [53.23, 58.58],
  [52.5, 58.36],
  [53.19, 57.22],
  [53.51, 55.06],
  [53.41, 52.67],
  [49.78, 50.16],
  [48.41, 49.9],
  [47.08, 48.45],
  [47.26, 47.05],
  [45.95, 45.43],
  [45.98, 43.09],
  [45.27, 41.54],
  [45.4, 40.62],
  [46.54, 38.86],
  [46.12, 36.14],
  [45.13, 35.05],
  [44.12, 34.63],
  [43.36, 29],
  // grazelands
  marker.g1,
  [67.08, 31.49],
  [67.19, 31.74],
  [67.73, 31.49],
  [68.06, 31.71],
  [68.14, 32.44],
  [68.17, 32.82],
  [68.78, 32.92],
  [69.29, 32.79],
  [69.29, 32.03],
  [69.86, 31.63],
  [71.59, 31.46],
  [73.07, 31.58],
  [73.13, 31.92],
  [72.86, 32.76],
  [72.6, 32.9],
  [72.65, 33.4],
  [72.42, 34.07],
  [72.39, 34.61],
  [72.34, 35.22],
  [72.49, 35.59],
  [72.69, 35.84],
  [72.59, 36.32],
  [72.67, 36.63],
  [73.25, 36.78],
  [73.48, 36.65],
  [74.01, 36.91],
  [73.99, 37.19],
  [74.16, 37.21],
  [74.29, 37.58],
  [74.16, 37.9],
  [74.55, 38.62],
  [74.49, 38.76],
  [74.16, 38.99],
  [74.24, 39.21],
  [74.58, 39.51],
  [74.48, 39.65],
  [74.54, 39.85],
  [74.84, 40.11],
  [74.77, 40.29],
  [75.07, 40.75],
  [75.03, 41],
  [75.16, 41.12],
  [75.17, 41.4],
  [75.06, 41.6],
  [75.42, 42.05],
  [75.72, 41.92],
  [75.95, 42.06],
  [76.35, 42.07],
  [76.83, 41.92],
  [77.36, 42.53],
  [77.91, 42.7],
  [78.12, 43.06],
  [78.08, 43.52],
  [77.85, 43.69],
  [77.73, 43.99],
  [77.45, 44.09],
  [77.47, 44.37],
  [77.64, 44.35],
  [77.68, 44.75],
  [77.37, 45.01],
  [77.05, 45.62],
  [76.12, 45.02],
  [75.53, 45.68],
  [75.14, 45.82],
  [75.05, 46.25],
  [74.71, 46.41],
  [74.32, 46.34],
  [74.01, 46.55],
  [74.07, 46.72],
  [73.72, 47.18],
  [73.23, 47.13],
  [73.16, 47.54],
  [73.51, 48.2],
  [73.43, 48.35],
  [72.71, 48.41],
  [72.44, 47.84],
  [71.87, 47.87],
  [71.73, 47.75],
  [71.18, 48.2],
  [70.85, 48.23],
  [70.73, 48.53],
  [70.43, 48.67],
  [70.41, 49.32],
  [70.18, 49.67],
  [69.59, 49.85],
  [69.37, 49.63],
  [68.33, 49.7],
  marker.g2,
]

const range = (from, to) => {
  if (Array.isArray(from)) from = coords.indexOf(from)
  if (Array.isArray(to)) to = coords.indexOf(to)
  return new Array(to - from + 1).fill(from).map((v, i) => v + i)
}

export default {
  regions: [
    {
      name: 'Red Mountain',
      color: '#f00',
      coords: range(0, 60),
    },
    {
      name: 'Ashlands',
      surrounds: ['Red Mountain'],
      color: '#f80',
      coords: range(61, 61 + 29),
    },
    {
      name: 'Grazelands',
      color: '#0f0',
      coords: [
        coords.indexOf(marker.ag2),
        coords.indexOf(marker.ag1),
        ...range(marker.g1, marker.g2),
      ],
    },
  ],
  coords,
}
