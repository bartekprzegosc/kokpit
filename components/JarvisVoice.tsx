'use client'
import { useEffect, useRef, useState } from 'react'

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

  const speech = `Good ${getGreeting()}. All systems are online and operating within normal parameters.
    You have ${getProjects()} active projects in the pipeline.
    Current atmospheric conditions are being monitored.
    Arc reactor power at one hundred percent.
    Awaiting your instructions, sir.`

  function getGreeting() {
    const h = new Date().getHours()
    return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
  }

  function getProjects() {
    return 'four'
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
        if (!spoken.current && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          spoken.current = true
          setTimeout(() => {
            const utt = new SpeechSynthesisUtterance(speech)
            utt.rate = 0.9
            utt.pitch = 0.7
            utt.volume = 0.9
            // Try to find a deep male voice
            const voices = window.speechSynthesis.getVoices()
            const preferred = voices.find(v =>
              v.name.toLowerCase().includes('daniel') ||
              v.name.toLowerCase().includes('alex') ||
              v.name.toLowerCase().includes('male') ||
              v.lang === 'en-GB'
            ) || voices.find(v => v.lang.startsWith('en')) || voices[0]
            if (preferred) utt.voice = preferred
            window.speechSynthesis.speak(utt)
          }, 600)
        }
      }
    }, 380)
    return () => clearInterval(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {lines.map((line, i) => (
        <div key={i} className="text-xs" style={{
          color: i === lines.length - 1 ? '#00f5ff' : 'rgba(0,245,255,0.5)',
          letterSpacing: 2,
          textShadow: i === lines.length - 1 ? '0 0 8px #00f5ff' : 'none',
          marginBottom: 2,
        }}>
          &gt; {line}
          {i === lines.length - 1 && !done && (
            <span style={{animation:'flicker 0.8s infinite'}}>_</span>
          )}
        </div>
      ))}
    </div>
  )
}
