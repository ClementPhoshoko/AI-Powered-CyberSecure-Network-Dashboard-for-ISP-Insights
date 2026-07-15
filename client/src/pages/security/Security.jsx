import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import Scan from '../../components/scan_wheel/Scan'
import ScanOverviewCard from '../../components/scan_overview_card/ScanOverviewCard'
import ScanPhaseStepper from '../../components/scan_phase_stepper/ScanPhaseStepper'
import ScanProgressBar from '../../components/scan_progress_bar/ScanProgressBar'
import ScanMetricGrid from '../../components/scan_metric_grid/ScanMetricGrid'
import NetworkScoreBadge from '../../components/network_score_badge/NetworkScoreBadge'
import PortRiskStatusChip from '../../components/port_risk_status_chip/PortRiskStatusChip'
import Seo from '../../components/seo/Seo'
import ScanEmptyState from '../../components/scan_empty_state/ScanEmptyState'
import ScanHighlightsSection from '../../components/scan_highlights_section/ScanHighlightsSection'
import ErrorModal from '../../components/error_modal/ErrorModal'
import Loading from '../../components/loading/Loading'
import { useAuth } from '../../context/AuthContext'
import usePortRisk from '../../hooks/usePortRisk'
import InsightsPanel from './insights_tab/InsightsPanel'
import Knowledge from './knowledge_tab/Knowledge'
import heroImage from '../../assets/hero/Collaborating_in_a_high-tech_workspace.png'
import womanAvatar from '../../assets/avatars/woman_instructor_avatar.png'
import aiIcon from '../../assets/avatars/ai.png'
import notFoundAvatar from '../../assets/avatars/not_found_avatar.png'
import './Security.css'

const PHASE_PROGRESS = {
  idle: 0,
  starting: 20,
  running: 72,
  complete: 100,
}

const RISK_LEVELS = [
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Moderate' },
  { key: 'low', label: 'Low' },
  { key: 'unknown', label: 'Unknown' },
]

const RECOMMENDATION_PRIORITY_ORDER = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

function normalizeRiskLevel(riskLevel) {
  const normalized = String(riskLevel || 'unknown').toLowerCase()
  if (['critical', 'high', 'medium', 'low'].includes(normalized)) {
    return normalized
  }
  return 'unknown'
}

