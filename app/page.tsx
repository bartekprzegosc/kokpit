'use client'
import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import AudioPlayer, { type AudioPlayerHandle } from '@/components/AudioPlayer'
import JarvisVoice from '@/components/JarvisVoice'

const ArcReactor     = dynamic(() => import('@/components/ArcReactor'),     { ssr: false })
const ClockWidget    = dynamic(() => import('@/components/ClockWidget'),    { ssr: false })
const WeatherWidget  = dynamic(() => import('@/components/WeatherWidget'),  { ssr: false })
const CalendarWidget = dynamic(() => import('@/components/CalendarWidget'), { ssr: false })
const ProjectsWidget = dynamic(() => import('@/components/ProjectsWidget'), { ssr: false })

export default function Kokpit() {
  const [booted, setBooted]   = useState(false)
  const [started, setStarted] = useState(false)
  const audioRef   = useRef<AudioPlayerHandle>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  function handleStart() {
    // Create AudioContext inside user gesture — required by iOS Safari
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    ctx.resume()
    audioCtxRef.current = ctx

    // Unmute music also within gesture window
    audioRef.current?.unmute()
    setStarted(true)
  }

  return (
    <div className="kokpit-root">
      <div className="hud-grid" />
      <div className="scanline" />

      {/* ── MAIN DASHBOARD ── */}
      <div className="kokpit-root" style={{ zIndex: 1 }}>

        {/* TOP BAR */}
        <div className="kokpit-topbar">
          <div className="neon font-black" style={{ fontSize: 11, letterSpacing: 6 }}>
            J.A.R.V.I.S.
          </div>
          <div className="kokpit-topbar-systems" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {['POWER', 'SHIELD', 'COMMS', 'NAV'].map(sys => (
              <div key={sys} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                color: 'rgba(0,245,255,0.5)', fontSize: 9, letterSpacing: 1.5, fontFamily: 'Orbitron',
              }}>
                <span style={{ color: booted ? '#00ff88' : '#ffaa00', fontSize: 8 }}>●</span>
                {sys}
              </div>
            ))}
          </div>
          <div style={{ color: 'rgba(0,245,255,0.4)', letterSpacing: 2, fontSize: 9, fontFamily: 'Orbitron' }}>
            SEC: ALPHA-7
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="kokpit-grid">
          <div className="kokpit-cell-clock"><ClockWidget /></div>

          <div className="kokpit-cell-jarvis panel p-4 flex flex-col justify-between">
            <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(0,245,255,0.6)', fontFamily: 'Orbitron', marginBottom: 8 }}>
              // JARVIS STATUS
            </div>
            {/* JarvisVoice only mounts after click — AudioContext is passed from gesture handler */}
            {started && (
              <JarvisVoice
                audioCtx={audioCtxRef.current}
                onBoot={() => setBooted(true)}
              />
            )}
            <div style={{ color: 'rgba(0,245,255,0.3)', letterSpacing: 1, fontSize: 9, fontFamily: 'JetBrains Mono, monospace', marginTop: 8 }}>
              REACTOR: 3.00 GJ/S &nbsp;|&nbsp; UPTIME: 100%
            </div>
          </div>

          <div className="kokpit-cell-weather"><WeatherWidget /></div>
          <div className="kokpit-cell-calendar"><CalendarWidget /></div>

          <div className="kokpit-cell-reactor panel flex items-center justify-center">
            <ArcReactor active={booted} />
          </div>

          <div className="kokpit-cell-projects"><ProjectsWidget /></div>
        </div>

        {/* BOTTOM BAR */}
        <div className="kokpit-bottombar">
          <AudioPlayer ref={audioRef} />
          <div className="kokpit-bottombar-label" style={{ color: 'rgba(0,245,255,0.2)', letterSpacing: 2, fontSize: 9, fontFamily: 'Orbitron' }}>
            STARK INDUSTRIES // CONFIDENTIAL
          </div>
        </div>
      </div>

      {/* ── BOOT OVERLAY ── */}
      {!started && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0a0f1c', cursor: 'pointer',
        }} onClick={handleStart}>
          <div className="hud-grid" />
          <div className="scanline" />

          <div style={{ marginBottom: 32, opacity: 0.3 }}>
            <ArcReactor active={false} />
          </div>

          <div className="neon font-black text-center" style={{
            fontSize: 13, letterSpacing: 8, marginBottom: 24,
            animation: 'flicker 3s infinite',
          }}>
            J.A.R.V.I.S.
          </div>
          <div className="text-xs text-center" style={{
            color: 'rgba(0,245,255,0.4)', letterSpacing: 4, marginBottom: 40, fontSize: 10,
          }}>
            JUST A RATHER VERY INTELLIGENT SYSTEM
          </div>
          <div style={{
            color: 'rgba(0,245,255,0.3)', letterSpacing: 4, fontSize: 10,
            border: '1px solid rgba(0,245,255,0.2)',
            padding: '10px 30px', borderRadius: 2,
            animation: 'pulse-ring 2s ease-in-out infinite',
            fontFamily: 'Orbitron',
          }}>
            [ TAP TO INITIALIZE ]
          </div>
        </div>
      )}
    </div>
  )
}
