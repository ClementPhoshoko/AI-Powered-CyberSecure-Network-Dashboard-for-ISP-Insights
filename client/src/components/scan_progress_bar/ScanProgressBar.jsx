import './ScanProgressBar.css'

function ScanProgressBar({ value = 0, label = 'Progress' }) {
  const normalized = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className="scan_progress" aria-label={label}>
      <div className="scan_progress-header">
        <span>{label}</span>
        <span>{Math.round(normalized)}%</span>
      </div>
      <div className="scan_progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(normalized)}>
        <div className="scan_progress-fill" style={{ width: `${normalized}%` }} />
      </div>
    </div>
  )
}

export default ScanProgressBar
