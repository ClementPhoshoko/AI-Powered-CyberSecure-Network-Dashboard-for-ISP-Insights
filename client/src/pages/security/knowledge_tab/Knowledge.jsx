import { useState } from 'react'
import RecommendationsSummarySection from '../../../components/recommendations_summary_section/RecommendationsSummarySection'
import TopRecommendationsList from '../../../components/top_recommendations_list/TopRecommendationsList'
import TopOpenPortsList from '../../../components/top_open_ports_list/TopOpenPortsList'
import ScanEmptyState from '../../../components/scan_empty_state/ScanEmptyState'
import notFoundAvatar from '../../../assets/avatars/not_found_avatar.png'
import './Knowledge.css'

const RISK_ORDER = {
	critical: 4,
	high: 3,
	medium: 2,
	low: 1,
}

function getKnowledgeHighlights(entries = []) {
	return [...entries]
		.sort((a, b) => {
			const riskDiff =
				(RISK_ORDER[String(b?.risk_level || '').toLowerCase()] || 0) -
				(RISK_ORDER[String(a?.risk_level || '').toLowerCase()] || 0)

			if (riskDiff !== 0) {
				return riskDiff
			}

			if (Boolean(a?.is_common_exploit_target) !== Boolean(b?.is_common_exploit_target)) {
				return Number(Boolean(b?.is_common_exploit_target)) - Number(Boolean(a?.is_common_exploit_target))
			}

			return (a?.port_number || 0) - (b?.port_number || 0)
		})
		.slice(0, 8)
}

function Knowledge({
	latestAssessment,
	knowledgeBase = [],
	topRecommendations = [],
	allPortRows = [],
	isLoading = false,
	error = null,
	onRetry,
}) {
	const [showReference, setShowReference] = useState(false)
	const knowledgeHighlights = getKnowledgeHighlights(knowledgeBase)
	const hasReferenceEntries = knowledgeHighlights.length > 0

	if (error && !latestAssessment && !hasReferenceEntries) {
		return (
			<section className="security-error-state" aria-label="Security scan error">
				<img src={notFoundAvatar} alt="Error occurred" className="security-error-avatar" />
				<div className="security-error-copy">
					<h2 className="security-error-title">Something went wrong</h2>
					<p className="security-error-description">{error?.toString()}</p>
				</div>
				{typeof onRetry === 'function' && (
					<button type="button" className="security-cta" onClick={onRetry}>Try Again</button>
				)}
			</section>
		)
	}

	return (
		<section className="knowledge_page" aria-label="Security knowledge center">
			<div className="knowledge_page-header glass-card">
				<p className="knowledge_page-eyebrow">Knowledge Center</p>
				<h2 className="knowledge_page-title">Security recommendations and service reference</h2>
				<p className="knowledge_page-description">
					Review the latest AI guidance, inspect the most exposed services from your scan, and keep a quick-reference catalog of common ports and mitigation advice.
				</p>
			</div>

			<RecommendationsSummarySection assessment={latestAssessment} isLoading={isLoading} />

			<div className="knowledge_page-grid">
				<TopRecommendationsList
					recommendations={topRecommendations}
					isLoading={isLoading}
					error={error}
					onRetry={onRetry}
				/>

				<TopOpenPortsList
					portResults={allPortRows}
					isLoading={isLoading}
					error={error}
					onRetry={onRetry}
				/>
			</div>

			<section className="knowledge_reference glass-card" aria-label="Port knowledge base">
				<div className="knowledge_reference-head">
					<div>
						<p className="knowledge_reference-eyebrow">Reference library</p>
						<h3 className="knowledge_reference-title">High-attention service knowledge</h3>
					</div>
					<div className="knowledge_reference-actions">
						{knowledgeBase.length > 0 ? (
							<span className="knowledge_reference-count">{knowledgeBase.length} known services</span>
						) : null}
						<button
							type="button"
							className="security-full-scan-details-toggle"
							onClick={() => setShowReference((prev) => !prev)}
						>
							{showReference ? 'Hide Details' : 'View Details'}
						</button>
					</div>
				</div>

				{showReference ? (
					hasReferenceEntries ? (
						<div className="knowledge_reference-grid">
							{knowledgeHighlights.map((entry) => {
							const risk = String(entry?.risk_level || 'low').toLowerCase()
							const itemKey = entry.id || `${entry?.port_number || 'port'}-${entry?.protocol || 'tcp'}`

							return (
								<article key={itemKey} className={`knowledge_reference-card knowledge_reference-card-${risk}`.trim()}>
									<div className="knowledge_reference-card-head">
										<div>
											<p className="knowledge_reference-port">Port {entry?.port_number ?? 'Unknown'} / {String(entry?.protocol || 'tcp').toUpperCase()}</p>
											<h4 className="knowledge_reference-service">{entry?.service_name || 'Unknown service'}</h4>
										</div>
										<span className={`knowledge_reference-risk knowledge_reference-risk-${risk}`.trim()}>{risk}</span>
									</div>

									<p className="knowledge_reference-text">
										{entry?.description || 'No service description is available.'}
									</p>

									<p className="knowledge_reference-recommendation">
										<strong>Recommendation:</strong> {entry?.security_recommendation || 'No recommendation is available.'}
									</p>

									<div className="knowledge_reference-flags">
										{entry?.is_common ? <span className="knowledge_reference-flag">Common</span> : null}
										{entry?.is_unencrypted ? <span className="knowledge_reference-flag knowledge_reference-flag-warning">Unencrypted</span> : null}
										{entry?.is_common_exploit_target ? <span className="knowledge_reference-flag knowledge_reference-flag-danger">Exploit target</span> : null}
									</div>

									{entry?.exploit_notes ? (
										<p className="knowledge_reference-notes">
											<strong>Known exposure:</strong> {entry.exploit_notes}
										</p>
									) : null}
								</article>
							)
						})}
					</div>
				) : (
					<ScanEmptyState
						title="No knowledge base entries available"
						message="The port knowledge reference will appear here when the service catalog is available."
					/>
				)) : null}
			</section>
		</section>
	)
}

export default Knowledge
