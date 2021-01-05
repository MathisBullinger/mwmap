const fs = require('fs')
const { fetchDocument, outDir } = require('./shared')

const parseLine = node => {
  try {
    const link = node.firstChild.firstChild
    const wikiLink = node.querySelector(':scope > b > a[href*="/wiki/"]')
    const mapLink = node.querySelector('a[href*="mwmap.uesp.net"]')
    if (!mapLink || !wikiLink) return
    return {
      name: link.textContent,
      wiki: wikiLink.href.replace(/^\/wiki\//, ''),
      map: mapLink.href.split('=').pop(),
      description: node.textContent
        .split('—')
        .pop()
        .replace(/\(map\)$/, '')
        .trim(),
    }
  } catch (e) {
    console.warn(e)
  }
}

const titleText = node => {
  try {
    return node.querySelector('.mw-headline').textContent
  } catch (e) {
    return node.textContent
  }
}
const titleSize = node => parseInt(node.nodeName.slice(-1))

const findTitle = node => {
  let match = /h\d/i
  if (match.test(node.nodeName))
    match = new RegExp(`h${titleSize(node) - 1}`, 'i')
  let previous = node
  do {
    previous = previous.previousElementSibling || previous.parentElement
    if (previous) if (match.test(previous.nodeName)) return previous
  } while (previous)
}

const getListLink = node => {
  const link = node.querySelector('a')
  if (!link || node.childNodes.length !== 1) return false
  return [link.href.split('/').pop(), link.textContent]
}

const visited = new Set()

async function parseListDoc(url, title) {
  const doc = await fetchDocument(url)
  visited.add(url)

  const isLocPage = () => {
    const tray = doc.querySelector('.subpages')
    if (!tray) return false
    return Array.from(tray.querySelectorAll('a'))
      .map(v => v.textContent.trim().toLowerCase())
      .includes('places')
  }

  if (!url.includes('Morrowind:Places') && !isLocPage())
    return console.log('not location page')

  doc.querySelectorAll('.toc').forEach(v => v.remove())
  const lists = Array.from(
    doc.querySelector('.mw-content-ltr').querySelectorAll(['dl', 'ul'])
  ).map(node => ({
    node,
  }))

  let rootLvl = 6

  for (const list of lists) {
    let path = []
    let node = list.node
    do {
      node = findTitle(node)
      if (node) path.push(node)
    } while (node)
    path.reverse()
    if (!path.length) {
      console.log('no path found for', list)
      continue
    }
    if (titleSize(path[0]) < rootLvl) rootLvl = titleSize(path[0])
    list.titlePath = path
  }

  for (const list of lists) {
    if (!list.titlePath || titleSize(list.titlePath[0]) !== rootLvl) {
      console.warn('title path mismatch')
      lists.splice(lists.indexOf(list), 1)
    }
  }

  const tree = {}

  // join paths
  for (const { titlePath, node } of lists) {
    let cur = tree
    for (const title of titlePath) {
      const name = titleText(title)
      const isTerm = titlePath.indexOf(title) === titlePath.length - 1
      cur = cur[name] || (cur[name] = isTerm ? [] : {})
      if (isTerm) {
        const list = []
        let sub = {}
        for (const line of node.children) {
          const listLink = getListLink(line)
          if (listLink) {
            const [link, name] = listLink
            if (!/^Morrowind:/.test(link)) continue
            if (visited.has(link)) {
              console.log('skip', link)
              continue
            }
            console.log(`\n== follow ${link} (${name}) ==`)
            sub = { ...sub, ...(await parseListDoc(link, name)) }
          } else {
            const loc = parseLine(line)
            if (loc) list.push(loc)
          }
        }
        if (Object.keys(sub).length) {
          let node = tree
          for (const p of titlePath.slice(0, -1)) node = node[titleText(p)]
          node[titleText(titlePath.slice(-1)[0])] = sub
        } else {
          if (Array.isArray(list)) cur.push(...list)
          else cur = list
        }
      }
    }
  }

  if (Object.keys(tree).length !== 1) {
    console.warn(tree)
    throw Error('expected list to have one root')
  }

  return { [title]: Object.values(tree)[0] }
}

const removeEmpty = obj =>
  Object.fromEntries(
    Object.entries(obj).flatMap(([k, v]) =>
      !Array.isArray(v) ? [[k, removeEmpty(v)]] : v.length === 0 ? [] : [[k, v]]
    )
  )

;(async () => {
  const data = await parseListDoc('Morrowind:Places', 'places')
  fs.writeFileSync(outDir + 'scrape.json', JSON.stringify(removeEmpty(data)))
})()
