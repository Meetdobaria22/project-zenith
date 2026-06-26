import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

// Fix default marker icons broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function WorldMap({ onLocationSelect, issData, selectedLocation, fullscreen }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const issMarkerRef = useRef(null)
  const pinMarkerRef = useRef(null)
  const [locating, setLocating] = useState(false)

  // Initialise map once
  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: fullscreen ? 2 : 1,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map)

    // ISS icon
    const issIcon = L.divIcon({
      html: `<div style="
        width:14px;height:14px;border-radius:50%;
        background:#00ff88;border:2px solid #00cc66;
        box-shadow:0 0 8px #00ff88;
      "></div>`,
      className: '',
      iconAnchor: [7, 7],
    })

    issMarkerRef.current = L.marker([0, 0], { icon: issIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindTooltip('ISS', { permanent: false, direction: 'top' })

    // Click to pick location
    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      selectLocation(map, lat, lng, null)
    })

    mapInstanceRef.current = map
  }, [])

  // Update ISS marker whenever issData changes
  useEffect(() => {
    if (!issMarkerRef.current || !issData) return
    issMarkerRef.current.setLatLng([issData.lat, issData.lng])
    issMarkerRef.current.setTooltipContent(
      `ISS · Alt ${issData.altitude} km · ${issData.lat.toFixed(1)}°, ${issData.lng.toFixed(1)}°`
    )
  }, [issData])

  function selectLocation(map, lat, lng, name) {
    // Drop / move pin
    if (pinMarkerRef.current) {
      pinMarkerRef.current.setLatLng([lat, lng])
    } else {
      pinMarkerRef.current = L.marker([lat, lng]).addTo(map)
    }
    onLocationSelect({ lat, lng, name })
  }

  function handleGeolocate() {
    if (!navigator.geolocation) return alert('Geolocation not supported by your browser.')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        mapInstanceRef.current?.setView([lat, lng], 6)
        selectLocation(mapInstanceRef.current, lat, lng, 'Your Location')
        setLocating(false)
      },
      () => { alert('Could not get your location.'); setLocating(false) }
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* GPS button */}
      <button
        onClick={handleGeolocate}
        className="absolute bottom-4 right-4 z-[1000] px-3 py-2 rounded text-sm font-bold"
        style={{ background: '#00d4ff', color: '#0a0e1a' }}
      >
        {locating ? '...' : '📍 My Location'}
      </button>

      {fullscreen && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1 rounded text-xs"
          style={{ background: '#0d1b2a99', color: '#6b8bae', border: '1px solid #1a2e45' }}
        >
          Click the map to select your zenith point
        </div>
      )}
    </div>
  )
}
