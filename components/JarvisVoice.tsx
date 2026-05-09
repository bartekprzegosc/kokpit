'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  /** AudioContext created inside the user-gesture handler in page.tsx */
  audioCtx: AudioContext | null
  onBoot: () => void
}

export default function JarvisVoice({ audioCtx, onBoot }: Props) {
  const [lines, setLines]   = useState<string[]>([])
  const [done, setDone]     = useState(false)
  const [status, setStatus] = useState('')
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
        setStatus(`FETCHING... (${attempt}/3)`)
        const res = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: buildSpeech() }),
        })
        if (!res.ok) throw new Error(`API ${res.status}`)

        setStatus('DECODING...')
        const arrayBuffer = await res.arrayBuffer()
        setStatus(`BUF ${arrayBuffer.byteLength}B CTX:${audioCtx?.state ?? 'null'}`)

        // Primary: Web Audio API with gain boost (created in user gesture → iOS safe)
        if (audioCtx && audioCtx.state !== 'closed') {
          try {
            if (audioCtx.state === 'suspended') await audioCtx.resume()
            const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0))
            const source = ctx_source(audioCtx, decoded)
            source.start(0)
            setStatus('PLAYING WebAudio ✓')
            return
          } catch (webAudioErr) {
            setStatus(`WebAudio ERR: ${String(webAudioErr).slice(0,40)}`)
            await new Promise(r => setTimeout(r, 400))
          }
        }

        // Fallback: plain <audio> element
        setStatus('TRYING Audio element...')
        const blob  = new Blob([arrayBuffer], { type: 'audio/mpeg' })
        const url   = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.volume = 1.0
        await audio.play()
        audio.onended = () => URL.revokeObjectURL(url)
        setStatus('PLAYING Audio ✓')
        return

      } catch (err) {
        setStatus(`ERR ${attempt}/3: ${String(err).slice(0, 50)}`)
        if (attempt < 3) await new Promise(r => setTimeout(r, 800))
      }
    }
    setStatus('FAILED — check network/API')
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
        <div style={{ fontSize: 9, color: status.includes('✓') ? '#00ff88' : status.includes('ERR') || status.includes('FAIL') ? '#ff4444' : 'rgba(0,245,255,0.4)', letterSpacing: 1.5, marginTop: 6, fontFamily: 'Orbitron' }}>
          {status || 'VOICE: EN-GB DANIEL // ELEVENLABS // READY'}
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
