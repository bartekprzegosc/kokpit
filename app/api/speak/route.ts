import { NextRequest, NextResponse } from 'next/server'

// Daniel — British male broadcaster (best JARVIS match)
const VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'

// Allowed origins — only our own domain can call this endpoint
const ALLOWED_ORIGINS = [
  'https://kokpit-five.vercel.app',
  'http://localhost:3000',
]

// Simple in-memory rate limiter — max 5 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  if (entry.count >= 5) return true
  entry.count++
  return false
}

export async function POST(req: NextRequest) {
  // CORS — only allow requests from our own domain
  const origin = req.headers.get('origin') ?? ''
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(null, { status: 403 })
  }

  // Rate limiting — 5 req/min per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let text: string
  try {
    const body = await req.json()
    text = body?.text
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!text || typeof text !== 'string' || text.length > 500) {
    return NextResponse.json({ error: 'Invalid text' }, { status: 400 })
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.65,
          similarity_boost: 0.80,
          style: 0.15,
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!res.ok) {
    console.error('ElevenLabs error:', res.status)
    return NextResponse.json({ error: 'Voice service unavailable' }, { status: 502 })
  }

  const audioBuffer = await res.arrayBuffer()
  return new NextResponse(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
      'Content-Length': String(audioBuffer.byteLength),
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : '',
    },
  })
}
