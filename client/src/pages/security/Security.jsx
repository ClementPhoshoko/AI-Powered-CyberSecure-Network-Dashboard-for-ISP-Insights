import React, { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ErrorModal from '../../components/error_modal/ErrorModal'
import { useAuth } from '../../context/AuthContext'
import usePortRisk from '../../hooks/usePortRisk'
import PortRiskAssessmentCard from '../../components/security/PortRiskAssessmentCard'
import './Security.css'

const portsToDisplay = [
  { number: 22, name: 'SSH', angle: 270 },
  { number: 21, name: 'FTP', angle: 247.5 },
  { number: 25, name: 'SMTP', angle: 225 },
  { number: 53, name: 'DNS', angle: 202.5 },
  { number: 80, name: 'HTTP', angle: 180 },
  { number: 110, name: 'POP3', angle: 157.5 },
  { number: 135, name: 'RPC', angle: 135 },
  { number: 139, name: 'NetBIOS', angle: 112.5 },
  { number: 143, name: 'IMAP', angle: 90 },
  { number: 389, name: 'LDAP', angle: 67.5 },
  { number: 443, name: 'HTTPS', angle: 45 },
  { number: 445, name: 'SMB', angle: 22.5 },
  { number: 3306, name: 'MySQL', angle: 0 },
  { number: 3389, name: 'RDP', angle: 337.5 },
  { number: 5432, name: 'PostgreSQL', angle: 315 },
  { number: 8080, name: 'HTTP Proxy', angle: 292.5 },
]

const possibleStatuses = ['Scanning...', 'Open', 'Closed', 'Filtered', 'Secure']
const statusColors = {
  'Scanning...': 'var(--primary)',
  'Open': '#EF4444',
  'Closed': '#10B981',
  'Filtered': '#F59E0B',
  'Secure': '#10B981',
}

function AnimatedCounter({ value, duration = 1000 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime
    let animationFrameId

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * value))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [value, duration])

  return <span>{count}</span>
}

