import './PortRiskStatusChip.css'
import {
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  FireIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

const STATUS_LABELS = {
  excellent: 'Excellent',
  good: 'Good',
  moderate: 'Moderate',
  high: 'High Risk',
  critical: 'Critical',
}

const STATUS_ICONS = {
  excellent: CheckBadgeIcon,
  good: CheckBadgeIcon,
  moderate: ExclamationTriangleIcon,
  high: FireIcon,
  critical: FireIcon,
}

function PortRiskStatusChip({ status = 'moderate', isLoading = false }) {
  const normalized = String(status || 'moderate').toLowerCase()
  const StatusIcon = STATUS_ICONS[normalized] || InformationCircleIcon

  if (isLoading) {
    return (
      <span className="port_risk_status_chip port_risk_status_chip-loading" aria-busy="true">
        <span className="port_risk_status_chip-icon security-skeleton" aria-hidden="true" />
        <span className="port_risk_status_chip-content">
          <span className="port_risk_status_chip-label security-skeleton"> </span>
          <span className="port_risk_status_chip-value security-skeleton"> </span>
        </span>
      </span>
    )
  }

  return (
    <span className={`port_risk_status_chip port_risk_status_chip-${normalized}`.trim()}>
      <span className="port_risk_status_chip-icon" aria-hidden="true">
        <StatusIcon />
      </span>
      <span className="port_risk_status_chip-content">
        <span className="port_risk_status_chip-label">Security</span>
        <span className="port_risk_status_chip-value">{STATUS_LABELS[normalized] || status}</span>
      </span>
    </span>
  )
}

export default PortRiskStatusChip
