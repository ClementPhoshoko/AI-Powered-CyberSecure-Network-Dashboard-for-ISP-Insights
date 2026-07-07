import './NetworkScoreBadge.css'
import { ChartBarIcon } from '@heroicons/react/24/outline'

function getScoreTone(score) {
  if (score >= 80) return 'good'
  if (score >= 55) return 'medium'
  return 'low'
}

function NetworkScoreBadge({ score = 0, isLoading = false }) {
  const normalized = Math.max(0, Math.min(100, Number(score) || 0))
  const tone = getScoreTone(normalized)

  if (isLoading) {
    return (
      <div className="network_score_badge network_score_badge-loading" aria-busy="true">
        <span className="network_score_badge-icon security-skeleton" aria-hidden="true" />
        <span className="network_score_badge-content">
          <span className="network_score_badge-label security-skeleton"> </span>
          <strong className="network_score_badge-value security-skeleton"> </strong>
        </span>
      </div>
    )
  }

  return (
    <div className={`network_score_badge network_score_badge-${tone}`.trim()}>
      <span className="network_score_badge-icon" aria-hidden="true">
        <ChartBarIcon />
      </span>
      <span className="network_score_badge-content">
        <span className="network_score_badge-label">Network Score</span>
        <strong className="network_score_badge-value">{Math.round(normalized)}</strong>
      </span>
    </div>
  )
}

export default NetworkScoreBadge
