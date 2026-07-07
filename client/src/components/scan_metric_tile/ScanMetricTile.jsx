import './ScanMetricTile.css'

function ScanMetricTile({ label, value, unit = '', tone = 'default', icon = null }) {
  return (
    <article className={`scan_metric_tile scan_metric_tile-${tone}`.trim()}>
      <span className="scan_metric_tile-icon" aria-hidden="true">{icon || '◉'}</span>
      <div className="scan_metric_tile-content">
        <p className="scan_metric_tile-label">{label}</p>
        <p className="scan_metric_tile-value">
          {value}
          {unit ? <span className="scan_metric_tile-unit"> {unit}</span> : null}
        </p>
      </div>
    </article>
  )
}

export default ScanMetricTile
