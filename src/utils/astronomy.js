import * as Astronomy from 'astronomy-engine'

/**
 * Returns azimuth + altitude for a set of bodies given a location and time.
 * Azimuth: 0=N, 90=E, 180=S, 270=W
 * Altitude: degrees above horizon (negative = below)
 */
export function getCelestialPositions(lat, lng, date) {
  const observer = new Astronomy.Observer(lat, lng, 0)

  const bodies = [
    { name: 'Sun',     body: Astronomy.Body.Sun,     color: '#FFD700', size: 10, type: 'star' },
    { name: 'Moon',    body: Astronomy.Body.Moon,    color: '#C8C8C8', size: 8,  type: 'moon' },
    { name: 'Mercury', body: Astronomy.Body.Mercury, color: '#B5A9A0', size: 4,  type: 'planet' },
    { name: 'Venus',   body: Astronomy.Body.Venus,   color: '#F5DEB3', size: 5,  type: 'planet' },
    { name: 'Mars',    body: Astronomy.Body.Mars,    color: '#FF6040', size: 5,  type: 'planet' },
    { name: 'Jupiter', body: Astronomy.Body.Jupiter, color: '#FFB627', size: 7,  type: 'planet' },
    { name: 'Saturn',  body: Astronomy.Body.Saturn,  color: '#E8D5A3', size: 6,  type: 'planet' },
    { name: 'Uranus',  body: Astronomy.Body.Uranus,  color: '#7DE8E8', size: 4,  type: 'planet' },
    { name: 'Neptune', body: Astronomy.Body.Neptune, color: '#4B70DD', size: 4,  type: 'planet' },
  ]

  return bodies.map(({ name, body, color, size, type }) => {
    try {
      const hor = Astronomy.Horizon(date, observer, body, 'normal')
      return {
        name,
        azimuth: hor.azimuth,
        altitude: hor.altitude,
        color,
        size,
        type,
        visible: hor.altitude > -0.5,
      }
    } catch {
      return null
    }
  }).filter(Boolean)
}

/** Get bright named stars (fixed RA/Dec, converted to Az/Alt) */
export function getStarPositions(lat, lng, date) {
  const observer = new Astronomy.Observer(lat, lng, 0)
  const stars = [
    { name: 'Sirius',    ra: 6.7525,  dec: -16.7161 },
    { name: 'Canopus',   ra: 6.3992,  dec: -52.6957 },
    { name: 'Arcturus',  ra: 14.2612, dec: 19.1822  },
    { name: 'Vega',      ra: 18.6157, dec: 38.7837  },
    { name: 'Capella',   ra: 5.2781,  dec: 45.9980  },
    { name: 'Rigel',     ra: 5.2423,  dec: -8.2017  },
    { name: 'Procyon',   ra: 7.6553,  dec: 5.2250   },
    { name: 'Betelgeuse',ra: 5.9195,  dec: 7.4071   },
    { name: 'Achernar',  ra: 1.6286,  dec: -57.2367 },
    { name: 'Altair',    ra: 19.8463, dec: 8.8683   },
    { name: 'Aldebaran', ra: 4.5987,  dec: 16.5093  },
    { name: 'Spica',     ra: 13.4199, dec: -11.1613 },
    { name: 'Antares',   ra: 16.4901, dec: -26.4320 },
    { name: 'Pollux',    ra: 7.7553,  dec: 28.0262  },
    { name: 'Fomalhaut', ra: 22.9608, dec: -29.6223 },
    { name: 'Deneb',     ra: 20.6905, dec: 45.2803  },
  ]

  const lst = Astronomy.SiderealTime(date) + lng / 15  // local sidereal time in hours

  return stars.map(({ name, ra, dec }) => {
    // Hour angle
    const ha = ((lst - ra) % 24) * 15  // degrees
    const haRad = ha * Math.PI / 180
    const decRad = dec * Math.PI / 180
    const latRad = lat * Math.PI / 180

    // Alt-Az conversion
    const sinAlt = Math.sin(decRad) * Math.sin(latRad) +
                   Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad)
    const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180 / Math.PI

    const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) /
                  (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)))
    let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180 / Math.PI
    if (Math.sin(haRad) > 0) azimuth = 360 - azimuth

    return {
      name,
      azimuth,
      altitude,
      color: '#ffffff',
      size: 2.5,
      type: 'star',
      visible: altitude > 0,
    }
  })
}
