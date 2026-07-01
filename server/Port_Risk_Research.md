# Feature Implementation Plan: Port Risk Detection Module

**Tags:** Port Security, Network Analytics, Cybersecurity, Node.js, React

## Objective

Implement a **Port Risk Detection** feature that integrates seamlessly into the existing AkovoLabs Speedtest application. This is **not** a standalone project. Reuse the current backend architecture, API conventions, authentication, analytics pipeline, database models, logging, error handling, UI components, design tokens, and coding standards already present in the project.

The new feature should feel like a native part of the existing network analytics dashboard.

---

# Primary Goal

Extend the current analytics platform by adding a **Security Analysis** module that evaluates the user's Internet-facing network exposure through a controlled TCP port scan of their **public IP address**.

The feature must work alongside existing Speed Test analytics and produce:

* Port Scan Results
* Port Risk Score
* Security Classification
* AI Security Summary
* Historical Analytics
* Actionable Recommendations

---

# Important Requirements

## DO NOT

* Create a new backend architecture.
* Create duplicate Express servers.
* Create duplicate database connections.
* Replace the current analytics engine.
* Introduce a new authentication system.
* Change the current project structure.
* Build a separate application.

---

## DO

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

# Feature Overview

Create a new module named:

**Port Risk Detection**

This module should become part of the Network Analytics dashboard.

---

# Workflow

User runs a Speed Test

↓

Existing analytics complete

↓

Retrieve the user's detected public IP

↓

Run an authorized TCP port scan against that public IP

↓

Determine which ports are:

* Open
* Closed
* Filtered (when detectable)

↓

Identify services running on open ports

↓

Evaluate the risk of each exposed service

↓

Calculate an overall Port Risk Score

↓

Store the results alongside the existing speed test analytics

↓

Generate an AI-powered security summary

↓

Display everything in the dashboard

---

# Scan Scope

Initially scan a curated list of common TCP ports.

Recommended ports:

20
21
22
23
25
53
80
110
143
443
445
993
995
1433
3306
3389
5432
5900
8080

Design the scanner so additional ports can easily be configured later.

---

# Port States

Each scanned port must have one of the following states:

* Open
* Closed
* Filtered (where detectable)

Definitions:

Open
A service is actively listening.

Closed
No service is listening.

Filtered
Traffic appears blocked by a firewall or packet filter.

---

# Service Identification

Each detected open port should include:

* Port Number
* Service Name
* Status
* Risk Level
* Description
* Security Recommendation

Example

Port: 22

Service:
SSH

Status:
Open

Risk:
Medium

Reason:
Remote administration service detected.

Recommendation:
Use SSH keys, disable password authentication where possible, and restrict access using a firewall.

---

# Risk Classification Engine

Implement a reusable rule-based engine.

Risk levels:

* Low
* Medium
* High
* Critical

Example knowledge base:

22

SSH

Medium

Reason:
Remote administration.

---

23

Telnet

Critical

Reason:
Credentials are transmitted unencrypted.

Recommendation:
Replace with SSH.

---

80

HTTP

Low

Reason:
Standard web service.

---

443

HTTPS

Low

Reason:
Encrypted web service.

---

3389

Remote Desktop

High

Reason:
Frequently targeted by brute-force attacks.

Recommendation:
Restrict access using VPN or firewall rules.

---

445

Windows File Sharing

High

Reason:
Frequently exploited by malware and ransomware.

Recommendation:
Disable public exposure.

---

The rules engine should be modular so additional ports and rules can be added without modifying the scanning logic.

---

# Overall Port Risk Score

Generate a score from:

0–100

Example:

92

Excellent

↓

65

Moderate Risk

↓

34

High Risk

↓

12

Critical Exposure

The algorithm should consider:

* Number of exposed ports
* Severity of each exposed service
* Weighted scoring
* Overall attack surface

---

# AI Security Summary

Reuse the existing AI summary architecture.

Generate concise summaries such as:

"Your network exposes three Internet-facing services. HTTPS is available and represents a low security risk when properly configured. SSH is accessible for remote administration and should be protected using key-based authentication and firewall restrictions. Telnet is also exposed, representing a critical security concern because it transmits credentials without encryption. Disabling Telnet would significantly reduce your attack surface."

The summary should match the tone and style of the existing network health summaries.

---

# Dashboard Integration

Create a new dashboard section called:

Port Risk Detection

Display:

* Overall Security Score
* Security Status
* Number of Open Ports
* Number of Closed Ports
* Highest Risk Level
* Risk Trend
* AI Summary

Below that display a table containing:

* Port
* Service
* Status
* Risk
* Description
* Recommendation

---

# Historical Analytics

Store scan results with existing analytics records.

Support:

* Historical trends
* Previous scans
* Risk score history
* Open port history
* Security improvements over time

The implementation should integrate with the current analytics database instead of introducing a separate storage mechanism.

---

# Backend Architecture

Reuse the current backend folder structure.

Create only the additional modules required for:

* Port scanning service
* Risk engine
* Port knowledge base
* AI summary generation
* Analytics persistence

Follow existing dependency injection and service patterns.

---

# Frontend

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

# Security Considerations

The scanner must only perform authorized scans against the user's detected public IP associated with the active speed test session.

Do not implement unrestricted scanning of arbitrary third-party IP addresses or domains.

Handle timeouts, connection failures, and unavailable hosts gracefully without affecting the existing Speed Test functionality.

---

# Future Extensibility

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