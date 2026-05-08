'use client'
import { useEffect, useRef, useState } from 'react'

// Black Sabbath – Iron Man (official audio on YouTube)
const YT_VIDEO_ID = 'uaPYKDnAXzQ'

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: object) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  setVolume(v: number): void
  getPlayerState(): number
  destroy(): void
}

export default function AudioPlayer({ autoplay }: { autoplay: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const [playing, setPlaying] = useState(false)
  const [vol, setVol] = useState(25)
  const [ready, setReady] = useState(false)

  // Load YouTube IFrame API once
  useEffect(() => {
    if (document.getElementById('yt-api-script')) return
    const tag = document.createElement('script')
    tag.id = 'yt-api-script'
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  }, [])

  // Init player when API ready
  useEffect(() => {
    function initPlayer() {
      if (!containerRef.current || !window.YT?.Player) return
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: YT_VIDEO_ID,
        playerVars: {
          autoplay: 0, controls: 0, disablekb: 1,
          fs: 0, iv_load_policy: 3, modestbranding: 1,
          rel: 0, loop: 1, playlist: YT_VIDEO_ID,
        },
        events: {
          onReady: () => {
            playerRef.current?.setVolume(vol)
            setReady(true)
          },
          onStateChange: (e: { data: number }) => {
            setPlaying(e.data === 1) // 1 = PLAYING
          },
        },
      })
    }

    // If API already loaded
    if (window.YT?.Player) { initPlayer(); return }
    // Wait for API to load
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { prev?.(); initPlayer() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Autoplay when booted
  useEffect(() => {
    if (autoplay && ready && playerRef.current) {
      playerRef.current.setVolume(vol)
      playerRef.current.playVideo()
    }
  }, [autoplay, ready]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggle() {
    if (!playerRef.current) return
    if (playing) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  function changeVol(v: number) {
    setVol(v)
    playerRef.current?.setVolume(v)
  }

  return (
    <div className="flex items-center gap-4">
      {/* Hidden YouTube player — 1x1px off-screen */}
      <div ref={containerRef} style={{
        position: 'fixed', bottom: -100, left: -100,
        width: 1, height: 1, opacity: 0, pointerEvents: 'none',
      }} />

      <button onClick={toggle} style={{
        color: playing ? '#00f5ff' : 'rgba(0,245,255,0.5)',
        textShadow: playing ? '0 0 8px #00f5ff' : 'none',
        background: 'none', border: '1px solid rgba(0,245,255,0.2)',
        padding: '4px 14px', borderRadius: 2, cursor: 'pointer',
        fontSize: 10, letterSpacing: 2, fontFamily: 'Orbitron',
        transition: 'all 0.3s',
      }}>
        {playing ? '⏸ PAUSE' : '▶ PLAY'}
      </button>

      {/* Equalizer bars */}
      <div className="flex items-end gap-px" style={{height: 20, opacity: playing ? 1 : 0.2, transition: 'opacity 0.5s'}}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            width: 3, background: '#00f5ff', borderRadius: 1,
            boxShadow: '0 0 4px #00f5ff',
            animation: playing ? `eq${i} ${0.4 + i * 0.12}s ease-in-out infinite` : 'none',
            height: playing ? undefined : 4,
          }} />
        ))}
      </div>

      <div style={{color: 'rgba(0,245,255,0.4)', fontSize: 9, letterSpacing: 1.5, fontFamily: 'Orbitron'}}>
        BLACK SABBATH — IRON MAN
      </div>

      <div className="flex items-center gap-2">
        <span style={{color: 'rgba(0,245,255,0.4)', fontSize: 9, fontFamily: 'Orbitron'}}>VOL</span>
        <input type="range" min="0" max="100" step="5" value={vol}
          onChange={e => changeVol(parseInt(e.target.value))}
          style={{width: 70, accentColor: '#00f5ff', cursor: 'pointer'}}
        />
      </div>
    </div>
  )
}
