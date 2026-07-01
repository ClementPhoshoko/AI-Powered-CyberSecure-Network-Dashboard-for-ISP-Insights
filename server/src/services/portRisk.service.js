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

  // Get public IP address from external service
  static async getPublicIp() {
    try {
      const fetch = (await import('node-fetch')).default;
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
        recommendation: kbEntry?.security_recommendation
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
  static generateRecommendations(openPortsWithRisk, assessmentId) {
    const recommendations = [];

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
  static async generateAiSecuritySummary(scanData, riskScore, status) {
    if (!process.env.GEMINI_API_KEY) {
      // Fallback to rule-based summary
      return this.generateRuleBasedSecuritySummary(scanData, riskScore, status);
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const openPortsText = scanData.openPortsWithRisk.map(p => 
        `${p.port} (${p.serviceName}, ${p.riskLevel})`
      ).join(', ') || 'No open ports detected';

      const prompt = `You are a network security expert. Generate a concise, friendly security summary (3-5 sentences) based on the following port scan results.

Rules:
- Keep under 500 characters
- Explain security status clearly
- Mention any open ports and their risk levels
- Give 1-2 specific actionable recommendations
- Keep it conversational, not too technical

Scan Data:
- Security Score: ${riskScore}/100
- Security Status: ${status}
- Open Ports: ${openPortsText}

Please return ONLY the summary text.`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.warn('AI security summary failed, using fallback:', error);
      return this.generateRuleBasedSecuritySummary(scanData, riskScore, status);
    }
  }

  // Rule-based fallback summary
  static generateRuleBasedSecuritySummary(scanData, riskScore, status) {
    const openPortsCount = scanData.openPortsWithRisk.length;
    
    if (status === 'excellent' || status === 'good') {
      return `Great! Your network security looks ${status} with a score of ${riskScore}/100. ${openPortsCount > 0 ? `You have ${openPortsCount} port${openPortsCount > 1 ? 's' : ''} open, but they appear to be low risk.` : 'No risky ports are exposed to the internet.'} Keep up the good work!`;
    } else {
      const criticalPorts = scanData.openPortsWithRisk.filter(p => ['high', 'critical'].includes(p.riskLevel));
      return `Your network security is rated ${status} with a score of ${riskScore}/100. ${criticalPorts.length > 0 ? `You have ${criticalPorts.length} high/critical risk port${criticalPorts.length > 1 ? 's' : ''} exposed.` : ''} We recommend reviewing your firewall settings and closing unnecessary ports immediately.`;
    }
  }

  // Internal method to create assessment with known testResultId and publicIp
  static async createAssessmentFromScan(userId, testResultId, publicIp, scanStartedAt) {
    // 1. Get port knowledge base
    const portKnowledgeBase = await PortKnowledgeBase.findCommonPorts();

    // 2. Run port scan
    const scanResults = await this.scanPorts(publicIp);
    
    // 3. Calculate risk
    const openPorts = scanResults.filter(r => r.state === 'open');
    const closedPorts = scanResults.filter(r => r.state === 'closed');
    const filteredPorts = scanResults.filter(r => r.state === 'filtered');
    
    const riskCalculation = this.calculateRiskScore(openPorts, portKnowledgeBase);

    // 4. Create port risk assessment
    const scanCompletedAt = new Date();
    const assessment = await PortRiskAssessment.create({
      test_result_id: testResultId,
      overall_risk_score: riskCalculation.score,
      security_status: riskCalculation.status,
      open_ports_count: openPorts.length,
      closed_ports_count: closedPorts.length,
      filtered_ports_count: filteredPorts.length,
      highest_risk_level: riskCalculation.highestRiskLevel,
      scan_started_at: scanStartedAt.toISOString(),
      scan_completed_at: scanCompletedAt.toISOString(),
      scan_duration_seconds: (scanCompletedAt - scanStartedAt) / 1000
    });

    // 5. Save port scan results
    const scanResultsToInsert = scanResults.map(r => {
      const kbEntry = portKnowledgeBase.find(
        kb => kb.port_number === r.port && kb.protocol === 'tcp'
      );
      return {
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
      assessment.id
    );
    if (recommendations.length > 0) {
      await SecurityRecommendation.createMany(recommendations);
    }

    // 7. Generate AI security summary
    const aiSummary = await this.generateAiSecuritySummary(
      riskCalculation,
      riskCalculation.score,
      riskCalculation.status
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

    const scanStartedAt = new Date();
    return this.createAssessmentFromScan(userId, testResultId, publicIp, scanStartedAt);
  }

  // New method for standalone port risk assessment
  static async runStandalonePortRiskAssessment(userId, customIp = null) {
    const scanStartedAt = new Date();
    // 1. Get public IP (custom or auto-detected)
    const publicIp = customIp || await this.getPublicIp();
    if (!publicIp) throw new Error('Could not detect public IP address');

    // 2. Create minimal test result for tracking
    const testResult = await TestResult.create({
      user_id: userId,
      ip_address: publicIp,
      // Add minimal required fields, leave others null
      download_speed_mbps: null,
      upload_speed_mbps: null,
      ping_avg_ms: null,
      network_health_score: null
    });

    return this.createAssessmentFromScan(userId, testResult.id, publicIp, scanStartedAt);
  }
}

module.exports = PortRiskService;