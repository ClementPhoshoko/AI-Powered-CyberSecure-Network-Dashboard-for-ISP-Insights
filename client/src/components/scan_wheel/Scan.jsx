import { useEffect, useMemo, useRef, useState } from 'react'
import './Scan.css'

const PORTS = [
  { port: 22, service: 'SSH' },
  { port: 21, service: 'FTP' },
  { port: 25, service: 'SMTP' },
  { port: 53, service: 'DNS' },
  { port: 80, service: 'HTTP' },
  { port: 110, service: 'POP3' },
  { port: 135, service: 'RPC' },
  { port: 139, service: 'NetBIOS' },
  { port: 143, service: 'IMAP' },
  { port: 389, service: 'LDAP' },
  { port: 443, service: 'HTTPS' },
  { port: 445, service: 'SMB' },
  { port: 3306, service: 'MySQL' },
  { port: 3389, service: 'RDP' },
  { port: 5432, service: 'PostgreSQL' },
  { port: 8080, service: 'Proxy' },
]

const VIEWBOX = 420
const CENTER = 210
const RING_RADIUS = 136
const ROTATION_SECONDS = 8

function polarToCartesian(cx, cy, radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  }
}

function Scan({ className = '' }) {
  const [scanPhase, setScanPhase] = useState('idle')
  const [activePortIndex, setActivePortIndex] = useState(0)
  const [isPortTextUpdating, setIsPortTextUpdating] = useState(false)
  const [isStatusTextUpdating, setIsStatusTextUpdating] = useState(false)
  const sweepRef = useRef(null)
  const smokeRef = useRef(null)
  const angleRef = useRef(0)
  const lastFrameTimeRef = useRef(null)
  const startTimerRef = useRef(null)
  const completeTimerRef = useRef(null)
  const portTextTimerRef = useRef(null)
  const statusTextTimerRef = useRef(null)

  const isAnimating = scanPhase === 'starting' || scanPhase === 'running'

  const clearPhaseTimers = () => {
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current)
      startTimerRef.current = null
    }

    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current)
      completeTimerRef.current = null
    }
  }

  useEffect(() => {
    if (!isAnimating) {
      lastFrameTimeRef.current = null
      return undefined
    }

    let frameId = 0

    const tick = (now) => {
      if (lastFrameTimeRef.current == null) {
        lastFrameTimeRef.current = now
      }

      const degreesPerMs = scanPhase === 'starting' ? 360 / 1200 : 360 / (ROTATION_SECONDS * 1000)
      const delta = now - lastFrameTimeRef.current
      lastFrameTimeRef.current = now
      const nextAngle = (angleRef.current + delta * degreesPerMs) % 360
      angleRef.current = nextAngle

      if (sweepRef.current) {
        sweepRef.current.style.transform = `rotate(${nextAngle}deg)`
      }

      if (smokeRef.current) {
        smokeRef.current.style.transform = `translate(-50%, -50%) rotate(${nextAngle}deg)`
      }

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [isAnimating, scanPhase])

  useEffect(() => {
    if (!isAnimating) {
      return undefined
    }

    const timer = setInterval(() => {
      const index = Math.round((angleRef.current / 360) * PORTS.length) % PORTS.length
      setActivePortIndex(index)
    }, 90)

    return () => clearInterval(timer)
  }, [isAnimating])

  useEffect(() => {
    return () => clearPhaseTimers()
  }, [])

  useEffect(() => {
    setIsPortTextUpdating(true)

    if (portTextTimerRef.current) {
      clearTimeout(portTextTimerRef.current)
    }

    portTextTimerRef.current = setTimeout(() => {
      setIsPortTextUpdating(false)
      portTextTimerRef.current = null
    }, 180)

    return () => {
      if (portTextTimerRef.current) {
        clearTimeout(portTextTimerRef.current)
      }
    }
  }, [activePortIndex])

  useEffect(() => {
    setIsStatusTextUpdating(true)

    if (statusTextTimerRef.current) {
      clearTimeout(statusTextTimerRef.current)
    }

    statusTextTimerRef.current = setTimeout(() => {
      setIsStatusTextUpdating(false)
      statusTextTimerRef.current = null
    }, 180)

    return () => {
      if (statusTextTimerRef.current) {
        clearTimeout(statusTextTimerRef.current)
      }
    }
  }, [scanPhase])

  const portMarks = useMemo(() => {
    return PORTS.map((port, index) => {
      const angle = (index / PORTS.length) * 360
      const tickInner = polarToCartesian(CENTER, CENTER, RING_RADIUS + 10, angle)
      const tickOuter = polarToCartesian(CENTER, CENTER, RING_RADIUS + 24, angle)
      const labelPoint = polarToCartesian(CENTER, CENTER, RING_RADIUS + 44, angle)

      return {
        key: `${port.port}-${index}`,
        angle,
        tickInner,
        tickOuter,
        labelPoint,
        ...port,
      }
    })
  }, [])

  const activePort = portMarks[activePortIndex] ?? null

  const handleToggleScan = () => {
    if (isAnimating) {
      clearPhaseTimers()
      setScanPhase('idle')
      return
    }

    clearPhaseTimers()
    setScanPhase('starting')

    startTimerRef.current = setTimeout(() => {
      setScanPhase('running')
    }, 900)

    completeTimerRef.current = setTimeout(() => {
      setScanPhase('complete')
    }, 900 + ROTATION_SECONDS * 1000)
  }

  return (
    <section className={`${className} scan_wheel-container`.trim()} aria-label="Port scanning radar">
      <div className={`scan_wheel-frame scan_wheel-phase_${scanPhase}`.trim()}>
        <div className="scan_wheel-grid" aria-hidden="true" />
        <div
          ref={smokeRef}
          className="scan_wheel-sweep_smoke"
          style={{ transform: `translate(-50%, -50%) rotate(${angleRef.current}deg)` }}
          aria-hidden="true"
        />

        <svg className="scan_wheel-svg" viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} role="img" aria-label="Live port scan wheel animation">
          <defs>
            <linearGradient id="scanWheelNeedleGradient" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="var(--text-inverse)" />
              <stop offset="100%" stopColor="var(--primary-dark)" />
            </linearGradient>
            <linearGradient id="scanWheelSweepGradient" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
              <stop offset="28%" stopColor="var(--accent)" stopOpacity="0.38" />
              <stop offset="68%" stopColor="var(--accent)" stopOpacity="0.78" />
              <stop offset="100%" stopColor="var(--text-inverse)" stopOpacity="0.95" />
            </linearGradient>
            <filter id="scanWheelGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="scanWheelSweepBlur" x="-20" y="-20" width="460" height="460" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          <circle cx={CENTER} cy={CENTER} r={RING_RADIUS - 38} className="scan_wheel-ring_inner" />

          <g
            ref={sweepRef}
            className="scan_wheel-sweep"
            style={{ transform: `rotate(${angleRef.current}deg)`, transformOrigin: `${CENTER}px ${CENTER}px` }}
          >
            <line
              x1={CENTER}
              y1={CENTER}
              x2={CENTER}
              y2={CENTER - 156}
              className="scan_wheel-sweep_beam"
              stroke="url(#scanWheelSweepGradient)"
              filter="url(#scanWheelSweepBlur)"
            />
            <path
              d={`M ${CENTER - 4} ${CENTER} L ${CENTER} ${CENTER - 124} L ${CENTER + 4} ${CENTER} Z`}
              className="scan_wheel-needle"
              filter="url(#scanWheelGlow)"
              fill="url(#scanWheelNeedleGradient)"
            />
            <circle cx={CENTER} cy={CENTER - 124} r="5" className="scan_wheel-needle_head" />
          </g>

          {portMarks.map((mark) => {
            const isActive = activePort && activePort.port === mark.port

            return (
              <g key={mark.key} className={isActive ? 'scan_wheel-port_mark scan_wheel-port_mark_active' : 'scan_wheel-port_mark'}>
                <line
                  x1={mark.tickInner.x}
                  y1={mark.tickInner.y}
                  x2={mark.tickOuter.x}
                  y2={mark.tickOuter.y}
                  className="scan_wheel-tick"
                />
                <text
                  x={mark.labelPoint.x}
                  y={mark.labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="scan_wheel-label"
                >
                  {mark.port}
                </text>
              </g>
            )
          })}

        </svg>

        <button
          type="button"
          className="scan_wheel-hub_outer"
          onClick={handleToggleScan}
          aria-label={isAnimating ? 'Stop port scan' : 'Start port scan'}
        >
          <span className="scan_wheel-hub_label">{isAnimating ? 'Stop' : 'Scan'}</span>
        </button>
      </div>

      <div className="scan_wheel-center_text" aria-live="polite">
        <p className={`scan_wheel-value ${isPortTextUpdating ? 'scan_wheel-text_updating' : ''}`.trim()}>{activePort?.port ?? '--'}</p>
        <p className={`scan_wheel-unit ${isStatusTextUpdating ? 'scan_wheel-text_updating' : ''}`.trim()}>
          {scanPhase === 'starting' && 'Initializing Scan'}
          {scanPhase === 'running' && 'Scanning Port'}
          {scanPhase === 'complete' && 'Scan Complete'}
          {scanPhase === 'idle' && 'Ready to Scan'}
        </p>
        <p className={`scan_wheel-service ${isPortTextUpdating ? 'scan_wheel-text_updating' : ''}`.trim()}>{activePort?.service ?? 'Initializing'}...</p>
      </div>
    </section>
  )
}

export default Scan
