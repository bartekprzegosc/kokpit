'use client'
import { useRef, useState, useImperativeHandle, forwardRef } from 'react'

// Direct MP3 from Internet Archive — no iframe, no YouTube API issues
const AUDIO_SRC = 'https://archive.org/download/02ShootToThrill_201410/06%20Back%20In%20Black.mp3'

export interface AudioPlayerHandle {
  unmute: () => void
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const AudioPlayer = forwardRef<AudioPlayerHandle, {}>(
  function AudioPlayer(_props, ref) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [muted, setMuted] = useState(true)
    const [paused, setPaused] = useState(false)
    const [vol, setVol] = useState(25)

    // Called directly within the boot-screen click handler (user gesture)
    useImperativeHandle(ref, () => ({
      unmute() {
        const a = audioRef.current
        if (!a) return
        a.currentTime = 3
        a.volume = vol / 100
        a.muted = false
        a.play().catch(() => {/* blocked — user can click PLAY manually */})
        setMuted(false)
      },
    }))

    function toggle() {
      const a = audioRef.current
      if (!a) return
      if (paused || muted) {
        a.volume = vol / 100
        a.muted = false
        a.play().catch(() => {})
        setMuted(false)
        setPaused(false)
      } else {
        a.pause()
        setPaused(true)
      }
    }

    function changeVol(v: number) {
      setVol(v)
      if (audioRef.current) {
        audioRef.current.volume = v / 100
        if (v > 0 && muted) {
          audioRef.current.muted = false
          setMuted(false)
        }
      }
    }

    const active = !muted && !paused

    return (
      <div className="flex items-center gap-4">
        {/* Native audio element — muted autoplay always allowed, unmuted on click */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio
          ref={audioRef}
          src={AUDIO_SRC}
          loop
          autoPlay
          muted
          preload="auto"
        />

        <button onClick={toggle} style={{
          color: active ? '#00f5ff' : 'rgba(0,245,255,0.5)',
          textShadow: active ? '0 0 8px #00f5ff' : 'none',
          background: 'none', border: '1px solid rgba(0,245,255,0.2)',
          padding: '4px 14px', borderRadius: 2, cursor: 'pointer',
          fontSize: 10, letterSpacing: 2, fontFamily: 'Orbitron',
          transition: 'all 0.3s',
        }}>
          {active ? '⏸ PAUSE' : '▶ PLAY'}
        </button>

        <div className="flex items-end gap-px" style={{ height: 20, opacity: active ? 1 : 0.2, transition: 'opacity 0.5s' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              width: 3, background: '#00f5ff', borderRadius: 1,
              boxShadow: '0 0 4px #00f5ff',
              animation: active ? `eq${i} ${0.4 + i * 0.12}s ease-in-out infinite` : 'none',
              height: active ? undefined : 4,
            }} />
          ))}
        </div>

        <div style={{ color: 'rgba(0,245,255,0.4)', fontSize: 9, letterSpacing: 1.5, fontFamily: 'Orbitron' }}>
          AC/DC — BACK IN BLACK
        </div>

        <div className="flex items-center gap-2">
          <span style={{ color: 'rgba(0,245,255,0.4)', fontSize: 9, fontFamily: 'Orbitron' }}>VOL</span>
          <input type="range" min="0" max="100" step="5" value={vol}
            onChange={e => changeVol(parseInt(e.target.value))}
            onTouchStart={e => e.stopPropagation()}
            style={{
              width: 70, accentColor: '#00f5ff', cursor: 'pointer',
              WebkitAppearance: 'none', appearance: 'none',
              touchAction: 'none',
            }}
          />
        </div>
      </div>
    )
  }
)

export default AudioPlayer
