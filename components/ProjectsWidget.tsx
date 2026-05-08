'use client'

const PROJECTS = [
  { name: 'APPLE NOTES CLIPPER', status: 'ACTIVE', ver: 'v2.4', color: '#00f5ff', desc: 'Chrome → Apple Notes web clipper with security hardening' },
  { name: 'GANTMBA', status: 'ACTIVE', ver: 'v1.2', color: '#00f5ff', desc: 'Multi-group Gantt chart for MBA deadline tracking' },
  { name: 'CoNaLunch', status: 'STANDBY', ver: 'v1.0', color: 'rgba(0,245,255,0.5)', desc: 'Polish recipe recommender — ZEN redesign pending' },
  { name: 'KOKPIT', status: 'BOOT', ver: 'v0.1', color: '#00ff88', desc: 'J.A.R.V.I.S. HUD — current session' },
]

export default function ProjectsWidget() {
  return (
    <div className="panel p-4 h-full flex flex-col">
      <div className="text-xs tracking-widest neon-sm opacity-70 mb-3">// ACTIVE PROJECTS</div>

      <div className="flex flex-col gap-2 flex-1">
        {PROJECTS.map((p, i) => (
          <div key={i} className="relative" style={{
            borderLeft: `2px solid ${p.color}`,
            paddingLeft: 10,
            paddingTop: 4,
            paddingBottom: 4,
          }}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold tracking-widest" style={{color: p.color, fontSize: 11, letterSpacing: 1.5}}>
                {p.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{
                  color: p.status === 'ACTIVE' ? '#00ff88'
                    : p.status === 'BOOT' ? '#ffcc00'
                    : 'rgba(0,245,255,0.4)',
                  fontSize: 9, letterSpacing: 1,
                }}>
                  ● {p.status}
                </span>
                <span className="text-xs" style={{color:'rgba(0,245,255,0.3)', fontSize:9}}>{p.ver}</span>
              </div>
            </div>
            <div className="text-xs mt-1" style={{color:'rgba(0,245,255,0.4)', fontSize:10, letterSpacing:0.5}}>
              {p.desc}
            </div>
          </div>
        ))}
      </div>

      {/* System log */}
      <div className="mt-3 pt-2" style={{borderTop:'1px solid rgba(0,245,255,0.1)'}}>
        <div className="text-xs" style={{color:'rgba(0,245,255,0.35)', fontFamily:"'JetBrains Mono', monospace", fontSize:9, letterSpacing:0.5}}>
          <div>&gt; SYSTEMS NOMINAL</div>
          <div>&gt; ALL NODES ONLINE</div>
          <div>&gt; SECURITY LEVEL: ALPHA</div>
        </div>
      </div>
    </div>
  )
}
