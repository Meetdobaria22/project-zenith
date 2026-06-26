import * as satellite from 'satellite.js'

const TLE_URL = 'https://api.allorigins.win/get?url=' +
  encodeURIComponent('https://celestrak.org/SOCRATES/query.php?CODE=ALL&ORDER=MAXAZEL&MAX=10&FORMAT=TLE')

// Simpler: use the active satellites JSON from CelesTrak GP data
const GP_URL = 'https://api.allorigins.win/get?url=' +
  encodeURIComponent('https://celestrak.org/SOCRATES/query.php')

// We'll use the visual brightest satellites TLE file
const BRIGHT_TLE_URL = 'https://api.allorigins.win/get?url=' +
  encodeURIComponent('https://celestrak.org/TLE/visual.txt')

let cachedTLEs = null
let lastFetch = 0

export async function getVisibleSatellites(lat, lng, date) {
  // Cache TLEs for 1 hour
  if (!cachedTLEs || Date.now() - lastFetch > 3600000) {
    try {
      const res = await fetch(BRIGHT_TLE_URL)
      const json = await res.json()
      cachedTLEs = parseTLE(json.contents)
      lastFetch = Date.now()
    } catch {
      return []
    }
  }

  const results = []
  const gmst = satellite.gstime(date)
  const observerGd = { longitude: satellite.degreesToRadians(lng), latitude: satellite.degreesToRadians(lat), height: 0 }

  for (const tle of cachedTLEs) {
    try {
      const satrec = satellite.twoline2satrec(tle.line1, tle.line2)
      const posVel = satellite.propagate(satrec, date)
      if (!posVel.position) continue

      const posEcf = satellite.eciToEcf(posVel.position, gmst)
      const lookAngles = satellite.ecfToLookAngles(observerGd, posEcf)
      const elevDeg = satellite.radiansToDegrees(lookAngles.elevation)
      const azDeg = satellite.radiansToDegrees(lookAngles.azimuth)

      if (elevDeg > 5) {
        results.push({
          name: tle.name,
          azimuth: (azDeg + 360) % 360,
          altitude: elevDeg,
          color: '#00ff88',
          size: 3,
          type: 'satellite',
          visible: true,
        })
      }
    } catch { /* skip bad TLEs */ }
  }

  return results.sort((a, b) => b.altitude - a.altitude).slice(0, 40)
}

function parseTLE(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean)
  const tles = []
  for (let i = 0; i + 2 < lines.length; i += 3) {
    if (lines[i + 1].startsWith('1 ') && lines[i + 2].startsWith('2 ')) {
      tles.push({ name: lines[i], line1: lines[i + 1], line2: lines[i + 2] })
    }
  }
  return tles
}
