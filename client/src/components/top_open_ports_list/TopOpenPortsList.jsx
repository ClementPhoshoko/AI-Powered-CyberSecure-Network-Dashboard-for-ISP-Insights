import ScanEmptyState from '../scan_empty_state/ScanEmptyState'
import ScanErrorState from '../scan_error_state/ScanErrorState'
import ScanLoadingSkeleton from '../scan_loading_skeleton/ScanLoadingSkeleton'
import './TopOpenPortsList.css'

const RISK_ORDER = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  unknown: 0,
}

function TopOpenPortsList({ portResults = [], isLoading = false, error = null, onRetry }) {
  if (isLoading && portResults.length === 0) {
    return <ScanLoadingSkeleton />
  }

  if (error && portResults.length === 0) {
    return (
      <ScanErrorState
        title="Open ports unavailable"
        message={String(error)}
        onAction={onRetry}
      />
    )
  }

  const openPorts = portResults
    .filter((entry) => String(entry?.port_state || '').toLowerCase() === 'open')
    .sort((a, b) => {
      const riskDiff =
        (RISK_ORDER[String(b?.risk_level || '').toLowerCase()] || 0) -
        (RISK_ORDER[String(a?.risk_level || '').toLowerCase()] || 0)

      if (riskDiff !== 0) {
        return riskDiff
      }

      return (a?.port_number || 0) - (b?.port_number || 0)
    })
    .slice(0, 8)

  if (openPorts.length === 0) {
    return (
      <ScanEmptyState
        title="No open ports detected"
        message="This scan did not expose any open services in the result set."
      />
    )
  }

  return (
    <section className="top_open_ports_list" aria-label="Top open ports">
      <div className="top_open_ports_list-head">
        <h3 className="top_open_ports_list-title">Top Open Ports</h3>
        <span className="top_open_ports_list-count">{openPorts.length} visible ports</span>
      </div>

      <div className="top_open_ports_list-items">
        {openPorts.map((port, index) => {
          const risk = String(port?.risk_level || 'unknown').toLowerCase()
          const itemKey = port.id || `${port?.port_number || 'port'}-${index}`

          return (
            <article key={itemKey} className={`top_open_ports_list-item top_open_ports_list-item-${risk}`.trim()}>
              <div>
                <p className="top_open_ports_list-port">Port {port?.port_number ?? 'Unknown'}</p>
                <h4 className="top_open_ports_list-service">{port?.service_name || 'Unknown service'}</h4>
              </div>

              <div className="top_open_ports_list-meta">
                <span className={`top_open_ports_list-risk top_open_ports_list-risk-${risk}`.trim()}>{risk}</span>
                <p className="top_open_ports_list-description">
                  {port?.risk_summary || port?.service_description || 'No additional service context is available for this port.'}
                </p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default TopOpenPortsList