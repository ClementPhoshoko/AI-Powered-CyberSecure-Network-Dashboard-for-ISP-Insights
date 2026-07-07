import { useEffect, useMemo, useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import './InsightsHistorySection.css'

const PAGE_SIZE = 5

function formatDate(value) {
  if (!value) {
    return 'Unknown date'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown date'
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

function normalizeStatus(status) {
  const normalized = String(status || 'moderate').toLowerCase()
  if (['excellent', 'good', 'moderate', 'high', 'critical'].includes(normalized)) {
    return normalized
  }
  return 'moderate'
}

function formatStatusLabel(status) {
  const normalized = normalizeStatus(status)
  if (normalized === 'high') return 'High Risk'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function getOpenRiskBreakdown(portScanResults = []) {
  const breakdown = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  }

  portScanResults.forEach((result) => {
    if (result?.port_state !== 'open') {
      return
    }

    const risk = String(result?.risk_level || '').toLowerCase()
    if (Object.prototype.hasOwnProperty.call(breakdown, risk)) {
      breakdown[risk] += 1
    }
  })

  return breakdown
}

function InsightsHistorySection({
  assessments = [],
  isLoading = false,
  error = null,
  selectedAssessmentId = null,
  onSelectAssessment = () => {},
}) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalItems = assessments.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageEnd = pageStart + PAGE_SIZE

  const paginatedAssessments = useMemo(() => {
    return assessments.slice(pageStart, pageEnd)
  }, [assessments, pageEnd, pageStart])

  if (isLoading && !assessments.length) {
    return (
      <section className="insights_history_section" aria-label="Recent scans loading" aria-busy="true">
        <h3 className="insights_history_section-title">Recent Scans</h3>
        <div className="insights_history_section-skeleton-list">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`history-skeleton-${index}`} className="insights_history_section-skeleton-item" />
          ))}
        </div>
      </section>
    )
  }

  if (error && !assessments.length) {
    return (
      <section className="insights_history_section" aria-label="Recent scans error state">
        <h3 className="insights_history_section-title">Recent Scans</h3>
        <p className="insights_history_section-empty">Unable to load scan history: {String(error)}</p>
      </section>
    )
  }

  if (!assessments.length) {
    return (
      <section className="insights_history_section" aria-label="Recent scans empty state">
        <h3 className="insights_history_section-title">Recent Scans</h3>
        <p className="insights_history_section-empty">No scan history yet. Run your first scan to unlock trend insights.</p>
      </section>
    )
  }

  return (
    <section className="insights_history_section" aria-label="Recent scan trend snapshots">
      <h3 className="insights_history_section-title">Recent Scans</h3>
      <ul className="insights_history_section-list">
        {paginatedAssessments.map((entry, index) => {
          const entryKey = entry.id || `${entry.created_at || 'scan'}-${index}`
          const previewId = `insights-history-preview-${entryKey}`
          const isActive = selectedAssessmentId === entry.id
          const normalizedStatus = normalizeStatus(entry.security_status)
          const openRiskBreakdown = getOpenRiskBreakdown(entry.port_scan_results || [])
          const totalPortsScanned =
            (entry.open_ports_count ?? 0) +
            (entry.closed_ports_count ?? 0) +
            (entry.filtered_ports_count ?? 0)
          const recommendationCount = (entry.security_recommendations || []).length

          return (
          <li key={entryKey}>
            <button
              type="button"
              className={`insights_history_section-item ${isActive ? 'insights_history_section-item-active' : ''}`.trim()}
              onClick={() => onSelectAssessment(isActive ? null : entry.id)}
              aria-pressed={isActive}
              aria-expanded={isActive}
              aria-controls={previewId}
            >
              <span className="insights_history_section-date">{formatDate(entry.created_at)}</span>
              <span className="insights_history_section-metric">Open: {entry.open_ports_count ?? 0}</span>
              <span className="insights_history_section-metric">Filtered: {entry.filtered_ports_count ?? 0}</span>
              <span className="insights_history_section-metric">Score: {Math.round(Number(entry.overall_risk_score) || 0)}</span>
              <span className="insights_history_section-chevron" aria-hidden="true">
                {isActive ? <ChevronDownIcon /> : <ChevronRightIcon />}
              </span>
            </button>

            {isActive ? (
              <section id={previewId} className="insights_history_section-preview" aria-label="Selected scan overall results">
                <h4 className="insights_history_section-preview-title">Overall Results</h4>
                <div className="insights_history_section-preview-grid">
                  <article className="insights_history_section-preview-item">
                    <span className="insights_history_section-preview-label">Security Status</span>
                    <strong className={`insights_history_section-preview-value insights_history_section-preview-value-${normalizedStatus}`.trim()}>
                      {formatStatusLabel(entry.security_status)}
                    </strong>
                  </article>

                  <article className="insights_history_section-preview-item">
                    <span className="insights_history_section-preview-label">Overall Score</span>
                    <strong className="insights_history_section-preview-value">{Math.round(Number(entry.overall_risk_score) || 0)}</strong>
                  </article>

                  <article className="insights_history_section-preview-item">
                    <span className="insights_history_section-preview-label">Duration</span>
                    <strong className="insights_history_section-preview-value">{Number(entry.scan_duration_seconds || 0).toFixed(1)}s</strong>
                  </article>

                  <article className="insights_history_section-preview-item">
                    <span className="insights_history_section-preview-label">Ports</span>
                    <strong className="insights_history_section-preview-value">
                      {entry.open_ports_count ?? 0} open, {entry.closed_ports_count ?? 0} closed, {entry.filtered_ports_count ?? 0} filtered
                    </strong>
                  </article>

                  <article className="insights_history_section-preview-item">
                    <span className="insights_history_section-preview-label">Total Ports Scanned</span>
                    <strong className="insights_history_section-preview-value">{totalPortsScanned}</strong>
                  </article>

                  <article className="insights_history_section-preview-item">
                    <span className="insights_history_section-preview-label">Recommendations</span>
                    <strong className="insights_history_section-preview-value">{recommendationCount}</strong>
                  </article>

                  <article className="insights_history_section-preview-item">
                    <span className="insights_history_section-preview-label">Open Risk Breakdown</span>
                    <strong className="insights_history_section-preview-value">
                      C:{openRiskBreakdown.critical} H:{openRiskBreakdown.high} M:{openRiskBreakdown.medium} L:{openRiskBreakdown.low}
                    </strong>
                  </article>
                </div>

                <p className="insights_history_section-preview-summary">
                  {entry.ai_security_summary || 'No AI summary was generated for this scan yet.'}
                </p>
              </section>
            ) : null}
          </li>
          )
        })}
      </ul>

      <div className="insights_history_section-pagination-controls" aria-label="Recent scans pagination controls">
        <button
          type="button"
          className="insights_history_section-pagination-btn"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Previous
        </button>

        <span className="insights_history_section-pagination-info">
          Showing {totalItems === 0 ? 0 : pageStart + 1}-{Math.min(pageEnd, totalItems)} of {totalItems}
        </span>

        <button
          type="button"
          className="insights_history_section-pagination-btn"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage >= totalPages}
        >
          Next
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  )
}

export default InsightsHistorySection
