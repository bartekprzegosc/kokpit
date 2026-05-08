'use client'
import { useEffect, useState } from 'react'

type WeatherData = {
  temp: string
  feels: string
  desc: string
  humidity: string
  wind: string
  city: string
}

const WX_ICONS: Record<string, string> = {
  'sunny': '☀', 'clear': '☀', 'cloud': '⛅', 'overcast': '☁',
  'rain': '🌧', 'drizzle': '🌦', 'snow': '❄', 'thunder': '⛈',
  'fog': '🌫', 'mist': '🌫', 'sleet': '🌨',
}

function getIcon(desc: string) {
  const lower = desc.toLowerCase()
  for (const [key, icon] of Object.entries(WX_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return '◈'
}

export default function WeatherWidget() {
  const [wx, setWx] = useState<WeatherData | null>(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    fetch('https://wttr.in/Warsaw?format=j1')
      .then(r => r.json())
      .then(data => {
        const cur = data.current_condition?.[0]
        const area = data.nearest_area?.[0]
        setWx({
          temp: cur.temp_C,
          feels: cur.FeelsLikeC,
          desc: cur.weatherDesc?.[0]?.value || 'N/A',
          humidity: cur.humidity,
          wind: cur.windspeedKmph,
          city: area?.areaName?.[0]?.value || 'Warsaw',
        })
      })
      .catch(() => setErr(true))
  }, [])

  return (
    <div className="panel p-4 h-full flex flex-col justify-between">
      <div className="text-xs tracking-widest neon-sm opacity-70">// ATMOSPHERIC DATA</div>

      {err && (
        <div className="text-xs mt-2" style={{color:'rgba(0,245,255,0.4)'}}>
          SENSOR OFFLINE
        </div>
      )}

      {!wx && !err && (
        <div className="text-xs mt-2" style={{color:'rgba(0,245,255,0.5)', letterSpacing:2}}>
          SCANNING...
        </div>
      )}

      {wx && (
        <>
          <div className="flex items-center gap-3 my-2">
            <span style={{fontSize: 36}}>{getIcon(wx.desc)}</span>
            <div>
              <div className="neon font-black" style={{fontSize: 40, lineHeight:1}}>{wx.temp}°</div>
              <div className="text-xs neon-sm opacity-60">FEELS {wx.feels}°C</div>
            </div>
          </div>

          <div className="text-xs tracking-widest neon-sm mb-2" style={{opacity:0.8}}>
            {wx.desc.toUpperCase()}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              ['HUMIDITY', wx.humidity + '%'],
              ['WIND', wx.wind + ' KM/H'],
              ['LOCATION', wx.city.toUpperCase()],
              ['STATUS', 'NOMINAL'],
            ].map(([label, val]) => (
              <div key={label} className="text-xs" style={{borderLeft:'1px solid rgba(0,245,255,0.2)', paddingLeft:6}}>
                <div style={{color:'rgba(0,245,255,0.4)', letterSpacing:1, fontSize:9}}>{label}</div>
                <div className="neon-sm" style={{fontSize:11, letterSpacing:1}}>{val}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
