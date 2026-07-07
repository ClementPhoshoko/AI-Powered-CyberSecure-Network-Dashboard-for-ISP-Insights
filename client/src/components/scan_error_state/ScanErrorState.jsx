import './ScanErrorState.css'

function ScanErrorState({
  title = 'Unable to load scan results',
  message = 'Try again in a moment.',
  actionLabel = 'Try Again',
  onAction,
}) {
  return (
    <section className="scan_error_state" aria-label="Scan error state">
      <div className="scan_error_state-copy">
        <h3 className="scan_error_state-title">{title}</h3>
        <p className="scan_error_state-text">{message}</p>
      </div>
      {typeof onAction === 'function' ? (
        <button type="button" className="scan_error_state-action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  )
}

export default ScanErrorState