'use client'
import { useEffect, useState } from 'react'

export default function CalendarWidget() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => { setNow(new Date()) }, [])
  if (!now) return null

  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
                  'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER']
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number|null)[] = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="panel p-4 h-full flex flex-col">
      <div className="text-xs tracking-widest neon-sm opacity-70 mb-2">// TEMPORAL GRID</div>

      <div className="text-center neon font-bold tracking-widest mb-3" style={{fontSize: 13, letterSpacing: 3}}>
        {months[month]} {year}
      </div>

      <div className="grid grid-cols-7 gap-px flex-1">
        {['M','T','W','T','F','S','S'].map((d,i) => (
          <div key={i} className="text-center text-xs font-bold" style={{
            color: i >= 5 ? 'rgba(0,245,255,0.3)' : 'rgba(0,245,255,0.5)',
            letterSpacing: 1, paddingBottom: 4,
          }}>{d}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} className="flex items-center justify-center text-xs" style={{
            aspectRatio: '1',
            background: d === today ? 'rgba(0,245,255,0.15)' : 'transparent',
            border: d === today ? '1px solid rgba(0,245,255,0.5)' : '1px solid transparent',
            borderRadius: 2,
            color: !d ? 'transparent'
              : d === today ? '#00f5ff'
              : d < today ? 'rgba(0,245,255,0.25)'
              : 'rgba(0,245,255,0.7)',
            textShadow: d === today ? '0 0 8px #00f5ff' : 'none',
            fontWeight: d === today ? 700 : 400,
            fontSize: 11,
          }}>
            {d || ''}
          </div>
        ))}
      </div>

      <div className="mt-2 text-xs text-center" style={{color:'rgba(0,245,255,0.3)', letterSpacing:2}}>
        DAY {today} OF {daysInMonth}
      </div>
    </div>
  )
}
