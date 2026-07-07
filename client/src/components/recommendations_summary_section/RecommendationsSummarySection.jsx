import PortRiskStatusChip from '../port_risk_status_chip/PortRiskStatusChip'
import ScanEmptyState from '../scan_empty_state/ScanEmptyState'
import ScanLoadingSkeleton from '../scan_loading_skeleton/ScanLoadingSkeleton'
import './RecommendationsSummarySection.css'

function formatScore(score) {
  const numeric = Number(score)
  if (!Number.isFinite(numeric)) {
    return '0'
  }

  return String(Math.round(numeric))
}

function RecommendationsSummarySection({ assessment, isLoading = false }) {
  if (isLoading && !assessment) {
    return <ScanLoadingSkeleton />
  }

  if (!assessment) {
    return (
      <ScanEmptyState
        title="No security recommendations yet"
        message="Run a port-risk scan to surface risk posture, exposed services, and remediation guidance."
      />
    )
  }

  return (
    <section className="recommendations_summary_section" aria-label="Recommendations overview">
      <div className="recommendations_summary_section-head">
        <div>
          <p className="recommendations_summary_section-eyebrow">Latest security posture</p>
          <h2 className="recommendations_summary_section-title">Recommendations Overview</h2>
        </div>
        <PortRiskStatusChip status={assessment.security_status || 'moderate'} />
      </div>

      <div className="recommendations_summary_section-metrics">
        <article className="recommendations_summary_section-metric glass-card">
          <span className="recommendations_summary_section-label">Risk Score</span>
          <strong className="recommendations_summary_section-value">{formatScore(assessment.overall_risk_score)}</strong>
        </article>

        <article className="recommendations_summary_section-metric glass-card">
          <span className="recommendations_summary_section-label">Open Ports</span>
          <strong className="recommendations_summary_section-value">{assessment.open_ports_count ?? 0}</strong>
        </article>

        <article className="recommendations_summary_section-metric glass-card">
          <span className="recommendations_summary_section-label">Recommendations</span>
          <strong className="recommendations_summary_section-value">{assessment.security_recommendations?.length ?? 0}</strong>
        </article>

        <article className="recommendations_summary_section-metric glass-card">
          <span className="recommendations_summary_section-label">Last Scan</span>
          <strong className="recommendations_summary_section-value recommendations_summary_section-value-sm">
            {assessment.created_at
              ? new Intl.DateTimeFormat(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(assessment.created_at))
              : 'Unknown'}
          </strong>
        </article>
      </div>

      <div className="recommendations_summary_section-summary glass-card">
        <p className="recommendations_summary_section-summary-label">AI Security Summary</p>
        <p className="recommendations_summary_section-summary-text">
          {assessment.ai_security_summary || 'No AI-generated summary is available for this scan yet.'}
        </p>
      </div>
    </section>
  )
}

export default RecommendationsSummarySection