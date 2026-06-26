import { useState, useEffect } from 'react'

const PROXY = 'https://api.allorigins.win/get?url='
const ISS_URL = encodeURIComponent('http://api.open-notify.org/iss-now.json')

export default function useISS() {
  const [issData, setIssData] = useState(null)

  useEffect(() => {
    async function fetchISS() {
      try {
        const res = await fetch(PROXY + ISS_URL)
        const json = await res.json()
        const data = JSON.parse(json.contents)
        if (data.message === 'success') {
          setIssData({
            lat: parseFloat(data.iss_position.latitude),
            lng: parseFloat(data.iss_position.longitude),
            altitude: 408,
            speed: 7.66,
            timestamp: data.timestamp,
          })
        }
      } catch (e) {
        // silently retry on next interval
      }
    }

    fetchISS()
    const id = setInterval(fetchISS, 5000)
    return () => clearInterval(id)
  }, [])

  return issData
}
