import {
  CalendarDaysIcon,
  ChartBarSquareIcon,
  ClockIcon,
  FunnelIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline'
import './InsightsMetricsSection.css'

const METRIC_ICONS = {
  'total-scans': CalendarDaysIcon,
  'open-ports': ShieldExclamationIcon,
  'closed-ports': ChartBarSquareIcon,
  'filtered-ports': FunnelIcon,
  'scan-duration': ClockIcon,
  'avg-open-ports': ShieldExclamationIcon,
  'avg-filtered-ports': FunnelIcon,
  'avg-duration': ClockIcon,
  'score-delta': ChartBarSquareIcon,
}

function InsightsMetricsSection({ metrics = [], isLoading = false }) {
  if (isLoading) {
    return (
      <section className="insights_metrics_section" aria-busy="true" aria-label="Insights metrics loading">
        {Array.from({ length: 5 }).map((_, index) => (
          <article key={`insights-metric-skeleton-${index}`} className="insights_metrics_section-tile insights_metrics_section-tile-skeleton">
            <span className="insights_metrics_section-icon insights_metrics_section-skeleton" aria-hidden="true" />
            <div className="insights_metrics_section-content">
              <p className="insights_metrics_section-label insights_metrics_section-skeleton"> </p>
              <p className="insights_metrics_section-value insights_metrics_section-skeleton"> </p>
            </div>
          </article>
        ))}
      </section>
    )
  }

  return (
    <section className="insights_metrics_section" aria-label="Insights metrics">
      {metrics.map((metric) => {
        const MetricIcon = METRIC_ICONS[metric.key]

        return (
          <article key={metric.key} className={`insights_metrics_section-tile insights_metrics_section-tile-${metric.tone || 'default'}`.trim()}>
            <span className="insights_metrics_section-icon" aria-hidden="true">
              {MetricIcon ? <MetricIcon /> : '◉'}
            </span>
            <div className="insights_metrics_section-content">
              <p className="insights_metrics_section-label">{metric.label}</p>
              <p className="insights_metrics_section-value">
                {metric.value}
                {metric.unit ? <span className="insights_metrics_section-unit"> {metric.unit}</span> : null}
              </p>
            </div>
          </article>
        )
      })}
    </section>
  )
}

export default InsightsMetricsSection
