const net = require('net');
const TestResult = require('../models/TestResult');
const PortKnowledgeBase = require('../models/PortKnowledgeBase');
const PortScanResult = require('../models/PortScanResult');
const PortRiskAssessment = require('../models/PortRiskAssessment');
const SecurityRecommendation = require('../models/SecurityRecommendation');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './src/.env' });

class PortRiskService {
  // Risk level weights for score calculation
  static RISK_WEIGHTS = {
    critical: 40,
    high: 25,
    medium: 15,
    low: 5
  };

  // Status thresholds
  static STATUS_THRESHOLDS = {
    excellent: 90,
    good: 70,
    moderate: 50,
    high: 30,
    critical: 0
  };

  // Common ports to scan
  static COMMON_PORTS = [20, 21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 1433, 3306, 3389, 5432, 5900, 8080];

  // Dangerous port combinations to detect
  static DANGEROUS_COMBINATIONS = [
    {
      ports: [22, 3389], // SSH + RDP
      name: 'Multiple Remote Access Ports',
      risk: 'high',
      description: 'Both SSH and RDP are exposed. Limit remote access to trusted IPs only.'
    },
    {
      ports: [445, 139], // SMB + NetBIOS
      name: 'Windows File Sharing Exposed',
      risk: 'critical',
      description: 'SMB/NetBIOS is exposed to the internet. Disable public access immediately.'
    },
    {
      ports: [80, 8080], // HTTP + Proxy
      name: 'Unencrypted Proxy Detected',
      risk: 'medium',
      description: 'HTTP and an alternative HTTP port are open. Ensure no misconfigured proxy is exposed.'
    },
    {
      ports: [3306, 5432, 1433], // Multiple databases
      name: 'Multiple Database Ports Exposed',
      risk: 'critical',
      description: 'Multiple database ports are open. Restrict all database access to internal networks.'
    }
  ];

  // Get public IP address from external service
  static async getPublicIp() {
    try {
      const response = await fetch('https://api.ipify.org?format=text');
      const ip = await response.text();
      return ip.trim();
    } catch (error) {
      console.error('Failed to get public IP:', error);
      throw new Error('Could not detect public IP address');
    }
  }

  // Scan a single port
  static async scanPort(host, port, timeout = 2000) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(timeout);
      const startTime = Date.now();

