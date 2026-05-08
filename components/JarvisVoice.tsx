'use client'
import { useEffect, useRef, useState } from 'react'

// Priority list of deep male en-GB voices (closest to JARVIS)
const PREFERRED_VOICES = [
  'google uk english male',
  'daniel',          // macOS en-GB deep male
  'arthur',          // macOS en-GB (newer)
  'james',
  'oliver',
  'microsoft george', // Windows en-GB
  'microsoft ryan',
  'reed',
  'alex',
  'fred',
]

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  for (const name of PREFERRED_VOICES) {
    const match = voices.find(v => v.name.toLowerCase().includes(name))
    if (match) return match
  }
  // Fallback: any en-GB voice
  const gbVoice = voices.find(v => v.lang === 'en-GB')
  if (gbVoice) return gbVoice
  // Fallback: any English voice
  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null
}

export default function JarvisVoice({ onBoot }: { onBoot: () => void }) {
  const [lines, setLines] = useState<string[]>([])
  const [done, setDone] = useState(false)
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
      `Atmospheric conditions are being monitored. ` +
      `Standing by for your instructions.`
  }

  function speak() {
    if (spoken.current) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    spoken.current = true

    function doSpeak() {
      const voices = window.speechSynthesis.getVoices()
      const utt = new SpeechSynthesisUtterance(buildSpeech())
      utt.rate = 0.82      // slightly slower = more authoritative
      utt.pitch = 0.55     // lower pitch = deeper voice
      utt.volume = 1.0

      const voice = pickVoice(voices)
      if (voice) utt.voice = voice

      window.speechSynthesis.cancel() // clear queue
      window.speechSynthesis.speak(utt)
    }

    // Voices may not be loaded yet — wait for them
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      setTimeout(doSpeak, 700)
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        setTimeout(doSpeak, 700)
      }
    }
  }

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      if (i < bootLines.length) {
        setLines(prev => [...prev, bootLines[i]])
        i++
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
            <span style={{animation:'flicker 0.8s infinite', marginLeft: 2}}>_</span>
          )}
        </div>
      ))}
      {done && (
        <div style={{
          fontSize: 9, color: 'rgba(0,245,255,0.3)',
          letterSpacing: 1.5, marginTop: 6,
          fontFamily: 'Orbitron',
        }}>
          VOICE: EN-GB MALE // PITCH: LOW // READY
        </div>
      )}
    </div>
  )
}
