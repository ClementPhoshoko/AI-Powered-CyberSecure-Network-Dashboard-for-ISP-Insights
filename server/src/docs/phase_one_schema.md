# AkovoLabs Speedtest - Complete Schema ER Diagram

```mermaid
erDiagram
    auth_users ||--o{ profiles : "has"
    auth_users ||--o{ test_results : "runs"
    auth_users ||--o{ subscribers : "has"
    test_results ||--o{ ping_measurements : "includes"
    test_results ||--o{ anomaly_logs : "has"
    test_results ||--o{ download_measurements : "includes"
    test_results ||--o{ upload_measurements : "includes"
    test_results ||--o{ port_scan_results : "has"
    test_results ||--o{ port_risk_assessments : "has"
    port_risk_assessments ||--o{ security_recommendations : "has"

    auth_users {
        uuid id PK
    }

    profiles {
        uuid id PK
        varchar username
        varchar first_name
        varchar last_name
        timestamptz created_at
        timestamptz updated_at
    }

    subscribers {
        uuid id PK
        uuid user_id FK
        varchar email
        varchar first_name
        varchar last_name
        varchar status
        timestamptz created_at
        timestamptz updated_at
    }

    test_results {
        uuid id PK
        uuid user_id FK
        numeric download_speed_mbps
        numeric upload_speed_mbps
        numeric download_test_size_mb
        numeric download_test_duration_seconds
        numeric upload_test_size_mb
        numeric upload_test_duration_seconds
        numeric ping_avg_ms
        numeric ping_min_ms
        numeric ping_max_ms
        numeric ping_median_ms
        numeric jitter_ms
        numeric packet_loss_percent
        numeric dns_lookup_ms
        numeric server_response_ms
        integer network_health_score
        integer gaming_score
        integer streaming_score
        integer video_call_score
        integer browsing_score
        text ai_summary
        varchar score_method
        varchar score_confidence_label
        numeric score_confidence_value
        text score_explanation
        varchar probe_method
        varchar probe_target
        integer probe_sample_count
        integer successful_probe_count
        integer failed_probe_count
        varchar isp_name
        varchar country
        varchar province
        varchar city
        inet ip_address
        varchar device_type
        varchar browser_name
        integer test_duration_seconds
        timestamptz created_at
    }

    ping_measurements {
        uuid id PK
        uuid test_result_id FK
        integer sequence_number
        numeric latency_ms
        boolean success
        varchar failure_reason
        timestamptz created_at
    }

    anomaly_logs {
        uuid id PK
        uuid test_result_id FK
        varchar anomaly_type
        varchar severity
        text description
        timestamptz created_at
    }

    download_measurements {
        uuid id PK
        uuid test_result_id FK
        numeric file_size_mb
        numeric download_speed_mbps
        numeric test_duration_seconds
        timestamptz created_at
    }

    upload_measurements {
        uuid id PK
        uuid test_result_id FK
        numeric file_size_mb
        numeric upload_speed_mbps
        numeric test_duration_seconds
        timestamptz created_at
    }

    system_metrics {
        uuid id PK
        varchar metric_key
        text metric_value
        varchar metric_type
        timestamptz updated_at
    }

    port_knowledge_base {
        uuid id PK
        integer port_number
        varchar protocol
        varchar service_name
        varchar risk_level
        text description
        text security_recommendation
        boolean is_common
        boolean is_unencrypted
        boolean is_common_exploit_target
        text exploit_notes
        timestamptz created_at
        timestamptz updated_at
    }

    port_scan_results {
        uuid id PK
        uuid test_result_id FK
        integer port_number
        varchar protocol
        varchar port_state
        varchar service_name
        varchar service_version
        varchar risk_level
        numeric scan_duration_ms
        timestamptz created_at
    }

    port_risk_assessments {
        uuid id PK
        uuid test_result_id FK
        integer overall_risk_score
        varchar security_status
        integer open_ports_count
        integer closed_ports_count
        integer filtered_ports_count
        varchar highest_risk_level
        text ai_security_summary
        timestamptz scan_started_at
        timestamptz scan_completed_at
        numeric scan_duration_seconds
        timestamptz created_at
        timestamptz updated_at
    }

    security_recommendations {
        uuid id PK
        uuid port_risk_assessment_id FK
        integer port_number
        varchar recommendation_type
        varchar priority
        varchar title
        text description
        text action_steps
        boolean is_resolved
        timestamptz resolved_at
        timestamptz created_at
    }
```

## Key Relationships:

1. **auth.users ↔ profiles**: One-to-One (each user has one profile)
2. **auth.users ↔ subscribers**: One-to-One/One-to-Many (each user can have subscriber record)
3. **auth.users ↔ test_results**: One-to-Many (one user runs many tests)
4. **test_results ↔ ping_measurements**: One-to-Many (one test has many ping samples)
5. **test_results ↔ anomaly_logs**: One-to-Many (one test has many anomalies)
6. **test_results ↔ download_measurements**: One-to-Many (one test has many download samples)
7. **test_results ↔ upload_measurements**: One-to-Many (one test has many upload samples)
8. **test_results ↔ port_scan_results**: One-to-Many (one test has many port scan results)
9. **test_results ↔ port_risk_assessments**: One-to-One/One-to-Many (one test can have a port risk assessment)
10. **port_risk_assessments ↔ security_recommendations**: One-to-Many (one assessment can have many recommendations)

## Additional Notes:
- All tables use UUIDs for primary keys
- Uses `auth.users` (Supabase Auth) for user management
- RLS policies ensure users only see their own data
- Port Risk Detection tables track port scans, risk scores, and security recommendations
- System Metrics table stores public stats like user count and uptime