      socket.on('connect', () => {
        const duration = Date.now() - startTime;
        socket.destroy();
        resolve({ port, state: 'open', duration });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ port, state: 'filtered', duration: timeout });
      });

      socket.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
          resolve({ port, state: 'closed', duration: Date.now() - startTime });
        } else {
          resolve({ port, state: 'filtered', duration: Date.now() - startTime });
        }
      });

      socket.connect(port, host);
    });
  }

  // Scan multiple ports with concurrency control
  static async scanPorts(host, ports = this.COMMON_PORTS, concurrency = 5) {
    const scanResults = [];
    const chunks = [];
    for (let i = 0; i < ports.length; i += concurrency) {
      chunks.push(ports.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(port => this.scanPort(host, port))
      );
      scanResults.push(...chunkResults);
    }

    return scanResults.sort((a, b) => a.port - b.port);
  }

  // Detect unencrypted protocols in open ports
  static detectUnencryptedProtocols(openPorts, portKnowledgeBase) {
    return openPorts.filter(port => {
      const kbEntry = portKnowledgeBase.find(
        kb => kb.port_number === port.port && kb.protocol === 'tcp'
      );
      return kbEntry?.is_unencrypted;
    });
  }

  // Detect dangerous port combinations
  static detectDangerousCombinations(openPorts) {
    const openPortNumbers = openPorts.map(p => p.port);
    const detectedCombinations = [];

    for (const combo of this.DANGEROUS_COMBINATIONS) {
      const hasAllPorts = combo.ports.every(port => openPortNumbers.includes(port));
      if (hasAllPorts) {
        detectedCombinations.push(combo);
      }
    }

    return detectedCombinations;
  }

  // Detect common exploit targets
  static detectExploitTargets(openPorts, portKnowledgeBase) {
    return openPorts.filter(port => {
      const kbEntry = portKnowledgeBase.find(
        kb => kb.port_number === port.port && kb.protocol === 'tcp'
      );
      return kbEntry?.is_common_exploit_target;
    });
  }

  // Calculate scan timing anomalies
  static detectTimingAnomalies(currentScanDuration, previousAssessments) {
    if (!previousAssessments || previousAssessments.length === 0) {
      return null;
    }

    const previousDurations = previousAssessments
      .map(a => a.scan_duration_seconds)
      .filter(d => d !== null && d !== undefined);

    if (previousDurations.length === 0) {
      return null;
    }

    const avgDuration = previousDurations.reduce((a, b) => a + b, 0) / previousDurations.length;
    const deviation = Math.abs(currentScanDuration - avgDuration) / avgDuration;

    if (deviation > 0.5) { // 50% deviation from average
      return {
        isAnomaly: true,
        currentDuration: currentScanDuration,
        averageDuration: avgDuration,
        deviation: deviation,
        message: deviation > 0 ? 'Scan took longer than usual - possible rate limiting or security device' : 'Scan was much faster than usual'
      };
    }

    return null;
  }

  // Compare current scan with previous scan
  static compareWithPrevious(currentScanResults, previousAssessment) {
    if (!previousAssessment) {
      return null;
    }

    const currentOpenPorts = currentScanResults.filter(r => r.state === 'open').map(r => r.port);
    const previousOpenPorts = (previousAssessment.port_scan_results || [])
      .filter(r => r.port_state === 'open')
      .map(r => r.port_number);

    const newOpenPorts = currentOpenPorts.filter(p => !previousOpenPorts.includes(p));
    const closedPorts = previousOpenPorts.filter(p => !currentOpenPorts.includes(p));

    return {
      hasChanges: newOpenPorts.length > 0 || closedPorts.length > 0,
      newOpenPorts,
      closedPorts
    };
  }

  // Calculate overall risk score
  static calculateRiskScore(openPorts, portKnowledgeBase) {
    let totalRiskScore = 0;
    let highestRiskLevel = 'low';
    const openPortsWithRisk = [];

    const riskLevelOrder = ['low', 'medium', 'high', 'critical'];

    for (const openPort of openPorts) {
      const kbEntry = portKnowledgeBase.find(
        kb => kb.port_number === openPort.port && kb.protocol === 'tcp'
      );

      const riskLevel = kbEntry?.risk_level || 'medium';
      const riskWeight = this.RISK_WEIGHTS[riskLevel];
      totalRiskScore += riskWeight;

      // Update highest risk level
      if (riskLevelOrder.indexOf(riskLevel) > riskLevelOrder.indexOf(highestRiskLevel)) {
        highestRiskLevel = riskLevel;
      }

      openPortsWithRisk.push({
        ...openPort,
        riskLevel,
        serviceName: kbEntry?.service_name || 'Unknown',
        description: kbEntry?.description,
        recommendation: kbEntry?.security_recommendation,
        isUnencrypted: kbEntry?.is_unencrypted,
        isExploitTarget: kbEntry?.is_common_exploit_target,
        exploitNotes: kbEntry?.exploit_notes
      });
    }

    // Cap the score and invert (higher score = better security)
    const rawScore = Math.min(totalRiskScore, 100);
    const finalScore = 100 - rawScore;

    // Determine security status
    let securityStatus;
    if (finalScore >= this.STATUS_THRESHOLDS.excellent) securityStatus = 'excellent';
    else if (finalScore >= this.STATUS_THRESHOLDS.good) securityStatus = 'good';
    else if (finalScore >= this.STATUS_THRESHOLDS.moderate) securityStatus = 'moderate';
    else if (finalScore >= this.STATUS_THRESHOLDS.high) securityStatus = 'high';
    else securityStatus = 'critical';

    return {
      score: finalScore,
      status: securityStatus,
      highestRiskLevel,
      openPortsWithRisk
    };
  }

  // Generate security recommendations from scan results
  static generateRecommendations(openPortsWithRisk, assessmentId, extraInsights = {}) {
    const recommendations = [];

    // Add recommendations for each open port
    for (const openPort of openPortsWithRisk) {
      const priority = openPort.riskLevel;

      recommendations.push({
        port_risk_assessment_id: assessmentId,
        port_number: openPort.port,
        recommendation_type: 'port_exposure',
        priority,
        title: `Exposed ${openPort.serviceName} on port ${openPort.port}`,
        description: openPort.description || `Port ${openPort.port} (${openPort.serviceName}) is exposed to the internet.`,
        action_steps: openPort.recommendation || 'Restrict access to this port using a firewall or VPN.'
      });

      // Add unencrypted protocol warning if applicable
      if (openPort.isUnencrypted) {
        recommendations.push({
          port_risk_assessment_id: assessmentId,
          port_number: openPort.port,
          recommendation_type: 'unencrypted_protocol',
          priority: 'high',
          title: `Unencrypted ${openPort.serviceName} Detected`,
          description: `Port ${openPort.port} uses an unencrypted protocol. All traffic (including credentials) is visible to attackers.`,
          action_steps: openPort.recommendation
        });
      }

      // Add exploit target warning if applicable
      if (openPort.isExploitTarget) {
        recommendations.push({
          port_risk_assessment_id: assessmentId,
          port_number: openPort.port,
          recommendation_type: 'exploit_target',
          priority: 'critical',
          title: `High-Risk Exploit Target: ${openPort.serviceName}`,
          description: `Port ${openPort.port} is a common target for exploits. ${openPort.exploitNotes ? openPort.exploitNotes : 'Limit access immediately.'}`,
          action_steps: openPort.recommendation
        });
      }
    }

    // Add dangerous combination recommendations
    if (extraInsights.dangerousCombinations) {
      for (const combo of extraInsights.dangerousCombinations) {
        recommendations.push({
          port_risk_assessment_id: assessmentId,
          port_number: null,
          recommendation_type: 'dangerous_combination',
          priority: combo.risk,
          title: combo.name,
          description: combo.description,
          action_steps: 'Review and restrict access to these ports immediately.'
        });
      }
    }

    // Add historical comparison notes
    if (extraInsights.historicalComparison && extraInsights.historicalComparison.hasChanges) {
      if (extraInsights.historicalComparison.newOpenPorts.length > 0) {
        recommendations.push({
          port_risk_assessment_id: assessmentId,
          port_number: null,
          recommendation_type: 'historical_change',
          priority: 'high',
          title: 'New Ports Open Since Last Scan',
          description: `The following ports are now open: ${extraInsights.historicalComparison.newOpenPorts.join(', ')}. Verify these changes are intentional.`,
          action_steps: 'Investigate each new open port and ensure it should be publicly accessible.'
        });
      }
      if (extraInsights.historicalComparison.closedPorts.length > 0) {
        recommendations.push({
          port_risk_assessment_id: assessmentId,
          port_number: null,
          recommendation_type: 'historical_change',
          priority: 'low',
          title: 'Ports Closed Since Last Scan',
          description: `Great! The following ports are now closed: ${extraInsights.historicalComparison.closedPorts.join(', ')}.`,
          action_steps: 'Keep up the good work!'
        });
      }
    }

    // Add timing anomaly warning
    if (extraInsights.timingAnomaly && extraInsights.timingAnomaly.isAnomaly) {
      recommendations.push({
        port_risk_assessment_id: assessmentId,
        port_number: null,
        recommendation_type: 'timing_anomaly',
        priority: 'medium',
        title: 'Scan Timing Anomaly Detected',
        description: extraInsights.timingAnomaly.message,
        action_steps: 'Monitor for unusual network activity or security device behavior.'
      });
    }

    // Add general recommendations if high/critical risk
    if (openPortsWithRisk.some(p => ['high', 'critical'].includes(p.riskLevel))) {
      recommendations.push({
        port_risk_assessment_id: assessmentId,
        port_number: null,
        recommendation_type: 'general_security',
        priority: 'high',
        title: 'General Security Improvement',
        description: 'Your network has high-risk ports exposed. Consider a comprehensive security review.',
        action_steps: '1. Review all open ports\n2. Implement a firewall\n3. Consider a network security audit'
      });
    }

    return recommendations;
  }

  // Generate AI security summary
  static async generateAiSecuritySummary(scanData, riskScore, status, extraInsights = {}) {
    if (!process.env.GEMINI_API_KEY) {
      // Fallback to rule-based summary
      return this.generateRuleBasedSecuritySummary(scanData, riskScore, status, extraInsights);
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const openPortsText = scanData.openPortsWithRisk.map(p => 
        `${p.port} (${p.serviceName}, ${p.riskLevel})`
      ).join(', ') || 'No open ports detected';

      const extraDetails = [];
      if (extraInsights.unencryptedProtocols && extraInsights.unencryptedProtocols.length > 0) {
        extraDetails.push(`Unencrypted ports: ${extraInsights.unencryptedProtocols.map(p => p.port).join(', ')}`);
      }
      if (extraInsights.exploitTargets && extraInsights.exploitTargets.length > 0) {
        extraDetails.push(`Exploit targets: ${extraInsights.exploitTargets.map(p => p.port).join(', ')}`);
      }
      if (extraInsights.dangerousCombinations && extraInsights.dangerousCombinations.length > 0) {
        extraDetails.push(`Dangerous combinations: ${extraInsights.dangerousCombinations.map(c => c.name).join(', ')}`);
      }

      const prompt = `
You are a senior ISP cybersecurity analyst reviewing a port scan.

Generate a clear, operational security summary for network engineers.

Rules:
- 4–6 sentences max
- Start with overall security posture and severity
- Prioritize issues by severity (critical > high > medium > low)
- Mention ALL critical and high-risk issues if present
- Mention medium/low risks only if space allows
- Clearly highlight dangerous patterns (combinations, unencrypted services, exploit targets)
- Provide 1–3 actionable remediation steps
- Do NOT repeat raw scan data
- No bullet points
- Keep tone professional and suitable for ISP/security teams

Scan Results:
Security Status: ${status}
Security Score: ${riskScore}/100

Open Ports Detail:
${openPortsText}

Highest Risk Level: ${highestRiskLevel}

Risk Breakdown:
Critical: ${criticalPorts?.join(", ") || "None"}
High: ${highRiskPorts?.join(", ") || "None"}
Medium: ${mediumRiskPorts?.join(", ") || "None"}
Low: ${lowRiskPorts?.join(", ") || "None"}

Dangerous Combinations (CRITICAL PATTERNS):
${dangerousCombinations?.map(c => `${c.name} - ${c.description}`).join("; ") || "None"}

Unencrypted Services:
${unencryptedProtocols?.map(p => `${p.port} (${p.serviceName})`).join(", ") || "None"}

Exploit Targets:
${exploitTargets?.map(p => `${p.port} (${p.serviceName})`).join(", ") || "None"}

Additional Context:
${extraDetails.length ? extraDetails.join("; ") : "None"}

Return ONLY the summary.
`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.warn('AI security summary failed, using fallback:', error);
      return this.generateRuleBasedSecuritySummary(scanData, riskScore, status, extraInsights);
    }
  }

  // Rule-based fallback summary
  static generateRuleBasedSecuritySummary(scanData, riskScore, status, extraInsights = {}) {
    const openPortsCount = scanData.openPortsWithRisk.length;
    const criticalPorts = scanData.openPortsWithRisk.filter(p => ['high', 'critical'].includes(p.riskLevel));
    
    let summary = `Your network security is rated ${status} with a score of ${riskScore}/100. `;
    
    if (openPortsCount > 0) {
      summary += `You have ${openPortsCount} port${openPortsCount > 1 ? 's' : ''} open. `;
    }
    
    if (criticalPorts.length > 0) {
      summary += `${criticalPorts.length} high/critical risk port${criticalPorts.length > 1 ? 's' : ''} exposed - take action immediately. `;
    }
    
    if (extraInsights.unencryptedProtocols && extraInsights.unencryptedProtocols.length > 0) {
      summary += `Unencrypted protocols detected - switch to encrypted alternatives. `;
    }
    
    summary += 'We recommend reviewing your firewall settings and closing unnecessary ports.';
    
    return summary;
  }

  // Internal method to create assessment with known testResultId and publicIp
  static async createAssessmentFromScan(userId, testResultId, publicIp, scanStartedAt, previousAssessments = []) {
    // 1. Get port knowledge base
    const portKnowledgeBase = await PortKnowledgeBase.findCommonPorts();

    // 2. Run port scan
    const scanResults = await this.scanPorts(publicIp);
    const scanCompletedAt = new Date();
    const scanDurationSeconds = (scanCompletedAt - scanStartedAt) / 1000;
    
    // 3. Calculate risk and insights
    const openPorts = scanResults.filter(r => r.state === 'open');
    const closedPorts = scanResults.filter(r => r.state === 'closed');
    const filteredPorts = scanResults.filter(r => r.state === 'filtered');
    
    const riskCalculation = this.calculateRiskScore(openPorts, portKnowledgeBase);
    
    const unencryptedProtocols = this.detectUnencryptedProtocols(openPorts, portKnowledgeBase);
    const dangerousCombinations = this.detectDangerousCombinations(openPorts);
    const exploitTargets = this.detectExploitTargets(openPorts, portKnowledgeBase);
    const timingAnomaly = this.detectTimingAnomalies(scanDurationSeconds, previousAssessments);
    const historicalComparison = this.compareWithPrevious(scanResults, previousAssessments[0]);
    
    const extraInsights = {
      unencryptedProtocols,
      dangerousCombinations,
      exploitTargets,
      timingAnomaly,
      historicalComparison
    };

    // 4. Create port risk assessment
    const assessment = await PortRiskAssessment.create({
      user_id: userId,
      test_result_id: testResultId,
      overall_risk_score: riskCalculation.score,
      security_status: riskCalculation.status,
      open_ports_count: openPorts.length,
      closed_ports_count: closedPorts.length,
      filtered_ports_count: filteredPorts.length,
      highest_risk_level: riskCalculation.highestRiskLevel,
      scan_started_at: scanStartedAt.toISOString(),
      scan_completed_at: scanCompletedAt.toISOString(),
      scan_duration_seconds: scanDurationSeconds
    });

    // 5. Save port scan results
    const scanResultsToInsert = scanResults.map(r => {
      const kbEntry = portKnowledgeBase.find(
        kb => kb.port_number === r.port && kb.protocol === 'tcp'
      );
      return {
        port_risk_assessment_id: assessment.id,
        test_result_id: testResultId,
        port_number: r.port,
        protocol: 'tcp',
        port_state: r.state,
        service_name: kbEntry?.service_name,
        risk_level: kbEntry?.risk_level,
        scan_duration_ms: r.duration
      };
    });
    await PortScanResult.createMany(scanResultsToInsert);

    // 6. Generate and save security recommendations
    const recommendations = this.generateRecommendations(
      riskCalculation.openPortsWithRisk,
      assessment.id,
      extraInsights
    );
    if (recommendations.length > 0) {
      await SecurityRecommendation.createMany(recommendations);
    }

    // 7. Generate AI security summary
    const aiSummary = await this.generateAiSecuritySummary(
      riskCalculation,
      riskCalculation.score,
      riskCalculation.status,
      extraInsights
    );
    await PortRiskAssessment.update(assessment.id, { ai_security_summary: aiSummary });

    // 8. Return complete result
    return PortRiskAssessment.findById(assessment.id);
  }

  // Original method (backward compatible)
  static async runPortRiskAssessment(userId, testResultId) {
    // 1. Verify ownership and get test result
    const testResult = await TestResult.findById(testResultId);
    if (!testResult) throw new Error('Test result not found');
    if (testResult.user_id !== userId) throw new Error('Unauthorized');
    
    // 2. Get public IP from test result
    const publicIp = testResult.ip_address;
    if (!publicIp) throw new Error('No public IP address available for this test result');

    // 3. Get user's previous assessments for comparison
    const previousAssessments = await PortRiskAssessment.findByUserId(userId);
    
    const scanStartedAt = new Date();
    return this.createAssessmentFromScan(userId, testResultId, publicIp, scanStartedAt, previousAssessments);
  }

  // New method for standalone port risk assessment
  static async runStandalonePortRiskAssessment(userId, customIp = null) {
    const scanStartedAt = new Date();
    // 1. Get public IP (custom or auto-detected)
    const publicIp = customIp || await this.getPublicIp();
    if (!publicIp) throw new Error('Could not detect public IP address');

    // 2. Get user's previous assessments for comparison
    const previousAssessments = await PortRiskAssessment.findByUserId(userId);

    return this.createAssessmentFromScan(userId, null, publicIp, scanStartedAt, previousAssessments);
  }
}

module.exports = PortRiskService;
