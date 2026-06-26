export default function Header({ time, location }) {
  const utc = time.toUTCString().slice(17, 25)
  const local = time.toLocaleTimeString()

  return (
    <header
      className="flex items-center justify-between px-4 py-2 flex-shrink-0"
      style={{ background: '#0d1b2a', borderBottom: '1px solid #1a2e45' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold tracking-widest" style={{ color: '#00d4ff' }}>
          ✦ ZENITH
        </span>
        <span className="text-xs hidden sm:block" style={{ color: '#6b8bae' }}>
          The Celestial Eye
        </span>
      </div>

      {location && (
        <div className="text-xs text-center" style={{ color: '#6b8bae' }}>
          <span style={{ color: '#c5d0e0' }}>{location.name || `${location.lat.toFixed(2)}°, ${location.lng.toFixed(2)}°`}</span>
        </div>
      )}

      <div className="text-xs text-right" style={{ color: '#6b8bae' }}>
        <div><span style={{ color: '#00d4ff' }}>UTC</span> {utc}</div>
        <div className="hidden sm:block">Local {local}</div>
      </div>
    </header>
  )
}
