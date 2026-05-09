'use client'
import { useEffect, useState } from 'react'

interface Props {
  onBoot: () => void
}

export default function JarvisVoice({ onBoot }: Props) {
  const [lines, setLines] = useState<string[]>([])
  const [done, setDone]   = useState(false)

  const bootLines = [
    'INITIALIZING J.A.R.V.I.S. SYSTEMS...',
    'LOADING NEURAL INTERFACE...',
    'SCANNING ENVIRONMENT...',
    'ALL SYSTEMS NOMINAL.',
    'WELCOME BACK, SIR.',
  ]

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      if (i < bootLines.length) {
        setLines(prev => [...prev, bootLines[i++]])
      } else {
        clearInterval(id)
        setDone(true)
        onBoot()
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
