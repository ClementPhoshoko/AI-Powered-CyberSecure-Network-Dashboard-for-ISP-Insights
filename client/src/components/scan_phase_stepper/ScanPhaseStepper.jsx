import './ScanPhaseStepper.css'

const PHASE_ORDER = ['idle', 'starting', 'running', 'complete']

const PHASE_LABELS = {
  idle: 'Ready',
  starting: 'Init',
  running: 'Scanning',
  complete: 'Complete',
}

function ScanPhaseStepper({ phase = 'idle' }) {
  const activeIndex = PHASE_ORDER.indexOf(phase)

  return (
    <div className="scan_phase_stepper" aria-label="Scan phase progress">
      {PHASE_ORDER.map((item, index) => {
        const isActive = index <= activeIndex
        return (
          <div key={item} className="scan_phase_stepper-item">
            <span className={`scan_phase_stepper-dot ${isActive ? 'scan_phase_stepper-dot_active' : ''}`.trim()} />
            <span className={`scan_phase_stepper-label ${phase === item ? 'scan_phase_stepper-label_current' : ''}`.trim()}>
              {PHASE_LABELS[item]}
            </span>
            {index < PHASE_ORDER.length - 1 && (
              <span className={`scan_phase_stepper-line ${index < activeIndex ? 'scan_phase_stepper-line_active' : ''}`.trim()} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ScanPhaseStepper
