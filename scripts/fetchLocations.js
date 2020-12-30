const fetch = require('node-fetch')
const xml2js = require('xml2js')
const fs = require('fs')
const path = require('path')

;(async () => {
  let allLocs = []

  let totalRows = Infinity
  let lastKnown = -1

  while (lastKnown < totalRows - 1) {
    console.log(`fetch ${lastKnown + 1} of ${totalRows}`)

    const res = await fetch(
      `https://en.uesp.net/maps/getmaplocs.php?game=mw&BottomLeftX=-278379&BottomLeftY=-187921&TopRightX=245965&TopRightY=302806&StartRow=${
        lastKnown + 1
      }`
    )
    const { locations } = await xml2js.parseStringPromise(await res.text())

    if (totalRows === Infinity)
      totalRows = parseInt(locations.rowcount[0].$.totalrows)

    const newLocs = locations.location.map(({ $ }) => $)
    lastKnown += newLocs.length
    console.log(`got ${newLocs.length}`)

    allLocs.push(...newLocs)
  }

  const outDir = path.join(__dirname, '../data/locations')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'raw.json'), JSON.stringify(allLocs))
})()
