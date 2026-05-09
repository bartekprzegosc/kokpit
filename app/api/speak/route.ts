import { NextRequest, NextResponse } from 'next/server'

// Daniel — British male broadcaster (best JARVIS match)
const VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 500 })
  }

  const { text } = await req.json()
  if (!text || typeof text !== 'string' || text.length > 1000) {
    return NextResponse.json({ error: 'Invalid text' }, { status: 400 })
  }

  // Non-streaming endpoint — returns a complete MP3 buffer (more reliable on Vercel)
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
    const err = await res.text()
    console.error('ElevenLabs error:', err)
    return NextResponse.json({ error: 'ElevenLabs request failed' }, { status: 502 })
  }

  // Return complete MP3 buffer
  const audioBuffer = await res.arrayBuffer()
  return new NextResponse(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
      'Content-Length': String(audioBuffer.byteLength),
    },
  })
}
