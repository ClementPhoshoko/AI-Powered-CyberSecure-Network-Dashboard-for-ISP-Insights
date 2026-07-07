import './ScanEmptyState.css'

function ScanEmptyState({ title = 'No scan data yet', message = 'Start your first scan to populate this panel.' }) {
  return (
    <div className="scan_empty_state">
      <h3 className="scan_empty_state-title">{title}</h3>
      <p className="scan_empty_state-text">{message}</p>
    </div>
  )
}

export default ScanEmptyState
