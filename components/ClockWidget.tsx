'use client'
import { useEffect, useState } from 'react'

export default function ClockWidget() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!now) return null

  const hh = String(now.getHours()).padStart(2,'0')
  const mm = String(now.getMinutes()).padStart(2,'0')
  const ss = String(now.getSeconds()).padStart(2,'0')
  const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  const day = days[now.getDay()]
  const date = `${String(now.getDate()).padStart(2,'0')} ${months[now.getMonth()]} ${now.getFullYear()}`

  return (
    <div className="panel p-4 h-full flex flex-col justify-between">
      <div className="text-xs tracking-widest neon-sm opacity-70">// SYSTEM TIME</div>

      <div className="flex items-end gap-1 my-2">
        <span className="neon font-black" style={{fontSize: 52, lineHeight:1, letterSpacing: 2, animation: 'flicker 8s infinite'}}>
          {hh}:{mm}
        </span>
        <span className="neon-sm mb-1" style={{fontSize: 28, letterSpacing: 1}}>{ss}</span>
      </div>

      <div>
        <div className="text-xs tracking-widest neon-sm" style={{opacity: 0.6}}>{day}</div>
        <div className="text-sm tracking-widest neon-sm mt-1">{date}</div>
      </div>

      {/* Mini bar chart for seconds */}
      <div className="flex items-end gap-px mt-3" style={{height: 24}}>
        {Array.from({length: 30}).map((_, i) => (
          <div key={i} style={{
            width: 3, borderRadius: 1,
            background: i < (now.getSeconds() / 2)
              ? '#00f5ff'
              : 'rgba(0,245,255,0.1)',
            height: i % 5 === 0 ? 20 : i % 3 === 0 ? 14 : 8,
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <div className="text-xs mt-2" style={{color:'rgba(0,245,255,0.4)', letterSpacing: 2}}>
        {`UTC${-(now.getTimezoneOffset()/60) >= 0 ? '+' : ''}${-(now.getTimezoneOffset()/60)}`}
      </div>
    </div>
  )
}
