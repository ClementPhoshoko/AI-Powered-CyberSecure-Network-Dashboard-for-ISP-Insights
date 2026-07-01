# Feature Implementation Plan: Port Risk Detection Module

**Tags:** Port Security, Network Analytics, Cybersecurity, Node.js, React

## Objective

Implement a **Port Risk Detection** feature that integrates seamlessly into the existing AkovoLabs Speedtest application. This is **not** a standalone project. Reuse the current backend architecture, API conventions, authentication, analytics pipeline, database models, logging, error handling, UI components, design tokens, and coding standards already present in the project.

The new feature should feel like a native part of the existing network analytics dashboard.

---

## Primary Goal

Extend the current analytics platform by adding a **Security Analysis** module that evaluates the user's Internet-facing network exposure through a controlled TCP port scan of their **public IP address**.

The feature must work alongside existing Speed Test analytics and produce:

* Port Scan Results
* Port Risk Score
* Security Classification
* AI Security Summary
* Historical Analytics
* Actionable Recommendations
* **Unencrypted Protocol Detection**
* **Dangerous Port Combination Alerts**
* **Common Exploit Target Warnings**
* **Scan Timing Anomaly Detection**
* **Historical Scan Comparison**

---

## Important Requirements

### DO NOT

* Create a new backend architecture.
* Create duplicate Express servers.
* Create duplicate database connections.
* Replace the current analytics engine.
* Introduce a new authentication system.
* Change the current project structure.
* Build a separate application.

### DO

Use the existing project architecture.

Reuse existing:

* Express routes
* Controllers
* Services
* Middleware
* Utilities
* Database models
* Logging
* Error handling
* AI summary generation
* Analytics storage
* Dashboard components
* Design tokens
* Theme system
* Cards
* Charts
* History views

The implementation should follow the exact coding style already used throughout the project.

---

## Feature Overview

Create a new module named:

**Port Risk Detection**

This module should become part of the Network Analytics dashboard.

---

## Workflow

User runs a Speed Test or directly requests a port scan:

↓

If standalone, auto-detect public IP address

↓

Run an authorized TCP port scan against that public IP

↓

Determine which ports are:

* Open
* Closed
* Filtered (when detectable)

↓

Analyze scan results for:

* Unencrypted protocols
* Dangerous port combinations
* Common exploit targets
* Scan timing anomalies
* Changes from previous scan

↓

Identify services running on open ports

↓

Evaluate the risk of each exposed service

↓

Calculate an overall Port Risk Score

↓

Store the results alongside the existing speed test analytics or as standalone records

↓

Generate an AI-powered security summary

↓

Display everything in the dashboard

---

## Enhanced Security Analysis Features

### 1. Unencrypted Protocol Detection

**What:** Identify open ports that use unencrypted protocols (HTTP, FTP, Telnet, POP3, IMAP, etc.)

**Why:** Unencrypted protocols expose sensitive data (credentials, commands, personal information) to eavesdropping.

**Implementation:**

* Flag ports marked as `is_unencrypted = true` in `port_knowledge_base`
* Add high-priority recommendations to switch to encrypted alternatives (HTTPS, SFTP, SSH, POP3S, IMAPS)
* Highlight these ports with distinct styling in the UI

**Example:** Port 23 (Telnet) is unencrypted - highly critical.

---

### 2. Dangerous Port Combination Alerts

**What:** Detect when multiple ports that together pose an elevated risk are open simultaneously.

**Why:** Certain combinations of open ports can indicate misconfigured firewalls, excessive remote access, or other security issues.

**Predefined Dangerous Combinations:**

1. **22 (SSH) + 3389 (RDP)** - Multiple remote access ports open
2. **445 (SMB) + 139 (NetBIOS)** - Windows file sharing exposed to internet
3. **80 (HTTP) + 8080 (HTTP Proxy)** - Possible misconfigured proxy
4. **3306 (MySQL) + 5432 (PostgreSQL) + 1433 (SQL Server)** - Multiple databases exposed

**Implementation:**

* Define combinations in `portRisk.service.js`
* Check for matches during scan analysis
* Add high/critical priority recommendations
* Show warning badges in UI

---

### 3. Common Exploit Target Warnings

**What:** Alert on ports that are frequently targeted by known exploits and malware.

**Why:** These ports require immediate attention due to their history of being abused by attackers.

**Implementation:**

* Flag ports marked as `is_common_exploit_target = true` in `port_knowledge_base`
* Show `exploit_notes` field to explain known risks (e.g., EternalBlue for port 445)
* Add critical priority recommendations
* Highlight these ports with special badges in UI

**Common Targets:**

* Port 445 (SMB): EternalBlue, WannaCry, NotPetya
* Port 3389 (RDP): BlueKeep, DejaBlue
* Database ports (3306, 5432, 1433): Common brute-force and injection targets
* Port 23 (Telnet): Unencrypted credentials and commands

---

### 4. Scan Timing Anomaly Detection

**What:** Compare current scan duration against historical average scan times for the user.

**Why:** Anomalous scan times can indicate:
* Firewall rate limiting
* Intrusion Detection System (IDS) interference
* Network congestion
* Device performance issues

**Implementation:**

* Track `scan_duration_seconds` in `port_risk_assessments`
* Calculate average duration from user's previous scans
* Alert if current scan deviates by 50% or more from average
* Add medium priority recommendation to investigate

---

### 5. Historical Scan Comparison

**What:** Compare current open ports with the user's most recent port scan.

**Why:** Shows users:
* Newly opened ports that might be security risks
* Closed ports (positive security improvement)
* Changes in their network exposure over time

**Implementation:**

