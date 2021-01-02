import { openDB, DBSchema } from 'idb'

declare const self: ServiceWorkerGlobalScope
export default null

const VERSION = 1
const CACHE_PREFIX = `${self.location.hostname}.v${VERSION}.`
const STATIC_CACHE = CACHE_PREFIX + 'static'
const PHOTO_CACHE = CACHE_PREFIX + 'photo'
const expectedCaches = [STATIC_CACHE, PHOTO_CACHE]

const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname)

interface MWDB extends DBSchema {
  meta: {
    key: 'updateStatus'
    value: 'UP_TO_DATE' | 'EVICT_PENDING'
  }
}

const dbProm = openDB<MWDB>(self.location.hostname, 1, {
  upgrade(db) {
    db.createObjectStore('meta').put('UP_TO_DATE', 'updateStatus')
  },
})

self.addEventListener('install', event => {
  event.waitUntil(cacheStatic())
})

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches
        .keys()
        .then(keys =>
          Promise.all(
            keys.map(key => !expectedCaches.includes(key) && caches.delete(key))
          )
        ),
    ])
  )
})

self.addEventListener('fetch', event => {
  const handleDefault = async () => {
    const cache = await caches.open(STATIC_CACHE)
    const isNav = event.request.mode === 'navigate'
    if (isNav) event.waitUntil(checkForUpdate())
    return (
      (await cache.match(isNav ? '/index.html' : event.request)) ??
      fetch(event.request)
    )
  }

  const handlePhoto = async () => {
    const cache = await caches.open(PHOTO_CACHE)
    const match = await cache.match(event.request)
    return (
      match ??
      fetch(event.request, !isLocal ? { mode: 'cors' } : undefined).then(res =>
        cache.put(event.request, res.clone()).then(() => res)
      )
    )
  }

  event.respondWith(
    event.request.url.startsWith(process.env.IMG_HOST!)
      ? handlePhoto()
      : handleDefault()
  )
})

async function cacheStatic() {
  const [cache, staticFiles] = await Promise.all([
    caches.open(STATIC_CACHE),
    getStatic(),
  ])
  await cache.addAll(staticFiles)
}

async function getStatic(): Promise<string[]> {
  const manifest: Record<string, string> = await fetch(
    '/assets-manifest.json'
  ).then(v => v.json())
  const files = Object.values(manifest).filter(v => !/.txt$/.test(v))
  files.push('index.html')
  return files.filter(v => v !== 'sw.js')
}

async function checkForUpdate() {
  const db = await dbProm
  const updateStatus = await db.get('meta', 'updateStatus')

  if (updateStatus === 'UP_TO_DATE') {
    const cache = await caches.open(STATIC_CACHE)
    const cached = await cache.match('/index.html')
    if (!cached) return
    const latest = await fetch('/index.html').then(res => res.text())
    if ((await cached.text()) !== latest) {
      await cacheStatic()
      await db.put('meta', 'EVICT_PENDING', 'updateStatus')
      const clients = await self.clients.matchAll()
      clients.forEach(client =>
        client.postMessage?.({ type: 'UPDATE_AVAILABLE' })
      )
    }
  } else if (updateStatus === 'EVICT_PENDING') {
    const staticFiles = await getStatic()
    const cache = await caches.open(STATIC_CACHE)
    const keys = await cache.keys()
    const toEvict = keys.filter(
      ({ url }) => !staticFiles.includes(url.replace(self.location.origin, ''))
    )
    await Promise.all(toEvict.map(v => cache.delete(v)))
    await db.put('meta', 'UP_TO_DATE', 'updateStatus')
  }
}
