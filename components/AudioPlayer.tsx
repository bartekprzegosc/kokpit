'use client'
import { useEffect, useRef, useState } from 'react'

export default function AudioPlayer({ autoplay }: { autoplay: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [vol, setVol] = useState(0.25)

  useEffect(() => {
    if (autoplay && audioRef.current) {
      audioRef.current.volume = vol
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {})
    }
  }, [autoplay]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggle() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.volume = vol
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  function changeVol(v: number) {
    setVol(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  return (
    <div className="flex items-center gap-4">
      {/* Hidden audio element — put iron-man.mp3 in /public */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src="/iron-man.mp3" loop />

      <button onClick={toggle} className="flex items-center gap-2 text-xs tracking-widest" style={{
        color: playing ? '#00f5ff' : 'rgba(0,245,255,0.5)',
        textShadow: playing ? '0 0 8px #00f5ff' : 'none',
        background: 'none', border: '1px solid rgba(0,245,255,0.2)',
        padding: '4px 12px', borderRadius: 2, cursor: 'pointer',
        transition: 'all 0.3s',
      }}>
        {playing ? '⏸ PAUSE' : '▶ PLAY'}
      </button>

      {/* Equalizer bars */}
      <div className="flex items-end gap-px" style={{height:20, opacity: playing ? 1 : 0.2, transition:'opacity 0.3s'}}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            width: 3, background: '#00f5ff', borderRadius: 1,
            boxShadow: '0 0 4px #00f5ff',
            animation: playing ? `eq${i} ${0.4 + i*0.12}s ease-in-out infinite` : 'none',
            height: playing ? undefined : 4,
          }} />
        ))}
      </div>

      <div className="text-xs tracking-widest" style={{color:'rgba(0,245,255,0.4)', fontSize:9}}>
        BLACK SABBATH — IRON MAN
      </div>

      {/* Volume slider */}
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{color:'rgba(0,245,255,0.4)', fontSize:9}}>VOL</span>
        <input type="range" min="0" max="1" step="0.05" value={vol}
          onChange={e => changeVol(parseFloat(e.target.value))}
          style={{
            width: 70, accentColor: '#00f5ff',
            background: 'transparent', cursor: 'pointer',
          }}
        />
      </div>
    </div>
  )
}
