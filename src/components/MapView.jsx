import { useEffect, useRef } from 'react'
import L from 'leaflet'

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const ISS_ICON = L.divIcon({
  html: `<div style="
    width:28px; height:28px; border-radius:50%;
    background: radial-gradient(circle, #00ff88 0%, #007744 70%);
    border: 2px solid #00ff88;
    box-shadow: 0 0 10px #00ff88, 0 0 20px #00ff8866;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; animation: isspin 2s linear infinite;
  ">🛸</div>
  <style>@keyframes isspin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }</style>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const PIN_ICON = L.divIcon({
  html: `<div style="
    width:20px; height:20px; border-radius:50%;
    background: #00d4ff; border: 3px solid white;
    box-shadow: 0 0 12px #00d4ff;
  "></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

export default function MapView({ location, onLocationSelect, iss }) {
  const mapRef    = useRef(null)
  const mapObj    = useRef(null)
  const issMarker = useRef(null)
  const pinMarker = useRef(null)
  const issTrail  = useRef([])
  const issPolyline = useRef(null)

  // Init map once
  useEffect(() => {
    if (mapObj.current) return
    const map = L.map(mapRef.current, { center: [20, 0], zoom: 2, zoomControl: true })
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { attribution: '© OpenStreetMap © CARTO', maxZoom: 19 }
    ).addTo(map)

    map.on('click', (e) => {
      onLocationSelect({ lat: e.latlng.lat, lon: e.latlng.lng })
    })

    mapObj.current = map
  }, [])

  // Update ISS marker
  useEffect(() => {
    if (!mapObj.current || !iss) return
    const pos = [iss.lat, iss.lon]

    if (!issMarker.current) {
      issMarker.current = L.marker(pos, { icon: ISS_ICON, zIndexOffset: 1000 })
        .addTo(mapObj.current)
        .bindTooltip('🛸 ISS', { permanent: false, className: 'iss-tooltip' })
    } else {
      issMarker.current.setLatLng(pos)
    }

    // Trail
    issTrail.current.push(pos)
    if (issTrail.current.length > 30) issTrail.current.shift()
    if (issPolyline.current) issPolyline.current.remove()
    if (issTrail.current.length > 1) {
      issPolyline.current = L.polyline(issTrail.current, {
        color: '#00ff88', weight: 1.5, opacity: 0.5, dashArray: '4 6'
      }).addTo(mapObj.current)
    }
  }, [iss])

  // Update pin marker
  useEffect(() => {
    if (!mapObj.current || !location) return
    if (!pinMarker.current) {
      pinMarker.current = L.marker([location.lat, location.lon], { icon: PIN_ICON })
        .addTo(mapObj.current)
        .bindTooltip(`📍 ${location.lat.toFixed(3)}°, ${location.lon.toFixed(3)}°`)
    } else {
      pinMarker.current.setLatLng([location.lat, location.lon])
      pinMarker.current.setTooltipContent(`📍 ${location.lat.toFixed(3)}°, ${location.lon.toFixed(3)}°`)
    }
  }, [location])

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />
      <style>{`
        .iss-tooltip { background: #001a0d; border: 1px solid #00ff88; color: #00ff88; }
        .leaflet-control-zoom a { background: #0d1521 !important; color: #00d4ff !important; border-color: #1a3a5c !important; }
      `}</style>
    </div>
  )
}
