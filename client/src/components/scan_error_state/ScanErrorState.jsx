import './ScanErrorState.css'

function ScanErrorState({ title = 'Scan unavailable right now', message = 'Please try again in a moment.', onRetry }) {
  return (
    <div className="scan_error_state">
      <h3 className="scan_error_state-title">{title}</h3>
      <p className="scan_error_state-text">{message}</p>
      {onRetry ? (
        <button type="button" className="scan_error_state-button" onClick={onRetry}>
          Try Again
        </button>
      ) : null}
    </div>
  )
}

export default ScanErrorState
