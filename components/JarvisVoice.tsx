'use client'
import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react'

export interface JarvisVoiceHandle {
  /** Must be called inside a click handler to pre-unlock the Audio element on iOS */
  unlock: () => void
}

const JarvisVoice = forwardRef<JarvisVoiceHandle, { onBoot: () => void }>(
  function JarvisVoice({ onBoot }, ref) {
    const [lines, setLines] = useState<string[]>([])
    const [done, setDone] = useState(false)
    const spoken = useRef(false)
    const audioEl  = useRef<HTMLAudioElement | null>(null)
    const audioCtx = useRef<AudioContext | null>(null)

    const bootLines = [
      'INITIALIZING J.A.R.V.I.S. SYSTEMS...',
      'LOADING NEURAL INTERFACE...',
      'SCANNING ENVIRONMENT...',
      'ALL SYSTEMS NOMINAL.',
      'WELCOME BACK, SIR.',
    ]

    useEffect(() => {
      audioEl.current = new Audio()
      audioEl.current.volume = 1.0
    }, [])

    // Called directly inside click handler — creates & resumes AudioContext within user gesture (required by iOS)
    useImperativeHandle(ref, () => ({
      unlock() {
        // Create AudioContext inside gesture window — iOS requires this
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtx.current = new Ctx()
        audioCtx.current.resume()

        // Also play silent audio to unlock <audio> element as fallback
        const el = audioEl.current
        if (!el) return
        el.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
        el.play().catch(() => {})
      },
    }))

    function buildSpeech() {
      const h = new Date().getHours()
      const greeting = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
      return `Good ${greeting}, sir. All systems are online and operating within normal parameters. ` +
        `You have four active projects in the pipeline. ` +
        `Arc reactor power at one hundred percent. ` +
        `Standing by for your instructions.`
    }

    async function speak() {
      if (spoken.current) return
      spoken.current = true

      // Ensure AudioContext exists — fallback if unlock() wasn't called (desktop Chrome allows this)
      if (!audioCtx.current) {
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtx.current = new Ctx()
      }
      const ctx = audioCtx.current

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          // Ensure context is running (may be suspended after page load)
          if (ctx.state === 'suspended') await ctx.resume()

          const res = await fetch('/api/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: buildSpeech() }),
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)

          const arrayBuffer = await res.arrayBuffer()
          const decoded = await ctx.decodeAudioData(arrayBuffer)
          const source = ctx.createBufferSource()
          source.buffer = decoded
          // GainNode: 2.0 = 100% louder than hardware max
          const gain = ctx.createGain()
          gain.gain.value = 2.0
          source.connect(gain)
          gain.connect(ctx.destination)
          source.start(0)
          return
        } catch (err) {
          console.warn(`JARVIS attempt ${attempt}:`, err)
          if (attempt < 3) await new Promise(r => setTimeout(r, 800))
          // No fallback — silence is better than a female voice
        }
      }
    }

    useEffect(() => {
      let i = 0
      const id = setInterval(() => {
        if (i < bootLines.length) {
          setLines(prev => [...prev, bootLines[i++]])
        } else {
          clearInterval(id)
          setDone(true)
          onBoot()
          speak()
        }
      }, 380)
      return () => clearInterval(id)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
      <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            fontSize: 11,
            color: i === lines.length - 1 ? '#00f5ff' : 'rgba(0,245,255,0.45)',
            letterSpacing: 2,
            textShadow: i === lines.length - 1 ? '0 0 8px #00f5ff' : 'none',
            marginBottom: 3,
          }}>
            &gt; {line}
            {i === lines.length - 1 && !done && (
              <span style={{ animation: 'flicker 0.8s infinite', marginLeft: 2 }}>_</span>
            )}
          </div>
        ))}
        {done && (
          <div style={{ fontSize: 9, color: 'rgba(0,245,255,0.3)', letterSpacing: 1.5, marginTop: 6, fontFamily: 'Orbitron' }}>
            VOICE: EN-GB DANIEL // ELEVENLABS // READY
          </div>
        )}
      </div>
    )
  }
)

export default JarvisVoice