* Retrieve most recent `port_risk_assessment` (and associated `port_scan_results`) for user
* Identify ports that were open before and now closed, or closed before and now open
* Add recommendations for new open ports, and congratulations for closed ports
* Display side-by-side comparison in UI

---

## Scan Scope

Initially scan a curated list of common TCP ports.

Recommended ports:

20, 21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 1433, 3306, 3389, 5432, 5900, 8080

Design the scanner so additional ports can easily be configured later.

---

## Port States

Each scanned port must have one of the following states:

* Open
* Closed
* Filtered (where detectable)

Definitions:

* **Open**: A service is actively listening.
* **Closed**: No service is listening.
* **Filtered**: Traffic appears blocked by a firewall or packet filter.

---

## Service Identification

Each detected open port should include:

* Port Number
* Service Name
* Status
* Risk Level
* Description
* Security Recommendation
* Is Unencrypted?
* Is Common Exploit Target?
* Exploit Notes (if applicable)

---

## Risk Classification Engine

Implement a reusable rule-based engine.

Risk levels:

* Low
* Medium
* High
* Critical

---

## Overall Port Risk Score

Generate a score from:

0–100

Example:

92 → Excellent

65 → Moderate Risk

34 → High Risk

12 → Critical Exposure

The algorithm should consider:

* Number of exposed ports
* Severity of each exposed service
* Weighted scoring
* Overall attack surface
* Unencrypted protocols present
* Dangerous combinations found
* Exploit targets present

---

## AI Security Summary

Reuse the existing AI summary architecture.

Generate concise summaries such as:

"Your network exposes three Internet-facing services. HTTPS is available and represents a low security risk when properly configured. SSH is accessible for remote administration and should be protected using key-based authentication and firewall restrictions. Telnet is also exposed, representing a critical security concern because it transmits credentials without encryption. Disabling Telnet would significantly reduce your attack surface."

The summary should include mentions of:

* Unencrypted protocols
* Exploit targets
* Dangerous combinations
* Historical changes
* Timing anomalies

The summary should match the tone and style of the existing network health summaries, and have a rule-based fallback for when the Gemini API is unavailable.

---

## Dashboard Integration

Create a new dashboard section named:

**Port Risk Detection**

Display:

* Overall Security Score
* Security Status
* Number of Open Ports
* Number of Closed Ports
* Highest Risk Level
* Risk Trend
* AI Summary
* Enhanced alerts for unencrypted protocols
* Dangerous combination warnings
* Exploit target badges
* Historical comparison section

Below that display a table containing:

* Port
* Service
* Status
* Risk
* Encryption Status
* Exploit Target Status
* Description
* Recommendation

---

## Historical Analytics

Store scan results with existing analytics records.

Support:

* Historical trends
* Previous scans
* Risk score history
* Open port history
* Security improvements over time
* Comparison between scans

The implementation should integrate with the current analytics database instead of introducing a separate storage mechanism.

---

## Backend Architecture

Reuse the current backend folder structure.

Create only the additional modules required for:

* Port scanning service
* Risk engine
* Port knowledge base
* AI summary generation
* Analytics persistence

Follow existing dependency injection and service patterns.

**Main Service File:** `src/services/portRisk.service.js`

**Key Methods:**

- `getPublicIp()`: Auto-detect user's public IP address
- `scanPort()`: Scan a single port
- `scanPorts()`: Scan multiple ports with concurrency control
- `detectUnencryptedProtocols()`: Identify unencrypted protocols
- `detectDangerousCombinations()`: Find dangerous port combinations
- `detectExploitTargets()`: Identify common exploit targets
- `detectTimingAnomalies()`: Check for scan timing issues
- `compareWithPrevious()`: Compare with last scan
- `calculateRiskScore()`: Calculate overall risk score
- `generateRecommendations()`: Generate actionable recommendations
- `generateAiSecuritySummary()`: Generate AI summary
- `createAssessmentFromScan()`: Internal shared logic
- `runPortRiskAssessment()`: Post-speed-test assessment (backward compatible)
- `runStandalonePortRiskAssessment()`: Standalone scan (new feature)

---

## API Endpoints

### Port Risk Detection Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/port-risk/assess` | Run a full port risk assessment using existing speed test |
| POST | `/api/port-risk/standalone` | Run standalone port risk assessment (no speed test needed) |
| GET | `/api/port-risk/assessment/:id` | Get a specific port risk assessment by ID |
| GET | `/api/port-risk/test-result/:testResultId` | Get port risk assessment for a specific test result |
| GET | `/api/port-risk/assessments` | Get all port risk assessments for the current user |
| GET | `/api/port-risk/knowledge-base` | Get the port knowledge base (public) |

---

## Frontend

Reuse:

* Existing dashboard layout
* Existing cards
* Existing tables
* Existing charts
* Existing loading states
* Existing skeleton loaders
* Existing error components
* Existing notifications
* Existing design tokens

Do not introduce a different UI design language.

---

## Security Considerations

The scanner must only perform authorized scans against the user's detected public IP associated with the active speed test session.

Do not implement unrestricted scanning of arbitrary third-party IP addresses or domains.

Handle timeouts, connection failures, and unavailable hosts gracefully without affecting the existing Speed Test functionality.

---

## Future Extensibility

Design the module so future enhancements can be added without major refactoring, including:

* Service version detection
* CVE lookups
* Vulnerability matching
* UDP scanning
* Internal network scanning through an optional desktop agent
* Firewall recommendations
* ISP security reporting
* Advanced enterprise analytics

The architecture should remain modular, reusable, maintainable, and fully integrated with the existing AkovoLabs Speedtest platform.
