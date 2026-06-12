# CyberSecure Network Dashboard - Schema ER Diagram

```mermaid
erDiagram
    auth_users ||--o{ profiles : "has"
    auth_users ||--o{ test_results : "runs"
    test_results ||--o{ ping_measurements : "includes"
    test_results ||--o{ anomaly_logs : "has"

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

    test_results {
        uuid id PK
        uuid user_id FK
        numeric download_speed_mbps
        numeric upload_speed_mbps
        numeric ping_avg_ms
        numeric ping_min_ms
        numeric ping_max_ms
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
```

## Key Relationships:
1. **auth.users ↔ profiles**: One-to-One (each user has one profile)
2. **auth.users ↔ test_results**: One-to-Many (one user runs many tests)
3. **test_results ↔ ping_measurements**: One-to-Many (one test has many ping samples)
4. **test_results ↔ anomaly_logs**: One-to-Many (one test has many anomalies)

## Additional Notes:
- All tables use UUIDs for primary keys
- Uses `auth.users` (Supabase Auth) for user management
- RLS policies ensure users only see their own data
- `network_summary` view aggregates user test data