function Security() {
  const { t } = useTranslation()
  const tabs = [
    { id: 'scan', label: t('security.tabScan') },
    { id: 'insights', label: t('security.tabInsights') },
    { id: 'knowledge', label: t('security.tabKnowledge') },
  ]
  const proTips = [
    t('security.proTips.0'),
    t('security.proTips.1'),
    t('security.proTips.2'),
    t('security.proTips.3'),
    t('security.proTips.4'),
  ]
  const { loading: authLoading } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = tabs.some((t) => t.id === tabParam) ? tabParam : 'scan'

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab })
  }

  const [scanWheelState, setScanWheelState] = useState({
    phase: 'idle',
    activePort: null,
    isAnimating: false,
  })
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showFullScanDetails, setShowFullScanDetails] = useState(false)
  const [showBottomTopRowDetails, setShowBottomTopRowDetails] = useState(false)

  const {
    assessments,
    latestAssessment,
    groupedOpenPortsByRisk,
    knowledgeBase,
    loading: portRiskLoading,
    error: portRiskError,
    runScan,
    refetch,
  } = usePortRisk(!authLoading)

  const hasError = !portRiskLoading && portRiskError
  const scanProgress = PHASE_PROGRESS[scanWheelState.phase] ?? 0
  const isScanRefreshing = Boolean(scanWheelState.isAnimating && latestAssessment)
  const isInitialLoading = authLoading || (portRiskLoading && !latestAssessment)

  useEffect(() => {
    if (hasError) {
      setShowErrorModal(true)
    }
  }, [hasError])

  const metrics = useMemo(() => {
    if (!latestAssessment) {
      return []
    }

    return [
      {
        key: 'open-ports',
        label: t('security.metrics.openPorts'),
        value: latestAssessment.open_ports_count ?? 0,
        tone: 'risk',
      },
      {
        key: 'closed-ports',
        label: t('security.metrics.closedPorts'),
        value: latestAssessment.closed_ports_count ?? 0,
      },
      {
        key: 'filtered-ports',
        label: t('security.metrics.filteredPorts'),
        value: latestAssessment.filtered_ports_count ?? 0,
      },
      {
        key: 'scan-duration',
        label: t('security.metrics.duration'),
        value: Number(latestAssessment.scan_duration_seconds || 0).toFixed(1),
        unit: 's',
      },
    ]
  }, [latestAssessment])

  const randomTip = useMemo(() => {
    const stableIndex = (assessments?.length || 0) % proTips.length
    return proTips[stableIndex]
  }, [assessments])

  const topRecommendations = useMemo(() => {
    const recommendations = latestAssessment?.security_recommendations || []
    return [...recommendations]
      .sort((a, b) => {
        const priorityDiff =
          (RECOMMENDATION_PRIORITY_ORDER[b?.priority] || 0) -
          (RECOMMENDATION_PRIORITY_ORDER[a?.priority] || 0)

        if (priorityDiff !== 0) {
          return priorityDiff
        }

        return String(a?.title || '').localeCompare(String(b?.title || ''))
      })
      .slice(0, 5)
  }, [latestAssessment])

  const allPortRows = useMemo(() => {
    const rows = latestAssessment?.port_scan_results || []
    return [...rows].sort((a, b) => (a?.port_number || 0) - (b?.port_number || 0))
  }, [latestAssessment])

  const hasOpenRiskPorts = useMemo(() => {
    return RISK_LEVELS.some((risk) => (groupedOpenPortsByRisk?.[risk.key] || []).length > 0)
  }, [groupedOpenPortsByRisk])

  if (isInitialLoading) {
    return (
      <div className="security-page">
        <Loading
          isLoading={true}
          message={t('loading.loadingSecurity')}
          status={t('loading.securitySystem')}
          indeterminate={true}
        />
      </div>
    )
  }

  return (
    <div className="security-page">
      <Seo title={t('seo.securityTitle')} description={t('seo.securityDesc')} path="/security" />
        <div className="security-title-section">
        <h1 className="security-title-section-title">{t('security.title')}</h1>
        <div className="security-subtitle-with-avatar">
          <img src={womanAvatar} alt={t('imageAlt.securityGuide')} className="security-subtitle-avatar" />
          <div className="security-subtitle-text">
            <p className="security-title-section-subtitle">
              {t('security.subtitle')}
            </p>
            <p className="security-pro-tip-text">
              <span className="security-pro-tip-label">{t('security.proTip')}</span> {randomTip}
            </p>
          </div>
        </div>
      </div>

      <section className="security-hero">
        <img src={heroImage} alt={t('imageAlt.securityHero')} className="security-hero-image" />
      </section>

      <div className="security-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`security-tab ${activeTab === tab.id ? 'security-tab--active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="security-container">
        {activeTab === 'scan' && (
          <section className="scan-tab-panel">
            {hasError ? (
              <section className="security-error-state" aria-label="Security scan error">
                <img src={notFoundAvatar} alt={t('imageAlt.errorOccurred')} className="security-error-avatar" />
                <div className="security-error-copy">
                  <h2 className="security-error-title">{t('security.errorTitle')}</h2>
                  <p className="security-error-description">{hasError?.toString()}</p>
                </div>
                <button type="button" className="security-cta" onClick={refetch}>{t('security.tryAgain')}</button>
              </section>
            ) : (
              <ScanOverviewCard
                left={(
                  <div className="security-scan-wheel">
                    <Scan onStateChange={setScanWheelState} onRunScan={runScan} />
                  </div>
                )}
                right={(
                  <div className="security-scan-insights">
                    <h2 className="security-scan-title">{t('security.currentScanOverview')}</h2>
                    <ScanPhaseStepper phase={scanWheelState.phase} />
                    <ScanProgressBar value={scanProgress} label={t('security.wheelScanProgress')} />

                    <div className="security-stats-note">
                      <span className="security-stats-note-label">{t('security.howPortScanMeasured')}</span>
                      <span className="security-stats-note-text">
                        {t('security.portScanNoteText')}
                      </span>
                      <span className="security-stats-note-subtle">
                        {t('security.portScanNoteSubtle')}
                      </span>
                    </div>

                    <div className="security-scan-badges">
                      <NetworkScoreBadge
                        score={latestAssessment?.overall_risk_score ?? 0}
                        isLoading={isScanRefreshing}
                      />
                      <PortRiskStatusChip
                        status={latestAssessment?.security_status || 'moderate'}
                        isLoading={isScanRefreshing}
                      />
                    </div>

                    <ScanHighlightsSection>
                      {latestAssessment ? (
                        <>
                          <ScanMetricGrid metrics={metrics} isLoading={isScanRefreshing} />

                          <section className="security-ai-summary-section" aria-label="AI security summary">
                            <h3 className="security-ai-summary-title">
                              <img src={aiIcon} alt={t('imageAlt.aiIcon')} className="security-ai-summary-icon" />
                              {t('security.aiPoweredSummary')}
                            </h3>
                            {isScanRefreshing ? (
                              <p className="security-skeleton security-ai-summary-text" />
                            ) : (
                              <p className="security-ai-summary-text">
                                {latestAssessment.ai_security_summary || t('security.summaryPlaceholder')}
                              </p>
                            )}
                          </section>
                        </>
                      ) : (
                        <ScanEmptyState
                          title={t('security.noAssessmentTitle')}
                          message={t('security.noAssessmentMessage')}
                        />
                      )}
                    </ScanHighlightsSection>
                  </div>
                )}
                bottom={latestAssessment ? (
                  <div className="security-scan-bottom">
                    <section className="security-bottom-top-row-section" aria-label="Risk groups and top recommendations">
                      {isScanRefreshing ? (
                        <>
                          <div className="security-full-scan-details-head security-full-scan-details-head-skeleton" aria-hidden="true">
                            <span className="security-skeleton security-full-scan-details-head-title"> </span>
                            <span className="security-skeleton security-full-scan-details-head-action"> </span>
                          </div>
                          <div className="security-skeleton security-full-scan-details"> </div>
                        </>
                      ) : (
                        <div className="security-full-scan-details-head">
                          <h3>{t('security.riskGroupsTitle')}</h3>
                          <button
                            type="button"
                            className="security-full-scan-details-toggle"
                            aria-expanded={showBottomTopRowDetails}
                            onClick={() => setShowBottomTopRowDetails((prev) => !prev)}
                          >
                            {showBottomTopRowDetails ? t('security.hideDetails') : t('security.viewDetails')}
                          </button>
                        </div>
                      )}

                      {!isScanRefreshing && showBottomTopRowDetails ? (
                        <div className="security-bottom-top-row">
                          <section className="security-risk-groups" aria-label="Scanned results by risk level">
                            <h3 className="security-risk-groups-title">{t('security.scannedResultsByRisk')}</h3>
                            {hasOpenRiskPorts ? (
                              <div className="security-risk-groups-grid">
                                {RISK_LEVELS.map((risk) => {
                                  const ports = groupedOpenPortsByRisk?.[risk.key] || []
                                  return (
                                    <article key={risk.key} className={`security-risk-group-card security-risk-group-card-${risk.key}`.trim()}>
                                      <header className="security-risk-group-head">
                                        <span className="security-risk-group-label">{risk.label}</span>
                                        <span className="security-risk-group-count">{ports.length}</span>
                                      </header>
                                      {ports.length > 0 ? (
                                        <ul className="security-risk-group-list">
                                          {ports.slice(0, 8).map((portResult) => (
                                            <li key={portResult.id || `${risk.key}-${portResult.port_number}`}>
                                              {t('security.port')} {portResult.port_number}
                                              {portResult.service_name ? ` (${portResult.service_name})` : ''}
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="security-risk-group-empty">{t('security.noOpenPortsShort')}</p>
                                      )}
                                    </article>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="security-bottom-empty">
                                <img src={notFoundAvatar} alt={t('imageAlt.noRiskGroups')} className="security-bottom-empty-avatar" />
                                <p className="security-bottom-empty-text">{t('security.noOpenPortsFound')}</p>
                              </div>
                            )}
                          </section>

                          <section className="security-top-recommendations" aria-label="Top recommendations">
                            <h3 className="security-top-recommendations-title">{t('security.topRecommendations')}</h3>
                            {topRecommendations.length > 0 ? (
                              <ul className="security-top-recommendations-list">
                                {topRecommendations.map((recommendation) => (
                                  <li
                                    key={recommendation.id || `${recommendation.recommendation_type}-${recommendation.title}`}
                                    className={`security-top-recommendations-item security-top-recommendations-item-${String(recommendation.priority || 'low').toLowerCase()}`.trim()}
                                  >
                                    <div className="security-top-recommendations-head">
                                      <span className="security-top-recommendations-priority">{String(recommendation.priority || 'low')}</span>
                                      <strong>{recommendation.title}</strong>
                                    </div>
                                    <p>{recommendation.description}</p>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="security-bottom-empty">
                                <img src={notFoundAvatar} alt={t('imageAlt.noRecommendations')} className="security-bottom-empty-avatar" />
                                <p className="security-top-recommendations-empty">{t('security.noRecommendationsYet')}</p>
                              </div>
                            )}
                          </section>
                        </div>
                      ) : null}
                    </section>

                    <section className="security-full-scan-details" aria-label="Full scan details">
                      {isScanRefreshing ? (
                        <div className="security-full-scan-details-head security-full-scan-details-head-skeleton" aria-hidden="true">
                          <span className="security-skeleton security-full-scan-details-head-title"> </span>
                          <span className="security-skeleton security-full-scan-details-head-action"> </span>
                        </div>
                      ) : (
                        <div className="security-full-scan-details-head">
                          <h3>{t('security.fullScanDetails')}</h3>
                          <button
                            type="button"
                            className="security-full-scan-details-toggle"
                            aria-expanded={showFullScanDetails}
                            onClick={() => setShowFullScanDetails((prev) => !prev)}
                          >
                            {showFullScanDetails ? t('security.hideDetails') : t('security.viewDetails')}
                          </button>
                        </div>
                      )}
                      {isScanRefreshing ? (
                        <div className="security-skeleton security-full-scan-details-table_skeleton"> </div>
                      ) : showFullScanDetails ? (
                        <div className="security-full-scan-details-table_wrap">
                          <table className="security-full-scan-details-table">
                            <thead>
                              <tr>
                                <th>{t('security.port')}</th>
                                <th>{t('security.state')}</th>
                                <th>{t('security.service')}</th>
                                <th>{t('security.risk')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allPortRows.map((row) => (
                                <tr key={row.id || `row-${row.port_number}-${row.port_state}`}>
                                  <td>{row.port_number}</td>
                                  <td>{row.port_state || t('security.unknown')}</td>
                                  <td>{row.service_name || t('security.unknownService')}</td>
                                  <td>
                                    <span className={`security-risk-pill security-risk-pill-${normalizeRiskLevel(row.risk_level)}`.trim()}>
                                      {row.risk_level || t('security.unknown')}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </section>
                  </div>
                ) : null}
              />
            )}
          </section>
        )}

        {activeTab === 'insights' && (
          <InsightsPanel
            assessments={assessments || []}
            latestAssessment={latestAssessment}
            isLoading={portRiskLoading}
            error={hasError}
            onRetry={refetch}
          />
        )}

        {activeTab === 'knowledge' && (
          <Knowledge
            latestAssessment={latestAssessment}
            knowledgeBase={knowledgeBase || []}
            topRecommendations={topRecommendations}
            allPortRows={allPortRows}
            isLoading={portRiskLoading}
            error={hasError}
            onRetry={refetch}
          />
        )}
      </div>
      <ErrorModal
        isOpen={showErrorModal}
        message={hasError?.toString()}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  )
}

export default Security
