import { useMemo, useState } from 'react'
import Scan from '../../components/scan_wheel/Scan'
import { useAuth } from '../../context/AuthContext'
import usePortRisk from '../../hooks/usePortRisk'
import heroImage from '../../assets/hero/Modern_office_with_data_flow_dynamics.png'
import womanAvatar from '../../assets/avatars/woman_instructor_avatar.png'
import './Security.css'

const tabs = [
  { id: 'scan', label: 'Scan' },
  { id: 'insights', label: 'Insights' },
  { id: 'knowledge', label: 'Knowledge' },
]

const proTips = [
  'Run security scans on a fixed schedule, such as weekly or after major network changes, so newly exposed services are detected early and addressed before they become exploitable attack paths in production environments.',
  'Open ports are not automatically unsafe, but undocumented or unnecessary open services often represent the highest operational risk because they expand the attack surface without clear ownership, monitoring, or hardening controls.',
  'Compare each new scan result with previous baselines to quickly spot unusual exposure patterns after firewall updates, router reconfiguration, cloud migration, or policy drift that may unintentionally expose sensitive services.',
  'Treat filtered ports as a verification signal rather than a final security conclusion, then validate that firewall rules, ACLs, and segmentation policies are intentionally blocking traffic from expected network zones and threat scenarios.',
  'Map every scan finding to a responsible service owner and remediation deadline so fixes are prioritized effectively, tracked transparently, and closed with accountability instead of remaining as recurring unresolved vulnerabilities.',
]

function Security() {
  const { loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('scan')

  const {
    assessments,
    error: portRiskError,
    refetch,
  } = usePortRisk(!authLoading)

  const hasError = portRiskError
  const randomTip = useMemo(() => {
    const stableIndex = (assessments?.length || 0) % proTips.length
    return proTips[stableIndex]
  }, [assessments])

  return (
    <div className="security-page">
      <div className="security-title-section">
        <h1 className="security-title-section-title">Port Risk Security</h1>
        <div className="security-subtitle-with-avatar">
          <img src={womanAvatar} alt="Security guide" className="security-subtitle-avatar" />
          <div className="security-subtitle-text">
            <p className="security-title-section-subtitle">
              Monitor exposed services, run active scans, and keep network attack surface under control.
            </p>
            <p className="security-pro-tip-text">
              <span className="security-pro-tip-label">Pro Tip!</span> {randomTip}
            </p>
          </div>
        </div>
      </div>

      <section className="security-hero">
        <img src={heroImage} alt="Security operations hero" className="security-hero-image" />
      </section>

      <div className="security-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`security-tab ${activeTab === tab.id ? 'security-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
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
              <div className="security-error-state">
                <h2 className="security-error-title">Scan unavailable right now</h2>
                <p className="security-error-description">{hasError?.toString()}</p>
                <button className="security-cta" onClick={refetch} type="button">Try Again</button>
              </div>
            ) : (
              <div className="security-scan-wheel">
                <Scan />
              </div>
            )}
          </section>
        )}

        {activeTab !== 'scan' && (
          <section className="security-placeholder-panel">
            <h2 className="security-placeholder-title">{tabs.find((tab) => tab.id === activeTab)?.label} is coming next</h2>
            <p className="security-placeholder-description">
              This tab is intentionally reserved for the next design phase. Scan is fully active now.
            </p>
          </section>
        )}
      </div>
    </div>
  )
}

export default Security
