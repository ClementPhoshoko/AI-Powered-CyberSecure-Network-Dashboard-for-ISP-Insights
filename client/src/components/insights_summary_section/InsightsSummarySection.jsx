import {
  CheckBadgeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  FireIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import './InsightsSummarySection.css'

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

function getScoreTone(score) {
  if (score >= 80) return 'good'
  if (score >= 55) return 'medium'
  return 'low'
}

function InsightsSummarySection({ score = 0, status = 'moderate', summary = '', isLoading = false }) {
  const normalizedScore = Math.max(0, Math.min(100, Number(score) || 0))
  const scoreTone = getScoreTone(normalizedScore)
  const normalizedStatus = String(status || 'moderate').toLowerCase()
  const StatusIcon = STATUS_ICONS[normalizedStatus] || InformationCircleIcon

  return (
    <section className="insights_summary_section" aria-label="Insights summary">
      <div className="insights_summary_section-badges">
        <article className={`insights_summary_section-badge insights_summary_section-badge-score insights_summary_section-badge-${scoreTone}`.trim()}>
          <span className="insights_summary_section-icon" aria-hidden="true">
            <ChartBarIcon />
          </span>
          <span className="insights_summary_section-content">
            <span className="insights_summary_section-label">Latest Network Score</span>
            {isLoading ? (
              <strong className="insights_summary_section-value insights_summary_section-skeleton"> </strong>
            ) : (
              <strong className="insights_summary_section-value">{Math.round(normalizedScore)}</strong>
            )}
          </span>
        </article>

        <article className={`insights_summary_section-badge insights_summary_section-badge-status insights_summary_section-status-${normalizedStatus}`.trim()}>
          <span className="insights_summary_section-icon" aria-hidden="true">
            <StatusIcon />
          </span>
          <span className="insights_summary_section-content">
            <span className="insights_summary_section-label">Latest Security</span>
            {isLoading ? (
              <strong className="insights_summary_section-value insights_summary_section-skeleton"> </strong>
            ) : (
              <strong className="insights_summary_section-value">{STATUS_LABELS[normalizedStatus] || status}</strong>
            )}
          </span>
        </article>
      </div>

      <article className="insights_summary_section-ai">
        <h3 className="insights_summary_section-ai-title">AI Trend Summary</h3>
        {isLoading ? (
          <p className="insights_summary_section-ai-text insights_summary_section-skeleton insights_summary_section-skeleton-text"> </p>
        ) : (
          <p className="insights_summary_section-ai-text">
            {summary || 'Run at least one full scan to generate an AI narrative of your security trends.'}
          </p>
        )}
      </article>
    </section>
  )
}

export default InsightsSummarySection
