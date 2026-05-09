'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  /** AudioContext created inside the user-gesture handler in page.tsx */
  audioCtx: AudioContext | null
  onBoot: () => void
}

export default function JarvisVoice({ audioCtx, onBoot }: Props) {
  const [lines, setLines] = useState<string[]>([])
  const [done, setDone]   = useState(false)
  const spoken = useRef(false)

  const bootLines = [
    'INITIALIZING J.A.R.V.I.S. SYSTEMS...',
    'LOADING NEURAL INTERFACE...',
    'SCANNING ENVIRONMENT...',
    'ALL SYSTEMS NOMINAL.',
    'WELCOME BACK, SIR.',
  ]

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

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: buildSpeech() }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const arrayBuffer = await res.arrayBuffer()

        // Primary: Web Audio API with gain boost (created in user gesture → iOS safe)
        if (audioCtx && audioCtx.state !== 'closed') {
          try {
            if (audioCtx.state === 'suspended') await audioCtx.resume()
            // slice() so original buffer is intact if decodeAudioData consumes it
            const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0))
            const source = ctx_source(audioCtx, decoded)
            source.start(0)
            return // success
          } catch (webAudioErr) {
            console.warn('JARVIS WebAudio failed, trying Audio element:', webAudioErr)
          }
        }

        // Fallback: plain <audio> element — universally supported
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' })
        const url  = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.volume = 1.0
        await audio.play()
        audio.onended = () => URL.revokeObjectURL(url)
        return // success

      } catch (err) {
        console.warn(`JARVIS attempt ${attempt}:`, err)
        if (attempt < 3) await new Promise(r => setTimeout(r, 800))
      }
    }
    console.error('JARVIS: all attempts failed')
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

/** Create a BufferSource + GainNode (1.3×) and connect to destination */
function ctx_source(ctx: AudioContext, decoded: AudioBuffer) {
  const source = ctx.createBufferSource()
  source.buffer = decoded
  const gain = ctx.createGain()
  gain.gain.value = 1.3
  source.connect(gain)
  gain.connect(ctx.destination)
  return source
}
