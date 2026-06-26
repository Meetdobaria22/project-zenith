import { useState, useEffect } from 'react'

export function useISS() {
  const [iss, setISS] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchISS() {
      try {
        const res = await fetch('https://api.allorigins.win/raw?url=' +
          encodeURIComponent('http://api.open-notify.org/iss-now.json'))
        const data = await res.json()
        if (!cancelled) {
          setISS({
            lat: parseFloat(data.iss_position.latitude),
            lon: parseFloat(data.iss_position.longitude),
            timestamp: data.timestamp,
          })
          setError(false)
        }
      } catch (e) {
        if (!cancelled) setError(true)
      }
    }

    fetchISS()
    const interval = setInterval(fetchISS, 5000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  return { iss, error }
}
