'use client'
import { useEffect, useState } from 'react'

export default function ArcReactor({ active }: { active: boolean }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50)
    return () => clearInterval(id)
  }, [])

  const intensity = active ? 1 : 0.3

  return (
    <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full" style={{
        background: `radial-gradient(circle, rgba(0,245,255,${0.08 * intensity}) 0%, transparent 70%)`,
        animation: 'pulse-ring 2s ease-in-out infinite',
      }} />

      {/* Ring 1 — slowest */}
      <div className="absolute rounded-full" style={{
        width: 260, height: 260,
        border: `1px solid rgba(0,245,255,${0.15 * intensity})`,
        animation: 'spin-cw 80s linear infinite',
      }}>
        <div style={{ position:'absolute', top: -3, left: '45%', width: 8, height: 6,
          background: '#00f5ff', borderRadius: '50%',
          boxShadow: `0 0 8px #00f5ff, 0 0 15px #00f5ff` }} />
      </div>

      {/* Ring 2 */}
      <div className="absolute rounded-full" style={{
        width: 230, height: 230,
        border: `1px dashed rgba(0,245,255,${0.2 * intensity})`,
        animation: 'spin-ccw 55s linear infinite',
      }} />

      {/* Ring 3 */}
      <div className="absolute rounded-full" style={{
        width: 200, height: 200,
        border: `2px solid rgba(0,245,255,${0.25 * intensity})`,
        animation: 'spin-cw 35s linear infinite',
        boxShadow: active ? `0 0 15px rgba(0,245,255,0.15), inset 0 0 15px rgba(0,245,255,0.05)` : 'none',
      }}>
        {[0,90,180,270].map(deg => (
          <div key={deg} style={{
            position:'absolute', width: 6, height: 6, borderRadius: '50%',
            background: `rgba(0,245,255,${0.6 * intensity})`,
            boxShadow: `0 0 6px rgba(0,245,255,0.8)`,
            top: '50%', left: '50%',
            transform: `rotate(${deg}deg) translateX(98px) translateY(-3px)`,
          }} />
        ))}
      </div>

      {/* Ring 4 — inner fast */}
      <div className="absolute rounded-full" style={{
        width: 160, height: 160,
        border: `1px solid rgba(0,245,255,${0.35 * intensity})`,
        animation: 'spin-ccw 18s linear infinite',
      }}>
        {[0,60,120,180,240,300].map(deg => (
          <div key={deg} style={{
            position:'absolute', width: 4, height: 4, borderRadius: '50%',
            background: `rgba(0,245,255,${0.5 * intensity})`,
            top: '50%', left: '50%',
            transform: `rotate(${deg}deg) translateX(78px) translateY(-2px)`,
          }} />
        ))}
      </div>

      {/* Hexagon lines */}
      <div className="absolute" style={{ width: 110, height: 110 }}>
        <svg viewBox="0 0 110 110" style={{ width: '100%', height: '100%' }}>
          <polygon
            points="55,5 100,27.5 100,82.5 55,105 10,82.5 10,27.5"
            fill="none"
            stroke={`rgba(0,245,255,${0.3 * intensity})`}
            strokeWidth="1"
          />
          <polygon
            points="55,20 87,37 87,72 55,90 23,72 23,37"
            fill="none"
            stroke={`rgba(0,245,255,${0.2 * intensity})`}
            strokeWidth="0.5"
          />
        </svg>
      </div>

      {/* Core */}
      <div className="absolute rounded-full flex items-center justify-center" style={{
        width: 80, height: 80,
        background: active
          ? 'radial-gradient(circle, rgba(180,240,255,0.95) 0%, rgba(0,200,255,0.8) 40%, rgba(0,100,200,0.4) 70%, transparent 100%)'
          : 'radial-gradient(circle, rgba(0,80,120,0.6) 0%, transparent 100%)',
        boxShadow: active
          ? '0 0 20px #00f5ff, 0 0 50px rgba(0,245,255,0.6), 0 0 100px rgba(0,245,255,0.2)'
          : 'none',
        animation: active ? 'pulse-ring 1.8s ease-in-out infinite' : 'none',
        transition: 'all 1.5s ease',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: active ? '#ffffff' : 'rgba(0,100,150,0.4)',
          boxShadow: active ? '0 0 15px #fff, 0 0 30px #00f5ff' : 'none',
          transition: 'all 1.5s ease',
        }} />
      </div>

      {/* Tick marks around outer edge */}
      {Array.from({length: 36}).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: i % 6 === 0 ? 2 : 1,
          height: i % 6 === 0 ? 8 : 4,
          background: `rgba(0,245,255,${i % 6 === 0 ? 0.6 : 0.2})`,
          top: '50%', left: '50%',
          transformOrigin: '0 0',
          transform: `rotate(${i * 10}deg) translateX(138px) translateY(-50%)`,
        }} />
      ))}
    </div>
  )
}
