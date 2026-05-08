'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const ArcReactor     = dynamic(() => import('@/components/ArcReactor'),     { ssr: false })
const ClockWidget    = dynamic(() => import('@/components/ClockWidget'),    { ssr: false })
const WeatherWidget  = dynamic(() => import('@/components/WeatherWidget'),  { ssr: false })
const CalendarWidget = dynamic(() => import('@/components/CalendarWidget'), { ssr: false })
const ProjectsWidget = dynamic(() => import('@/components/ProjectsWidget'), { ssr: false })
const JarvisVoice   = dynamic(() => import('@/components/JarvisVoice'),    { ssr: false })
const AudioPlayer   = dynamic(() => import('@/components/AudioPlayer'),    { ssr: false })

export default function Kokpit() {
  const [booted, setBooted] = useState(false)
  const [started, setStarted] = useState(false)

  if (!started) {
    return (
      <div style={{
        position:'fixed', inset:0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        background:'#0a0f1c', cursor:'pointer', zIndex:50,
      }} onClick={() => setStarted(true)}>
        <div className="hud-grid" />
        <div className="scanline" />

        <div style={{marginBottom: 48, opacity: 0.3}}>
          <ArcReactor active={false} />
        </div>

        <div className="neon font-black text-center" style={{
          fontSize: 13, letterSpacing: 8, marginBottom: 24,
          animation: 'flicker 3s infinite',
        }}>
          J.A.R.V.I.S.
        </div>
        <div className="text-xs text-center" style={{
          color:'rgba(0,245,255,0.4)', letterSpacing: 4, marginBottom: 48,
        }}>
          JUST A RATHER VERY INTELLIGENT SYSTEM
        </div>
        <div className="text-xs" style={{
          color:'rgba(0,245,255,0.3)', letterSpacing: 4,
          border:'1px solid rgba(0,245,255,0.2)',
          padding:'10px 30px', borderRadius:2,
          animation: 'pulse-ring 2s ease-in-out infinite',
        }}>
          [ CLICK TO INITIALIZE ]
        </div>
      </div>
    )
  }

  return (
    <div style={{position:'fixed', inset:0, display:'flex', flexDirection:'column', overflow:'hidden'}}>
      <div className="hud-grid" />
      <div className="scanline" />

      {/* TOP BAR */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 20px',
        borderBottom:'1px solid rgba(0,245,255,0.1)',
        background:'rgba(0,10,20,0.6)',
        backdropFilter:'blur(10px)',
        flexShrink:0, zIndex:10,
      }}>
        <div className="neon font-black" style={{fontSize:11, letterSpacing:6}}>
          J.A.R.V.I.S. // KOKPIT
        </div>
        <div style={{display:'flex', gap:16, alignItems:'center'}}>
          {['POWER','SHIELD','COMMS','NAV'].map(sys => (
            <div key={sys} style={{display:'flex', alignItems:'center', gap:4,
              color:'rgba(0,245,255,0.5)', fontSize:9, letterSpacing:1.5, fontFamily:'Orbitron'}}>
              <span style={{color: booted ? '#00ff88' : '#ffaa00', fontSize:8}}>●</span>
              {sys}
            </div>
          ))}
        </div>
        <div style={{color:'rgba(0,245,255,0.4)', letterSpacing:2, fontSize:9, fontFamily:'Orbitron'}}>
          SEC LEVEL: ALPHA-7
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{
        flex:1, display:'grid',
        gridTemplateColumns:'1fr 300px 1fr',
        gridTemplateRows:'1fr 1fr',
        gap: 8, padding: 8,
        minHeight:0,
      }}>
        <div style={{gridColumn:1, gridRow:1}}><ClockWidget /></div>

        <div style={{gridColumn:2, gridRow:1}} className="panel p-4 flex flex-col justify-between">
          <div style={{fontSize:10, letterSpacing:3, color:'rgba(0,245,255,0.6)', fontFamily:'Orbitron', marginBottom:8}}>
            // JARVIS STATUS
          </div>
          <JarvisVoice onBoot={() => setBooted(true)} />
          <div style={{color:'rgba(0,245,255,0.3)', letterSpacing:1, fontSize:9, fontFamily:'JetBrains Mono, monospace', marginTop:8}}>
            REACTOR OUTPUT: 3.00 GJ/S &nbsp;|&nbsp; UPTIME: 100%
          </div>
        </div>

        <div style={{gridColumn:3, gridRow:1}}><WeatherWidget /></div>

        <div style={{gridColumn:1, gridRow:2}}><CalendarWidget /></div>

        <div style={{gridColumn:2, gridRow:2}} className="panel flex items-center justify-center">
          <ArcReactor active={booted} />
        </div>

        <div style={{gridColumn:3, gridRow:2}}><ProjectsWidget /></div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 20px',
        borderTop:'1px solid rgba(0,245,255,0.1)',
        background:'rgba(0,10,20,0.6)',
        backdropFilter:'blur(10px)',
        flexShrink:0, zIndex:10,
      }}>
        <AudioPlayer autoplay={booted} />
        <div style={{color:'rgba(0,245,255,0.2)', letterSpacing:2, fontSize:9, fontFamily:'Orbitron'}}>
          STARK INDUSTRIES // CONFIDENTIAL
        </div>
      </div>
    </div>
  )
}