function Security() {
  const { loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('scan')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [scanError, setScanError] = useState(null)
  const [activePort, setActivePort] = useState(null)
  const [centerStatus, setCenterStatus] = useState('')
  const [packets, setPackets] = useState([])
  const [litPorts, setLitPorts] = useState(new Map())
  const scanStartTime = useRef(null)
  const packetIdCounter = useRef(0)
  const [scanComplete, setScanComplete] = useState(false)

  const {
    assessments,
    currentAssessment,
    knowledgeBase,
    loading: portRiskLoading,
    error: portRiskError,
    refetch,
    runStandaloneAssessment,
    fetchKnowledgeBase
  } = usePortRisk(!authLoading)

  useEffect(() => {
    if (!portRiskLoading && (currentAssessment || assessments?.[0])) {
      setScanComplete(true)
    }
  }, [portRiskLoading, currentAssessment, assessments])

  useEffect(() => {
    if (portRiskLoading) {
      setScanComplete(false)
    }
  }, [portRiskLoading])

  useEffect(() => {
    let animationFrameId
    let lastPortTime = 0
    const timeouts = []

    const animate = (timestamp) => {
      if (!portRiskLoading) {
        setActivePort(null)
        setCenterStatus('')
        setLitPorts(new Map())
        setPackets([])
        return
      }

      if (!scanStartTime.current) {
        scanStartTime.current = timestamp
      }

      const elapsed = timestamp - scanStartTime.current
      
      if (elapsed - lastPortTime > 600 + Math.random() * 1000) {
        lastPortTime = elapsed
        const randomPort = portsToDisplay[Math.floor(Math.random() * portsToDisplay.length)]
        setActivePort(randomPort)
        
        const newPacket = {
          id: packetIdCounter.current++,
          portAngle: randomPort.angle,
          createdAt: timestamp,
          status: possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)]
        }
        setPackets(prev => [...prev, newPacket])
        
        setCenterStatus(newPacket.status)
        
        setLitPorts(prev => {
          const newMap = new Map(prev)
          newMap.set(randomPort.number, {
            lit: true,
            status: newPacket.status,
            litAt: timestamp
          })
          return newMap
        })
        
        const t1 = setTimeout(() => {
          setLitPorts(prev => {
            const newMap = new Map(prev)
            if (newMap.has(randomPort.number)) {
              const current = newMap.get(randomPort.number)
              newMap.set(randomPort.number, { ...current, lit: false })
            }
            return newMap
          })
        }, 1500 + Math.random() * 1000)
        timeouts.push(t1)
        
        const t2 = setTimeout(() => {
          setCenterStatus('')
        }, 1200 + Math.random() * 800)
        timeouts.push(t2)
        
        const t3 = setTimeout(() => {
          setPackets(prev => prev.filter(p => p.id !== newPacket.id))
        }, 2000)
        timeouts.push(t3)
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    if (portRiskLoading) {
      animationFrameId = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      timeouts.forEach(t => clearTimeout(t))
      scanStartTime.current = null
    }
  }, [portRiskLoading])

  const handleRunScan = async () => {
    try {
      setScanError(null)
      await runStandaloneAssessment()
    } catch (error) {
      console.error('Failed to run scan:', error)
      setScanError(error?.message || 'Failed to run port scan')
    }
  }

  const handleCloseErrorModal = () => {
    setShowErrorModal(false)
    setScanError(null)
  }

  const isLoading = authLoading || portRiskLoading
  const hasError = portRiskError || scanError
  const latestAssessment = currentAssessment || assessments?.[0]

  const scanStats = useMemo(() => {
    if (!latestAssessment?.port_scan_results) {
      return { open: 0, closed: 0, filtered: 0, scanned: 0 }
    }
    const results = latestAssessment.port_scan_results
    return {
      open: results.filter(r => r.port_state === 'open').length,
      closed: results.filter(r => r.port_state === 'closed').length,
      filtered: results.filter(r => r.port_state === 'filtered').length,
      scanned: results.length
    }
  }, [latestAssessment])

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return '#10B981'
      case 'good': return '#3B82F6'
      case 'moderate': return '#F59E0B'
      case 'high': return '#EF4444'
      case 'critical': return '#DC2626'
      default: return '#6B7280'
    }
  }

  const getPortStateColor = (state) => {
    switch (state) {
      case 'open': return '#EF4444'
      case 'closed': return '#10B981'
      case 'filtered': return '#F59E0B'
      default: return '#6B7280'
    }
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'critical': return '#DC2626'
      case 'high': return '#EF4444'
      case 'medium': return '#F59E0B'
      case 'low': return '#10B981'
      default: return '#6B7280'
    }
  }

  return (
    <div className="security-page-enterprise">
      <ErrorModal 
        isOpen={showErrorModal} 
        onClose={handleCloseErrorModal} 
        message={hasError?.toString() || 'An error occurred'} 
      />

      <div className="enterprise-header">
        <div className="enterprise-header-left">
          <h1 className="enterprise-title">Security Operations Center</h1>
          <p className="enterprise-subtitle">Network Port Scan & Risk Assessment</p>
        </div>
        <div className="enterprise-tabs">
          <button 
            className={`enterprise-tab ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            Scan Dashboard
          </button>
          <button 
            className={`enterprise-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Scan History
          </button>
          <button 
            className={`enterprise-tab ${activeTab === 'knowledge' ? 'active' : ''}`}
            onClick={() => setActiveTab('knowledge')}
          >
            Knowledge Base
          </button>
        </div>
      </div>

      <div className="enterprise-container">
        {activeTab === 'scan' && (
          <>
            {hasError ? (
              <div className="error-state">
                <div className="error-state-copy">
                  <p className="error-state-title">Something went wrong</p>
                  <p className="error-state-description">{hasError?.toString()}</p>
                </div>
                <button onClick={refetch} className="link-btn">Try Again</button>
              </div>
            ) : (
              <div className="enterprise-layout">
                <div className="enterprise-left-column">
                  <div className={`radar-container-enterprise ${isLoading ? 'scanning' : ''} ${scanComplete ? 'scan-complete' : ''}`}>
                    <div className="radar-ring ring-1"></div>
                    <div className="radar-ring ring-2"></div>
                    <div className="radar-ring ring-3"></div>
                    <div className="radar-ring ring-4"></div>
                    <div className="scanner-beam"></div>
                    <div className="radial-pulses">
                      <div className="pulse"></div>
                      <div className="pulse"></div>
                      <div className="pulse"></div>
                    </div>
                    <div className="particles">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="particle" style={{ '--i': i }}></div>
                      ))}
                    </div>
                    <div className="nodes">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="node" style={{ '--i': i }}></div>
                      ))}
                    </div>
                    <div className="ports-container">
                      {portsToDisplay.map((port) => {
                        const litPortData = litPorts.get(port.number)
                        const isLit = litPortData?.lit
                        const status = litPortData?.status
                        
                        return (
                          <div
                            key={port.number}
                            className={`radar-port ${isLit ? 'lit' : ''}`}
                            style={{
                              '--port-angle': `${port.angle}deg`,
                              '--status-color': status ? statusColors[status] : 'var(--text-muted)'
                            }}
                          >
                            <span className="radar-port-number">{port.number}</span>
                            <span className="radar-port-name">{port.name}</span>
                            {isLit && status && (
                              <span className="radar-port-status">{status}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="packets-container">
                      {packets.map((packet) => (
                        <div
                          key={packet.id}
                          className="radar-packet"
                          style={{
                            '--packet-angle': `${packet.portAngle}deg`,
                            '--packet-color': statusColors[packet.status]
                          }}
                        />
                      ))}
                    </div>
                    <button 
                      className="radar-button-enterprise"
                      onClick={handleRunScan}
                      disabled={isLoading}
                    >
                      <div className="radar-button-inner-enterprise">
                        {!isLoading && (
                          <div className="radar-button-static-enterprise">
                            <svg className="begin-test-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 5v14l11-7z" fill="currentColor" />
                            </svg>
                            <span className="begin-scan-text">Begin Scan</span>
                          </div>
                        )}
                        {isLoading && (
                          <div className="radar-button-statuses-enterprise">
                            <svg className="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="9" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeDasharray="56" strokeDashoffset="14"></circle>
                            </svg>
                            <span 
                              className="radar-center-status"
                              style={{ 
                                color: centerStatus ? statusColors[centerStatus] : 'transparent'
                              }}
                            >
                              {centerStatus || ' '}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>

                  <div className="metadata-panel">
                    <div className="metadata-row">
                      <span className="metadata-label">Target</span>
                      <span className="metadata-value">localhost</span>
                    </div>
                    <div className="metadata-row">
                      <span className="metadata-label">Protocol</span>
                      <span className="metadata-value">TCP</span>
                    </div>
                    <div className="metadata-row">
                      <span className="metadata-label">Ports</span>
                      <span className="metadata-value">{scanStats.scanned} / {portsToDisplay.length}</span>
                    </div>
                    <div className="metadata-row">
                      <span className="metadata-label">Duration</span>
                      <span className="metadata-value">00:00:42</span>
                    </div>
                    <div className="metadata-row">
                      <span className="metadata-label">Last Scan</span>
                      <span className="metadata-value">{latestAssessment ? 'Just now' : 'Never'}</span>
                    </div>
                  </div>
                </div>

                <div className="enterprise-right-column">
                  <AnimatePresence>
                    {latestAssessment && (
                      <motion.div 
                        className="security-overview-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="security-score-main">
                          <motion.div 
                            className="security-score-number"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            style={{ color: getStatusColor(latestAssessment.security_status) }}
                          >
                            {latestAssessment.overall_risk_score}
                          </motion.div>
                          <motion.div 
                            className="security-status-badge"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            style={{ 
                              backgroundColor: `${getStatusColor(latestAssessment.security_status)}15`,
                              color: getStatusColor(latestAssessment.security_status)
                            }}
                          >
                            {latestAssessment.security_status}
                          </motion.div>
                        </div>
                        <div className="security-progress-bar">
                          <div 
                            className="security-progress-fill"
                            style={{ 
                              width: `${latestAssessment.overall_risk_score}%`,
                              backgroundColor: getStatusColor(latestAssessment.security_status)
                            }}
                          />
                        </div>
                        <div className="security-metrics-small">
                          <div className="security-metric-small">
                            <span className="security-metric-small-label">Overall Risk</span>
                            <span className="security-metric-small-value">{latestAssessment.security_status}</span>
                          </div>
                          <div className="security-metric-small">
                            <span className="security-metric-small-label">Firewall</span>
                            <span className="security-metric-small-value">Active</span>
                          </div>
                          <div className="security-metric-small">
                            <span className="security-metric-small-label">Exposure</span>
                            <span className="security-metric-small-value">{scanStats.open > 0 ? 'High' : 'Low'}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="stat-cards-grid">
                    <motion.div 
                      className="stat-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <div className="stat-icon" style={{ color: '#EF4444' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{scanComplete ? <AnimatedCounter value={scanStats.open} /> : '0'}</div>
                        <div className="stat-label">Open</div>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="stat-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 }}
                    >
                      <div className="stat-icon" style={{ color: '#10B981' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{scanComplete ? <AnimatedCounter value={scanStats.closed} /> : '0'}</div>
                        <div className="stat-label">Closed</div>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="stat-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      <div className="stat-icon" style={{ color: '#F59E0B' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <line x1="9" y1="9" x2="15" y2="9" />
                          <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{scanComplete ? <AnimatedCounter value={scanStats.filtered} /> : '0'}</div>
                        <div className="stat-label">Filtered</div>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="stat-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.45 }}
                    >
                      <div className="stat-icon" style={{ color: '#3B82F6' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{scanComplete ? <AnimatedCounter value={scanStats.scanned} /> : '0'}</div>
                        <div className="stat-label">Scanned</div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            )}

            {latestAssessment && (
              <>
                <motion.div 
                  className="ai-summary-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <div className="ai-summary-header">
                    <div className="ai-title-group">
                      <h3 className="ai-summary-title">AI Security Analysis</h3>
                      <span className="ai-powered-badge">Powered by Gemini</span>
                    </div>
                    <svg className="ai-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <p className="ai-summary-text">{latestAssessment.ai_security_summary}</p>
                </motion.div>

                <motion.div 
                  className="port-table-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <div className="port-table-header">
                    <h3 className="port-table-title">Port Scan Results</h3>
                  </div>
                  <div className="port-table-container">
                    <table className="port-table">
                      <thead>
                        <tr>
                          <th>Port</th>
                          <th>Service</th>
                          <th>Status</th>
                          <th>Risk</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {latestAssessment.port_scan_results?.sort((a, b) => a.port_number - b.port_number).map((port, index) => (
                          <motion.tr 
                            key={port.port_number}
                            className="port-table-row"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.7 + index * 0.03 }}
                          >
                            <td className="port-number-cell">{port.port_number}</td>
                            <td className="port-service-cell">{port.service_name || 'Unknown'}</td>
                            <td>
                              <span 
                                className="port-status-badge"
                                style={{ 
                                  backgroundColor: `${getPortStateColor(port.port_state)}15`,
                                  color: getPortStateColor(port.port_state)
                                }}
                              >
                                {port.port_state}
                              </span>
                            </td>
                            <td>
                              {port.risk_level && (
                                <span 
                                  className="port-risk-pill"
                                  style={{ 
                                    backgroundColor: `${getRiskColor(port.risk_level)}15`,
                                    color: getRiskColor(port.risk_level)
                                  }}
                                >
                                  {port.risk_level}
                                </span>
                              )}
                            </td>
                            <td className="port-desc-cell">
                              {port.port_state === 'open' && '⚠️ This port is open and exposed'}
                              {port.port_state === 'closed' && '✓ This port is closed and secure'}
                              {port.port_state === 'filtered' && '◐ This port is filtered by a firewall'}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                <div className="bottom-section">
                  <motion.div 
                    className="recommendations-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
                    <h3 className="recommendations-title">Security Checklist</h3>
                    <div className="recommendations-list">
                      <div className="recommendation-item checked">
                        <div className="recommendation-check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="recommendation-text">Firewall detected and active</span>
                      </div>
                      <div className="recommendation-item checked">
                        <div className="recommendation-check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="recommendation-text">No critical exposed services</span>
                      </div>
                      <div className="recommendation-item checked">
                        <div className="recommendation-check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="recommendation-text">Network exposure appears minimal</span>
                      </div>
                      <div className="recommendation-item">
                        <div className="recommendation-check"></div>
                        <span className="recommendation-text">Review firewall rules regularly</span>
                      </div>
                      <div className="recommendation-item">
                        <div className="recommendation-check"></div>
                        <span className="recommendation-text">Disable unused services periodically</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="actions-bar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                  >
                    <button className="action-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                      Export PDF
                    </button>
                    <button className="action-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      Export JSON
                    </button>
                    <button className="action-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <line x1="10" y1="9" x2="8" y2="9" />
                      </svg>
                      Export CSV
                    </button>
                    <button className="action-btn primary" onClick={handleRunScan} disabled={isLoading}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      New Scan
                    </button>
                  </motion.div>
                </div>
              </>
            )}

            {!latestAssessment && !isLoading && (
              <div className="empty-state-enterprise">
                <div className="empty-icon-container">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h2 className="empty-title">Ready to Scan</h2>
                <p className="empty-description">Click "Begin Scan" in the radar wheel to start your network security assessment</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            {hasError ? (
              <div className="error-state">
                <div className="error-state-copy">
                  <p className="error-state-title">Something went wrong</p>
                  <p className="error-state-description">{hasError?.toString()}</p>
                </div>
                <button onClick={refetch} className="link-btn">Try Again</button>
              </div>
            ) : assessments?.length === 0 ? (
              <div className="empty-state-enterprise">
                <div className="empty-icon-container">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <h2 className="empty-title">No Scan History</h2>
                <p className="empty-description">Run your first port scan to start building your security history</p>
              </div>
            ) : (
              <div className="history-grid">
                {assessments?.map((assessment) => (
                  <PortRiskAssessmentCard 
                    key={assessment.id} 
                    assessment={assessment}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="knowledge-section">
            {hasError ? (
              <div className="error-state">
                <div className="error-state-copy">
                  <p className="error-state-title">Something went wrong</p>
                  <p className="error-state-description">{hasError?.toString()}</p>
                </div>
                <button onClick={fetchKnowledgeBase} className="link-btn">Try Again</button>
              </div>
            ) : (
              <div className="knowledge-card">
                <h3 className="knowledge-title">Common Ports & Security Risks</h3>
                {knowledgeBase?.length === 0 ? (
                  <div className="empty-state-enterprise" style={{ padding: '40px 0' }}>
                    <p className="empty-description">No knowledge base data available.</p>
                  </div>
                ) : (
                  <div className="knowledge-grid">
                    {knowledgeBase?.sort((a, b) => a.port_number - b.port_number).map((port) => (
                      <div key={port.id} className="knowledge-item">
                        <div className="knowledge-item-header">
                          <div className="knowledge-port-group">
                            <span className="knowledge-port">{port.port_number}</span>
                            <span className="knowledge-protocol">({port.protocol})</span>
                          </div>
                          <span 
                            className="knowledge-risk"
                            style={{ 
                              backgroundColor: `${getRiskColor(port.risk_level)}15`,
                              color: getRiskColor(port.risk_level)
                            }}
                          >
                            {port.risk_level}
                          </span>
                        </div>
                        <h4 className="knowledge-service">{port.service_name}</h4>
                        <p className="knowledge-desc">{port.description}</p>
                        {port.is_unencrypted && (
                          <div className="knowledge-warning">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            Unencrypted protocol - traffic can be intercepted
                          </div>
                        )}
                        {port.is_common_exploit_target && (
                          <div className="knowledge-danger">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            Common exploit target - high risk if exposed
                          </div>
                        )}
                        {port.security_recommendation && (
                          <div className="knowledge-recommendation">
                            <strong>Recommendation:</strong> {port.security_recommendation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Security
