import { useRef, useEffect, useState, useCallback } from 'react'
import { getCelestialPositions, getStarPositions } from '../utils/astronomy.js'
import { getVisibleSatellites } from '../utils/satellites.js'

/**
 * Converts azimuth + altitude to canvas (x, y) inside a circle of radius R.
 * Zenith = centre. Horizon = edge.
 */
function toCanvas(az, alt, cx, cy, R) {
  const r = R * (1 - alt / 90)    // zenith=0, horizon=R
  const theta = (az - 90) * Math.PI / 180  // 0°=top
  return {
    x: cx + r * Math.cos(theta),
    y: cy + r * Math.sin(theta),
  }
}

export default function SkyDome({ location, time, issData }) {
  const canvasRef = useRef(null)
  const [objects, setObjects] = useState([])
  const [hovered, setHovered] = useState(null)
  const [satellites, setSatellites] = useState([])

  // Fetch satellites once per location change (heavy operation)
  useEffect(() => {
    if (!location) return
    setSatellites([])  // clear while loading
    getVisibleSatellites(location.lat, location.lng, time)
      .then(setSatellites)
      .catch(() => setSatellites([]))
  }, [location?.lat, location?.lng])

  // Recompute planet/star positions every second
  useEffect(() => {
    if (!location) return
    const planets = getCelestialPositions(location.lat, location.lng, time)
    const stars = getStarPositions(location.lat, location.lng, time)

    // Add ISS if we have data
    const all = [...stars, ...planets]
    if (issData) {
      // Compute ISS az/alt relative to observer
      const issAzAlt = issAzimuthAltitude(location.lat, location.lng, issData.lat, issData.lng)
      if (issAzAlt.altitude > 0) {
        all.push({
          name: 'ISS',
          azimuth: issAzAlt.azimuth,
          altitude: issAzAlt.altitude,
          color: '#00ff88',
          size: 6,
          type: 'iss',
          visible: true,
        })
      }
    }

    setObjects([...all, ...satellites])
  }, [time, location, issData, satellites])

  // Draw to canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2
    const R = Math.min(cx, cy) - 20

    ctx.clearRect(0, 0, W, H)

    // Background
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
    grad.addColorStop(0, '#0d1b35')
    grad.addColorStop(1, '#060c18')
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, 2 * Math.PI)
    ctx.fillStyle = grad
    ctx.fill()

    // Clip everything to the dome circle
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, 2 * Math.PI)
    ctx.clip()

    // Altitude rings + labels
    const rings = [
      { alt: 0,  label: 'Horizon' },
      { alt: 30, label: '30°' },
      { alt: 60, label: '60°' },
    ]
    rings.forEach(({ alt, label }) => {
      const r = R * (1 - alt / 90)
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, 2 * Math.PI)
      ctx.strokeStyle = alt === 0 ? '#2a4a6b' : '#1a2e45'
      ctx.lineWidth = alt === 0 ? 1.5 : 0.7
      ctx.stroke()
      if (alt > 0) {
        ctx.fillStyle = '#2a4a6b'
        ctx.font = '10px Arial'
        ctx.fillText(label, cx + r + 3, cy - 3)
      }
    })

    // Cardinal direction lines
    const dirs = [
      { az: 0, label: 'N' },
      { az: 90, label: 'E' },
      { az: 180, label: 'S' },
      { az: 270, label: 'W' },
    ]
    dirs.forEach(({ az, label }) => {
      const edge = toCanvas(az, 0, cx, cy, R)
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(edge.x, edge.y)
      ctx.strokeStyle = '#1a2e45'
      ctx.lineWidth = 0.5
      ctx.stroke()
      const lp = toCanvas(az, -4, cx, cy, R)
      ctx.fillStyle = '#3a6a9a'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, lp.x, lp.y)
    })

    ctx.restore()

    // Dome border
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, 2 * Math.PI)
    ctx.strokeStyle = '#2a4a6b'
    ctx.lineWidth = 2
    ctx.stroke()

    // Zenith dot
    ctx.beginPath()
    ctx.arc(cx, cy, 3, 0, 2 * Math.PI)
    ctx.fillStyle = '#00d4ff'
    ctx.fill()

    // Draw all objects (below horizon = skip)
    objects
      .filter(o => o.altitude > 0)
      .forEach(obj => {
        const { x, y } = toCanvas(obj.azimuth, obj.altitude, cx, cy, R)

        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, obj.size, 0, 2 * Math.PI)

        // Glow for bright objects
        if (['iss', 'star', 'moon'].includes(obj.type) || obj.size > 4) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, obj.size * 3)
          glow.addColorStop(0, obj.color + 'aa')
          glow.addColorStop(1, 'transparent')
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(x, y, obj.size * 3, 0, 2 * Math.PI)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x, y, obj.size, 0, 2 * Math.PI)
        }

        ctx.fillStyle = obj.color
        ctx.fill()

        // Label (only planets, ISS, Moon, Sun; not every star)
        if (['planet', 'iss', 'moon'].includes(obj.type) || obj.name === 'Sun') {
          ctx.fillStyle = obj.type === 'iss' ? '#00ff88' : '#8aa8cc'
          ctx.font = obj.type === 'iss' ? 'bold 11px Arial' : '10px Arial'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(obj.name, x + obj.size + 4, y)
        }

        // Highlight hovered
        if (hovered && hovered.name === obj.name) {
          ctx.beginPath()
          ctx.arc(x, y, obj.size + 4, 0, 2 * Math.PI)
          ctx.strokeStyle = '#00d4ff'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        ctx.restore()
      })

    // Zenith label
    ctx.fillStyle = '#00d4ff'
    ctx.font = '9px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('ZENITH', cx + 5, cy - 5)

  }, [objects, hovered])

  // Resize canvas to its rendered size
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  // Mouse hover detection
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const R = Math.min(cx, cy) - 20

    let found = null
    for (const obj of objects) {
      if (obj.altitude <= 0) continue
      const { x, y } = toCanvas(obj.azimuth, obj.altitude, cx, cy, R)
      const dist = Math.hypot(mx - x, my - y)
      if (dist < obj.size + 8) { found = obj; break }
    }
    setHovered(found)
  }, [objects])

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="text-xs mb-1" style={{ color: '#6b8bae' }}>
        Sky Dome — {location?.name || `${location?.lat?.toFixed(2)}°, ${location?.lng?.toFixed(2)}°`}
      </div>
      <div className="relative flex-1 w-full max-w-xl">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: hovered ? 'pointer' : 'default' }}
        />
        {hovered && (
          <div
            className="absolute top-2 left-2 text-xs px-3 py-2 rounded pointer-events-none"
            style={{ background: '#0d1b2aee', border: '1px solid #2a4a6b', color: '#c5d0e0' }}
          >
            <div className="font-bold" style={{ color: hovered.color }}>{hovered.name}</div>
            <div>Azimuth: {hovered.azimuth.toFixed(1)}°</div>
            <div>Altitude: {hovered.altitude.toFixed(1)}°</div>
            <div style={{ color: '#6b8bae', textTransform: 'capitalize' }}>{hovered.type}</div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Compute azimuth + altitude of the ISS as seen from observer.
 * Uses simple great-circle geometry.
 */
function issAzimuthAltitude(obsLat, obsLng, issLat, issLng) {
  const R_EARTH = 6371
  const ISS_ALT = 408

  const lat1 = obsLat * Math.PI / 180
  const lat2 = issLat * Math.PI / 180
  const dLng = (issLng - obsLng) * Math.PI / 180

  const x = Math.cos(lat2) * Math.sin(dLng)
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  let az = Math.atan2(x, y) * 180 / Math.PI
  az = (az + 360) % 360

  const dLat = lat2 - lat1
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  const groundDist = 2 * R_EARTH * Math.asin(Math.sqrt(a))
  const slantDist = Math.sqrt(groundDist ** 2 + ISS_ALT ** 2)
  const altitude = Math.asin(ISS_ALT / slantDist) * 180 / Math.PI - Math.asin(groundDist / (2 * slantDist)) * 180 / Math.PI

  return { azimuth: az, altitude }
}
