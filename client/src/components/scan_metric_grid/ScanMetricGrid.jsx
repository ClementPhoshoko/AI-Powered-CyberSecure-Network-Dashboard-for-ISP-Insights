import ScanMetricTile from '../scan_metric_tile/ScanMetricTile'
import { ClockIcon, FunnelIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline'
import './ScanMetricGrid.css'

const METRIC_ICONS = {
  'open-ports': LockOpenIcon,
  'closed-ports': LockClosedIcon,
  'filtered-ports': FunnelIcon,
  'scan-duration': ClockIcon,
}

function ScanMetricGrid({ metrics = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="scan_metric_grid scan_metric_grid-skeleton" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={`scan-metric-skeleton-${index}`} className="scan_metric_tile scan_metric_tile-skeleton">
            <span className="scan_metric_tile-icon security-skeleton" aria-hidden="true" />
            <div className="scan_metric_tile-content">
              <p className="scan_metric_tile-label security-skeleton"> </p>
              <p className="scan_metric_tile-value security-skeleton"> </p>
            </div>
          </article>
        ))}
      </div>
    )
  }

  return (
    <div className="scan_metric_grid">
      {metrics.map((metric) => {
        const MetricIcon = METRIC_ICONS[metric.key]

        return (
          <ScanMetricTile
            key={metric.key}
            label={metric.label}
            value={metric.value}
            unit={metric.unit}
            tone={metric.tone}
            icon={MetricIcon ? <MetricIcon /> : null}
          />
        )
      })}
    </div>
  )
}

export default ScanMetricGrid
