import ScanEmptyState from '../scan_empty_state/ScanEmptyState'
import ScanErrorState from '../scan_error_state/ScanErrorState'
import ScanLoadingSkeleton from '../scan_loading_skeleton/ScanLoadingSkeleton'
import './TopRecommendationsList.css'

const PRIORITY_ORDER = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

function TopRecommendationsList({ recommendations = [], isLoading = false, error = null, onRetry }) {
  if (isLoading && recommendations.length === 0) {
    return <ScanLoadingSkeleton />
  }

  if (error && recommendations.length === 0) {
    return (
      <ScanErrorState
        title="Recommendations unavailable"
        message={String(error)}
        onAction={onRetry}
      />
    )
  }

  if (recommendations.length === 0) {
    return (
      <ScanEmptyState
        title="No recommendations generated"
        message="When a scan detects exposure patterns, targeted remediation guidance will appear here."
      />
    )
  }

  const sortedRecommendations = [...recommendations]
    .sort((a, b) => {
      const priorityDiff =
        (PRIORITY_ORDER[String(b?.priority || '').toLowerCase()] || 0) -
        (PRIORITY_ORDER[String(a?.priority || '').toLowerCase()] || 0)

      if (priorityDiff !== 0) {
        return priorityDiff
      }

      return String(a?.title || '').localeCompare(String(b?.title || ''))
    })
    .slice(0, 6)

  return (
    <section className="top_recommendations_list" aria-label="Top recommendations">
      <div className="top_recommendations_list-head">
        <h3 className="top_recommendations_list-title">Top Recommendations</h3>
        <span className="top_recommendations_list-count">{sortedRecommendations.length} actions</span>
      </div>

      <ul className="top_recommendations_list-items">
        {sortedRecommendations.map((recommendation, index) => {
          const priority = String(recommendation?.priority || 'low').toLowerCase()
          const itemKey = recommendation.id || `${recommendation?.recommendation_type || 'recommendation'}-${recommendation?.title || index}`

          return (
            <li key={itemKey} className={`top_recommendations_list-item top_recommendations_list-item-${priority}`.trim()}>
              <div className="top_recommendations_list-item-head">
                <span className="top_recommendations_list-priority">{priority}</span>
                <h4 className="top_recommendations_list-item-title">{recommendation?.title || 'Untitled recommendation'}</h4>
              </div>
              <p className="top_recommendations_list-item-text">
                {recommendation?.description || 'No additional description is available for this recommendation.'}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default TopRecommendationsList