const fetch = require('node-fetch')
const { JSDOM } = require('jsdom')
const path = require('path')
const fs = require('fs')

const fetchDocument = async url => {
  const data = await fetch(
    /^https?:\/\//.test(url) ? url : 'https://en.uesp.net/wiki/' + url
  ).then(res => res.text())

  const {
    window: { document },
  } = new JSDOM(data)

  return document
}

const outDir = path.join(__dirname, '../../data/locations/tmp/')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

module.exports = { outDir, fetchDocument }
