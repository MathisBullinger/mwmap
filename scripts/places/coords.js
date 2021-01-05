const { outDir } = require('./shared')
const fetch = require('node-fetch')
const fs = require('fs')

const data = require(outDir + 'scrape.json')

const getCoords = async name => {
  console.log(name)
  const { locations } = await fetch(
    `https://mwmap.uesp.net/gamemap.php?action=get_centeron&centeron=${name}&db=mw`
  ).then(res => res.json())
  if (!locations || !locations.length) return
  return [locations[0].x, locations[0].y]
}

const walk = async (obj = data) => {
  let out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (!Array.isArray(v)) {
      out[k] = await walk(v)
      continue
    }
    out[k] = []
    for (const loc of v) {
      out[k].push({ ...loc, coords: await getCoords(loc.map) })
    }
  }
  return out
}

;(async () => {
  const out = await walk()
  fs.writeFileSync(outDir + 'scrape_coords.json', JSON.stringify(out))
})()
