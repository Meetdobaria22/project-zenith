import { useState, useEffect } from 'react'
import { getCelestialPositions } from '../utils/astronomy.js'

function Card({ color, title, children }) {
  return (
    <div className="mb-3 rounded overflow-hidden" style={{ border: '1px solid #1a2e45' }}>
      <div
        className="px-3 py-1.5 text-xs font-bold tracking-wide"
        style={{ background: '#0d1b2a', borderLeft: `3px solid ${color}`, color }}
      >
        {title}
      </div>
      <div className="px-3 py-2" style={{ background: '#090d17' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, valueColor }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-xs" style={{ color: '#6b8bae' }}>{label}</span>
      <span className="text-xs font-mono" style={{ color: valueColor || '#c5d0e0' }}>{value}</span>
    </div>
  )
}

function LiveDot() {
  return (
    <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{
      background: '#00ff88',
      boxShadow: '0 0 6px #00ff88',
      animation: 'pulse 1.5s infinite',
    }} />
  )
}

export default function DataPanel({ location, time, issData }) {
  const [planets, setPlanets] = useState([])

  useEffect(() => {
    if (!location) return
    const p = getCelestialPositions(location.lat, location.lng, time)
    setPlanets(p)
  }, [time, location])

  if (!location) return null

  const sun  = planets.find(p => p.name === 'Sun')
  const moon = planets.find(p => p.name === 'Moon')
  const visiblePlanets = planets.filter(p =>
    !['Sun', 'Moon'].includes(p.name) && p.altitude > 0
  )
  const belowHorizon = planets.filter(p =>
    !['Sun', 'Moon'].includes(p.name) && p.altitude <= 0
  )

  const isDaytime = sun && sun.altitude > 0

  return (
    <div className="p-3 h-full">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      {/* ISS Card */}
      <Card color="#00ff88" title={<><LiveDot />ISS — Live</>}>
        {issData ? (
          <>
            <Row label="Latitude"  value={`${issData.lat.toFixed(2)}°`} />
            <Row label="Longitude" value={`${issData.lng.toFixed(2)}°`} />
            <Row label="Altitude"  value={`${issData.altitude} km`} valueColor="#00ff88" />
            <Row label="Speed"     value={`${issData.speed} km/s`} />
            <div className="mt-2 text-xs" style={{ color: '#6b8bae' }}>
              Updates every 5 seconds
            </div>
          </>
        ) : (
          <p className="text-xs" style={{ color: '#6b8bae' }}>Fetching ISS position…</p>
        )}
      </Card>

      {/* Sun Card */}
      {sun && (
        <Card color="#FFD700" title={`☀ Sun — ${isDaytime ? 'Above Horizon' : 'Below Horizon'}`}>
          <Row label="Azimuth"  value={`${sun.azimuth.toFixed(1)}°`} />
          <Row label="Altitude" value={`${sun.altitude.toFixed(1)}°`}
               valueColor={sun.altitude > 0 ? '#FFD700' : '#6b8bae'} />
          <Row label="Status"   value={isDaytime ? 'Daytime' : 'Nighttime'}
               valueColor={isDaytime ? '#FFD700' : '#4b70dd'} />
        </Card>
      )}

      {/* Moon Card */}
      {moon && (
        <Card color="#C8C8C8" title="☽ Moon">
          <Row label="Azimuth"  value={`${moon.azimuth.toFixed(1)}°`} />
          <Row label="Altitude" value={`${moon.altitude.toFixed(1)}°`}
               valueColor={moon.altitude > 0 ? '#C8C8C8' : '#6b8bae'} />
          <Row label="Visible"  value={moon.altitude > 0 ? 'Yes' : 'No'} />
        </Card>
      )}

      {/* Visible Planets */}
      {visiblePlanets.length > 0 && (
        <Card color="#FFB627" title={`Planets Visible (${visiblePlanets.length})`}>
          {visiblePlanets.map(p => (
            <div key={p.name} className="mb-2">
              <div className="flex justify-between">
                <span className="text-xs font-bold" style={{ color: p.color }}>{p.name}</span>
                <span className="text-xs" style={{ color: '#00d4ff' }}>Alt {p.altitude.toFixed(1)}°</span>
              </div>
              <div className="text-xs" style={{ color: '#6b8bae' }}>Az {p.azimuth.toFixed(1)}°</div>
            </div>
          ))}
        </Card>
      )}

      {/* Below horizon planets */}
      {belowHorizon.length > 0 && (
        <Card color="#2a4a6b" title={`Below Horizon (${belowHorizon.length})`}>
          <div className="text-xs" style={{ color: '#6b8bae' }}>
            {belowHorizon.map(p => p.name).join(', ')}
          </div>
        </Card>
      )}

      {/* Location info */}
      <Card color="#6b8bae" title="Observer Location">
        <Row label="Latitude"  value={`${location.lat.toFixed(4)}°`} />
        <Row label="Longitude" value={`${location.lng.toFixed(4)}°`} />
        {location.name && <Row label="Place" value={location.name} />}
        <Row label="UTC Time" value={time.toUTCString().slice(17, 25)} valueColor="#00d4ff" />
      </Card>
    </div>
  )
}
