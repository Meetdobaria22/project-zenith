import { useState, useEffect } from 'react'
import WorldMap from './components/WorldMap.jsx'
import SkyDome from './components/SkyDome.jsx'
import DataPanel from './components/DataPanel.jsx'
import Header from './components/Header.jsx'
import useISS from './utils/useISS.js'

export default function App() {
  const [location, setLocation] = useState(null)   // { lat, lng, name }
  const [time, setTime] = useState(new Date())
  const issData = useISS()

  // Live clock — ticks every second
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0a0e1a' }}>
      <Header time={time} location={location} />

      {!location ? (
        /* ── LANDING: full-screen map ── */
        <div className="flex-1 flex flex-col">
          <div className="text-center py-6 px-4">
            <h2 className="text-2xl font-bold mb-1" style={{ color: '#00d4ff' }}>
              What's Above You Right Now?
            </h2>
            <p style={{ color: '#6b8bae' }}>
              Click anywhere on Earth — or use your GPS — to reveal your live celestial window.
            </p>
          </div>
          <div className="flex-1">
            <WorldMap
              onLocationSelect={setLocation}
              issData={issData}
              fullscreen={true}
            />
          </div>
        </div>
      ) : (
        /* ── MAIN VIEW: map + sky dome + panel ── */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          {/* Left: mini map */}
          <div className="lg:w-72 h-48 lg:h-full flex-shrink-0 border-r" style={{ borderColor: '#1a2e45' }}>
            <WorldMap
              onLocationSelect={setLocation}
              issData={issData}
              selectedLocation={location}
              fullscreen={false}
            />
          </div>

          {/* Centre: sky dome */}
          <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
            <SkyDome location={location} time={time} issData={issData} />
          </div>

          {/* Right: data panel */}
          <div
            className="lg:w-80 h-64 lg:h-full overflow-y-auto border-l flex-shrink-0"
            style={{ borderColor: '#1a2e45' }}
          >
            <DataPanel location={location} time={time} issData={issData} />
          </div>
        </div>
      )}
    </div>
  )
}
