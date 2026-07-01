-- =====================================================
-- AkovoLabs Speedtest
-- Phase 1 + research expansion:
-- Raw + aggregated data (balanced, not overkill)
-- Supabase Auth security
-- Zero-budget friendly performance
-- Real analytics + dashboard support
-- Safe for scaling later
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS PROFILE (Supabase Auth Integration)
-- =====================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. TEST RESULTS (MAIN AGGREGATED DATA)
-- =====================================================

CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- SPEED METRICS
    download_speed_mbps NUMERIC(10,2),
    upload_speed_mbps NUMERIC(10,2),

    -- LATENCY SUMMARY
    ping_avg_ms NUMERIC(10,2),
    ping_min_ms NUMERIC(10,2),
    ping_max_ms NUMERIC(10,2),
    jitter_ms NUMERIC(10,2),
    packet_loss_percent NUMERIC(5,2),

    -- NETWORK QUALITY
    dns_lookup_ms NUMERIC(10,2),
    server_response_ms NUMERIC(10,2),

    network_health_score INTEGER CHECK (network_health_score BETWEEN 0 AND 100),
    gaming_score INTEGER CHECK (gaming_score BETWEEN 0 AND 100),
    streaming_score INTEGER CHECK (streaming_score BETWEEN 0 AND 100),
    video_call_score INTEGER CHECK (video_call_score BETWEEN 0 AND 100),
    browsing_score INTEGER CHECK (browsing_score BETWEEN 0 AND 100),

    -- AI INSIGHTS (LIGHTWEIGHT)
    ai_summary TEXT,

    -- NETWORK CONTEXT
    isp_name VARCHAR(255),
    country VARCHAR(100),
    province VARCHAR(100),
    city VARCHAR(100),
    ip_address INET,
    device_type VARCHAR(50),
    browser_name VARCHAR(100),
    test_duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. RAW PING DATA (RESEARCH LAYER - SAFE)
-- =====================================================

CREATE TABLE ping_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_result_id UUID NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
    sequence_number INTEGER,
    latency_ms NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. ANOMALY LOGS (SECURITY + INSIGHTS)
-- =====================================================

CREATE TABLE anomaly_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_result_id UUID NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
    anomaly_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES (PERFORMANCE OPTIMIZATION)
-- =====================================================

CREATE INDEX idx_profiles_id ON profiles(id);
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_created_at ON test_results(created_at DESC);
CREATE INDEX idx_test_results_isp ON test_results(isp_name);
CREATE INDEX idx_ping_measurements_test_result ON ping_measurements(test_result_id);
CREATE INDEX idx_anomaly_logs_test_result ON anomaly_logs(test_result_id);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ping_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- =====================================================
-- TEST RESULTS POLICIES
-- =====================================================

CREATE POLICY "Users can view own test results"
ON test_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test results"
ON test_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own test results"
ON test_results FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- PING MEASUREMENTS POLICIES
-- =====================================================

CREATE POLICY "Users can view own ping data"
ON ping_measurements FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM test_results tr
        WHERE tr.id = ping_measurements.test_result_id
        AND tr.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert own ping data"
ON ping_measurements FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM test_results tr
        WHERE tr.id = ping_measurements.test_result_id
        AND tr.user_id = auth.uid()
    )
);

-- =====================================================
-- ANOMALY LOGS POLICIES
-- =====================================================

CREATE POLICY "Users can view own anomaly logs"
ON anomaly_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM test_results tr
        WHERE tr.id = anomaly_logs.test_result_id
        AND tr.user_id = auth.uid()
    )
);

-- =====================================================
-- ANALYTICS VIEW (DASHBOARD READY)
-- =====================================================

CREATE OR REPLACE VIEW network_summary AS
SELECT
    user_id,
    COUNT(*) AS total_tests,
    AVG(download_speed_mbps) AS avg_download_speed,
    AVG(upload_speed_mbps) AS avg_upload_speed,
    AVG(ping_avg_ms) AS avg_ping,
    AVG(jitter_ms) AS avg_jitter,
    AVG(packet_loss_percent) AS avg_packet_loss,
    AVG(network_health_score) AS avg_health_score
FROM test_results
GROUP BY user_id;

-- Supabase Trigger: Auto-Create Profile on User Signup
-- Run this in your Supabase SQL Editor
-- This automatically creates a profile entry when a new user signs up

-- First, create a function to handle the profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, created_at, updated_at)
  VALUES (NEW.id, (NEW.raw_user_meta_data->>'first_name'), (NEW.raw_user_meta_data->>'last_name'), NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Then, create the trigger that runs when a new user is inserted into auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Speed Module Database Schema Update
-- =====================================================

-- Add download speed test columns
ALTER TABLE test_results
ADD COLUMN IF NOT EXISTS download_test_size_mb NUMERIC(10,1),
ADD COLUMN IF NOT EXISTS download_test_duration_seconds NUMERIC(10,3);

-- Add upload speed test columns (for future use)
ALTER TABLE test_results
ADD COLUMN IF NOT EXISTS upload_test_size_mb NUMERIC(10,1),
ADD COLUMN IF NOT EXISTS upload_test_duration_seconds NUMERIC(10,3);

-- Add RLS policy for updating test results (PostgreSQL doesn't support IF NOT EXISTS for policies)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'test_results' 
    AND policyname = 'Users can update own test results'
  ) THEN
    CREATE POLICY "Users can update own test results"
    ON test_results FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- Download Measurements Table
-- =====================================================

CREATE TABLE IF NOT EXISTS download_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_result_id UUID NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
    file_size_mb NUMERIC(10,1) NOT NULL,
    download_speed_mbps NUMERIC(10,3) NOT NULL,
    test_duration_seconds NUMERIC(10,3) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_download_measurements_test_result_id ON download_measurements(test_result_id);

-- RLS Policies
ALTER TABLE download_measurements ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'download_measurements' 
        AND policyname = 'Users can view own download measurements'
    ) THEN
        CREATE POLICY "Users can view own download measurements"
        ON download_measurements FOR SELECT
        USING (
            EXISTS (
                SELECT 1
                FROM test_results tr
                WHERE tr.id = download_measurements.test_result_id
                AND tr.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'download_measurements' 
        AND policyname = 'Users can insert own download measurements'
    ) THEN
        CREATE POLICY "Users can insert own download measurements"
        ON download_measurements FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1
                FROM test_results tr
                WHERE tr.id = download_measurements.test_result_id
                AND tr.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- =====================================================
-- Upload Measurements Table
-- =====================================================

CREATE TABLE IF NOT EXISTS upload_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_result_id UUID NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
    file_size_mb NUMERIC(10,1) NOT NULL,
    upload_speed_mbps NUMERIC(10,3) NOT NULL,
    test_duration_seconds NUMERIC(10,3) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_upload_measurements_test_result_id ON upload_measurements(test_result_id);

-- RLS Policies
ALTER TABLE upload_measurements ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'upload_measurements' 
        AND policyname = 'Users can view own upload measurements'
    ) THEN
        CREATE POLICY "Users can view own upload measurements"
        ON upload_measurements FOR SELECT
        USING (
            EXISTS (
                SELECT 1
                FROM test_results tr
                WHERE tr.id = upload_measurements.test_result_id
                AND tr.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'upload_measurements' 
        AND policyname = 'Users can insert own upload measurements'
    ) THEN
        CREATE POLICY "Users can insert own upload measurements"
        ON upload_measurements FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1
                FROM test_results tr
                WHERE tr.id = upload_measurements.test_result_id
                AND tr.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- =====================================================
-- Speed Module Schema Fix: Change size columns to NUMERIC
-- =====================================================

-- Update test_results table
ALTER TABLE test_results
ALTER COLUMN download_test_size_mb TYPE NUMERIC(10,1);

ALTER TABLE test_results
ALTER COLUMN upload_test_size_mb TYPE NUMERIC(10,1);

-- Update download_measurements table
ALTER TABLE download_measurements
ALTER COLUMN file_size_mb TYPE NUMERIC(10,1);

-- Update upload_measurements table
ALTER TABLE upload_measurements
ALTER COLUMN file_size_mb TYPE NUMERIC(10,1);

-- =====================================================
-- OPTIONAL: Analytics Optimization Queries
-- These are NOT required for the analytics layer to work!
-- Use these only if you have millions of test results
-- =====================================================

-- 1. Materialized View for Fast Overview
-- Refresh occasionally for better performance
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_network_overview AS
SELECT
    user_id,
    COUNT(*) AS total_tests,
    AVG(download_speed_mbps) AS avg_download_mbps,
    AVG(upload_speed_mbps) AS avg_upload_mbps,
    AVG(ping_avg_ms) AS avg_ping_ms,
    AVG(jitter_ms) AS avg_jitter_ms,
    AVG(packet_loss_percent) AS avg_packet_loss_percent,
    MAX(network_health_score) AS best_network_health_score,
    MIN(network_health_score) AS worst_network_health_score
FROM test_results
GROUP BY user_id;

CREATE INDEX IF NOT EXISTS idx_mv_overview_user_id ON mv_user_network_overview(user_id);

-- How to refresh the materialized view:
-- REFRESH MATERIALIZED VIEW mv_user_network_overview;

-- 2. Materialized View for Fast History
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_daily_history AS
SELECT
    user_id,
    DATE(created_at) AS date,
    AVG(download_speed_mbps) AS avg_download,
    AVG(upload_speed_mbps) AS avg_upload,
    AVG(ping_avg_ms) AS avg_ping,
    AVG(network_health_score) AS avg_health_score
FROM test_results
GROUP BY user_id, DATE(created_at);

CREATE INDEX IF NOT EXISTS idx_mv_history_user_date ON mv_user_daily_history(user_id, date);

-- =====================================================
-- Ping Accuracy Step 1
-- Improve HTTP-based ping observability without changing
-- the overall speed-test architecture yet.
-- =====================================================

BEGIN;

-- =====================================================
-- Test Result Enhancements
-- =====================================================

ALTER TABLE test_results
ADD COLUMN IF NOT EXISTS ping_median_ms NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS probe_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS probe_target VARCHAR(255),
ADD COLUMN IF NOT EXISTS probe_sample_count INTEGER,
ADD COLUMN IF NOT EXISTS successful_probe_count INTEGER,
ADD COLUMN IF NOT EXISTS failed_probe_count INTEGER;

-- Backfill new summary metadata for existing rows where possible.
UPDATE test_results tr
SET
    probe_method = COALESCE(tr.probe_method, 'http-health'),
    probe_sample_count = COALESCE(tr.probe_sample_count, stats.total_count, 0),
    successful_probe_count = COALESCE(tr.successful_probe_count, stats.success_count, 0),
    failed_probe_count = COALESCE(tr.failed_probe_count, stats.failure_count, 0),
    ping_median_ms = COALESCE(tr.ping_median_ms, stats.median_latency)
FROM (
    SELECT
        pm.test_result_id,
        COUNT(*) AS total_count,
        COUNT(*) FILTER (WHERE COALESCE(pm.latency_ms, 0) > 0) AS success_count,
        COUNT(*) FILTER (WHERE COALESCE(pm.latency_ms, 0) <= 0) AS failure_count,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY pm.latency_ms)
            FILTER (WHERE COALESCE(pm.latency_ms, 0) > 0) AS median_latency
    FROM ping_measurements pm
    GROUP BY pm.test_result_id
) AS stats
WHERE tr.id = stats.test_result_id;

-- =====================================================
-- Ping Measurement Enhancements
-- =====================================================

ALTER TABLE ping_measurements
ADD COLUMN IF NOT EXISTS success BOOLEAN,
ADD COLUMN IF NOT EXISTS failure_reason VARCHAR(100);

-- Backfill success state for historical rows.
UPDATE ping_measurements
SET
    success = COALESCE(success, COALESCE(latency_ms, 0) > 0),
    failure_reason = CASE
        WHEN failure_reason IS NOT NULL THEN failure_reason
        WHEN COALESCE(latency_ms, 0) > 0 THEN NULL
        ELSE 'request_failed'
    END;

COMMIT;


-- =====================================================
-- Score Honesty Step 2
-- Make derived score provenance explicit and persist
-- confidence metadata for UI/API consumers.
-- =====================================================

BEGIN;

ALTER TABLE test_results
ADD COLUMN IF NOT EXISTS score_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS score_confidence_label VARCHAR(20),
ADD COLUMN IF NOT EXISTS score_confidence_value NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS score_explanation TEXT;

UPDATE test_results
SET
    score_method = COALESCE(score_method, 'derived-estimate'),
    score_confidence_label = COALESCE(score_confidence_label, 'medium'),
    score_confidence_value = COALESCE(score_confidence_value, 60),
    score_explanation = COALESCE(
        score_explanation,
        'Scores are estimated from measured throughput plus HTTP probe latency rather than true ICMP latency.'
    )
WHERE
    network_health_score IS NOT NULL
    OR gaming_score IS NOT NULL
    OR streaming_score IS NOT NULL
    OR video_call_score IS NOT NULL
    OR browsing_score IS NOT NULL;

COMMIT;


-- =====================================================
-- 5. SUBSCRIBERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'unsubscribed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for subscribers table
CREATE INDEX IF NOT EXISTS idx_subscribers_id ON subscribers(id);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);

-- Enable RLS on subscribers table
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Subscribers Policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'subscribers' 
        AND policyname = 'Users can view own subscriber data'
    ) THEN
        CREATE POLICY "Users can view own subscriber data"
        ON subscribers FOR SELECT
        USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'subscribers' 
        AND policyname = 'Users can insert own subscriber data'
    ) THEN
        CREATE POLICY "Users can insert own subscriber data"
        ON subscribers FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'subscribers' 
        AND policyname = 'Users can update own subscriber data'
    ) THEN
        CREATE POLICY "Users can update own subscriber data"
        ON subscribers FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'subscribers' 
        AND policyname = 'Users can delete own subscriber data'
    ) THEN
        CREATE POLICY "Users can delete own subscriber data"
        ON subscribers FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Trigger for updated_at on subscribers table
CREATE TRIGGER trg_subscribers_updated_at
BEFORE UPDATE ON subscribers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- Phase 3: System Metrics for About Page
-- Public stats (users count, uptime, etc.)
-- =====================================================

-- System Metrics Table
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_key VARCHAR(100) UNIQUE NOT NULL,
    metric_value TEXT NOT NULL,
    metric_type VARCHAR(20) DEFAULT 'string', -- string, number, date
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_system_metrics_key ON system_metrics(metric_key);

-- Insert initial metrics
INSERT INTO system_metrics (metric_key, metric_value, metric_type) VALUES
('founded_year', '2026', 'number'),
('uptime_percentage', '99.9', 'number')
ON CONFLICT (metric_key) DO NOTHING;

-- =====================================================
-- Function to Update User Count Automatically
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_count_metric()
RETURNS VOID AS $$
BEGIN
    INSERT INTO system_metrics (metric_key, metric_value, metric_type, updated_at)
    VALUES (
        'total_users',
        (SELECT COUNT(*)::TEXT FROM auth.users),
        'number',
        NOW()
    )
    ON CONFLICT (metric_key) DO UPDATE 
    SET 
        metric_value = EXCLUDED.metric_value,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function to Update Countries Count Automatically
-- =====================================================
CREATE OR REPLACE FUNCTION update_countries_count_metric()
RETURNS VOID AS $$
BEGIN
    INSERT INTO system_metrics (metric_key, metric_value, metric_type, updated_at)
    VALUES (
        'countries_count',
        (SELECT COUNT(DISTINCT country)::TEXT FROM test_results WHERE country IS NOT NULL),
        'number',
        NOW()
    )
    ON CONFLICT (metric_key) DO UPDATE 
    SET 
        metric_value = EXCLUDED.metric_value,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Trigger to Update Metrics When Profiles Change
-- =====================================================
CREATE OR REPLACE FUNCTION handle_profile_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_user_count_metric();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auth.users (but note: triggers on auth.users require service role)
-- For now, we'll update metrics via backend endpoint
-- We can also refresh periodically

-- =====================================================
-- RLS for System Metrics (Public Read, Admin Only Write)
-- =====================================================
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- Allow public to read metrics
CREATE POLICY "Public can view system metrics"
ON system_metrics FOR SELECT
USING (true);

-- =====================================================
-- Optional: Materialized View for Fast Stats
-- =====================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public_stats AS
SELECT
    (SELECT metric_value::INTEGER FROM system_metrics WHERE metric_key = 'total_users') AS total_users,
    (SELECT metric_value::INTEGER FROM system_metrics WHERE metric_key = 'countries_count') AS countries_count,
    (SELECT metric_value::NUMERIC FROM system_metrics WHERE metric_key = 'uptime_percentage') AS uptime_percentage,
    (SELECT metric_value::INTEGER FROM system_metrics WHERE metric_key = 'founded_year') AS founded_year;

-- =====================================================
-- Phase 3: System Metrics for About Page
-- Public stats (users, uptime, etc.)
-- =====================================================

-- System Metrics Table
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_key VARCHAR(100) UNIQUE NOT NULL,
    metric_value TEXT NOT NULL,
    metric_type VARCHAR(20) DEFAULT 'string', -- string, number, date
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_system_metrics_key ON system_metrics(metric_key);

-- =====================================================
-- RLS for System Metrics (Public Read)
-- =====================================================
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- Allow public to read metrics
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'system_metrics' 
        AND policyname = 'Public can view system metrics'
    ) THEN
        CREATE POLICY "Public can view system metrics"
        ON system_metrics FOR SELECT
        USING (true);
    END IF;
END $$;

-- Allow authenticated users to insert metrics
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'system_metrics' 
        AND policyname = 'Authenticated users can insert metrics'
    ) THEN
        CREATE POLICY "Authenticated users can insert metrics"
        ON system_metrics FOR INSERT
        WITH CHECK (true);
    END IF;
END $$;

-- Allow authenticated users to update metrics
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'system_metrics' 
        AND policyname = 'Authenticated users can update metrics'
    ) THEN
        CREATE POLICY "Authenticated users can update metrics"
        ON system_metrics FOR UPDATE
        USING (true);
    END IF;
END $$;

-- =====================================================
-- Phase Two: Port Risk Detection Schema
-- Port scan results, risk scores, and security analysis
-- =====================================================

-- =====================================================
-- 1. PORT KNOWLEDGE BASE (Reference Data)
-- This contains known ports, services, and risk levels
-- =====================================================

CREATE TABLE IF NOT EXISTS port_knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    port_number INTEGER NOT NULL,
    protocol VARCHAR(10) NOT NULL DEFAULT 'tcp', -- tcp, udp
    service_name VARCHAR(100),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    security_recommendation TEXT,
    is_common BOOLEAN DEFAULT true,
    is_unencrypted BOOLEAN DEFAULT false,
    is_common_exploit_target BOOLEAN DEFAULT false,
    exploit_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by port/protocol
CREATE INDEX IF NOT EXISTS idx_port_kb_port_protocol ON port_knowledge_base(port_number, protocol);
CREATE INDEX IF NOT EXISTS idx_port_kb_risk_level ON port_knowledge_base(risk_level);

-- =====================================================
-- 2. PORT SCAN RESULTS (Detailed Port States)
-- Stores individual port scan results per test
-- =====================================================

CREATE TABLE IF NOT EXISTS port_scan_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_result_id UUID NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
    port_number INTEGER NOT NULL,
    protocol VARCHAR(10) NOT NULL DEFAULT 'tcp',
    port_state VARCHAR(20) NOT NULL CHECK (port_state IN ('open', 'closed', 'filtered')),
    service_name VARCHAR(100),
    service_version VARCHAR(100),
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    scan_duration_ms NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_port_scan_test_result ON port_scan_results(test_result_id);
CREATE INDEX IF NOT EXISTS idx_port_scan_port ON port_scan_results(port_number);
CREATE INDEX IF NOT EXISTS idx_port_scan_state ON port_scan_results(port_state);

-- =====================================================
-- 3. PORT RISK ASSESSMENT (Aggregated Risk Score)
-- Stores overall port risk assessment per test result
-- =====================================================

CREATE TABLE IF NOT EXISTS port_risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_result_id UUID NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
    overall_risk_score INTEGER NOT NULL CHECK (overall_risk_score BETWEEN 0 AND 100),
    security_status VARCHAR(50) NOT NULL, -- excellent, good, moderate, high, critical
    open_ports_count INTEGER DEFAULT 0,
    closed_ports_count INTEGER DEFAULT 0,
    filtered_ports_count INTEGER DEFAULT 0,
    highest_risk_level VARCHAR(20) CHECK (highest_risk_level IN ('low', 'medium', 'high', 'critical')),
    ai_security_summary TEXT,
    scan_started_at TIMESTAMPTZ,
    scan_completed_at TIMESTAMPTZ,
    scan_duration_seconds NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_port_risk_test_result ON port_risk_assessments(test_result_id);
CREATE INDEX IF NOT EXISTS idx_port_risk_score ON port_risk_assessments(overall_risk_score);
CREATE INDEX IF NOT EXISTS idx_port_risk_status ON port_risk_assessments(security_status);

-- =====================================================
-- 4. SECURITY RECOMMENDATIONS (Per Assessment)
-- Stores actionable security recommendations
-- =====================================================

CREATE TABLE IF NOT EXISTS security_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    port_risk_assessment_id UUID NOT NULL REFERENCES port_risk_assessments(id) ON DELETE CASCADE,
    port_number INTEGER,
    recommendation_type VARCHAR(100) NOT NULL, -- firewall_config, service_disable, patch, etc.
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    action_steps TEXT,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_recs_assessment ON security_recommendations(port_risk_assessment_id);
CREATE INDEX IF NOT EXISTS idx_security_recs_priority ON security_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_security_recs_port ON security_recommendations(port_number);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE port_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE port_scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE port_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_recommendations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PORT KNOWLEDGE BASE POLICIES (Public Read)
-- =====================================================

-- Allow public to read port knowledge base (reference data)
CREATE POLICY "Public can read port knowledge base"
ON port_knowledge_base FOR SELECT
USING (true);

-- =====================================================
-- PORT SCAN RESULTS POLICIES
-- =====================================================

-- Users can view their own port scan results
CREATE POLICY "Users can view own port scan results"
ON port_scan_results FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM test_results tr
        WHERE tr.id = port_scan_results.test_result_id
        AND tr.user_id = auth.uid()
    )
);

-- Users can insert their own port scan results
CREATE POLICY "Users can insert own port scan results"
ON port_scan_results FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM test_results tr
        WHERE tr.id = port_scan_results.test_result_id
        AND tr.user_id = auth.uid()
    )
);

-- =====================================================
-- PORT RISK ASSESSMENTS POLICIES
-- =====================================================

-- Users can view their own port risk assessments
CREATE POLICY "Users can view own port risk assessments"
ON port_risk_assessments FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM test_results tr
        WHERE tr.id = port_risk_assessments.test_result_id
        AND tr.user_id = auth.uid()
    )
);

-- Users can insert their own port risk assessments
CREATE POLICY "Users can insert own port risk assessments"
ON port_risk_assessments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM test_results tr
        WHERE tr.id = port_risk_assessments.test_result_id
        AND tr.user_id = auth.uid()
    )
);

-- Users can update their own port risk assessments
CREATE POLICY "Users can update own port risk assessments"
ON port_risk_assessments FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM test_results tr
        WHERE tr.id = port_risk_assessments.test_result_id
        AND tr.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM test_results tr
        WHERE tr.id = port_risk_assessments.test_result_id
        AND tr.user_id = auth.uid()
    )
);

-- =====================================================
-- SECURITY RECOMMENDATIONS POLICIES
-- =====================================================

-- Users can view their own security recommendations
CREATE POLICY "Users can view own security recommendations"
ON security_recommendations FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM port_risk_assessments pra
        JOIN test_results tr ON pra.test_result_id = tr.id
        WHERE pra.id = security_recommendations.port_risk_assessment_id
        AND tr.user_id = auth.uid()
    )
);

-- Users can insert their own security recommendations
CREATE POLICY "Users can insert own security recommendations"
ON security_recommendations FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM port_risk_assessments pra
        JOIN test_results tr ON pra.test_result_id = tr.id
        WHERE pra.id = security_recommendations.port_risk_assessment_id
        AND tr.user_id = auth.uid()
    )
);

-- Users can update their own security recommendations
CREATE POLICY "Users can update own security recommendations"
ON security_recommendations FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM port_risk_assessments pra
        JOIN test_results tr ON pra.test_result_id = tr.id
        WHERE pra.id = security_recommendations.port_risk_assessment_id
        AND tr.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM port_risk_assessments pra
        JOIN test_results tr ON pra.test_result_id = tr.id
        WHERE pra.id = security_recommendations.port_risk_assessment_id
        AND tr.user_id = auth.uid()
    )
);

-- =====================================================
-- UPDATE_UPDATED_AT TRIGGERS
-- =====================================================

-- Trigger for port_knowledge_base
CREATE TRIGGER trg_port_knowledge_base_updated_at
BEFORE UPDATE ON port_knowledge_base
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger for port_risk_assessments
CREATE TRIGGER trg_port_risk_assessments_updated_at
BEFORE UPDATE ON port_risk_assessments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- INITIALIZE PORT KNOWLEDGE BASE DATA
-- Common ports and services with risk levels
-- =====================================================

INSERT INTO port_knowledge_base (port_number, protocol, service_name, risk_level, description, security_recommendation, is_common, is_unencrypted, is_common_exploit_target, exploit_notes) VALUES
(20, 'tcp', 'FTP-Data', 'medium', 'File Transfer Protocol - Data (unencrypted)', 'Use SFTP instead of FTP for secure file transfers', true, true, false, null),
(21, 'tcp', 'FTP', 'medium', 'File Transfer Protocol (unencrypted)', 'Use SFTP instead of FTP for secure file transfers', true, true, false, null),
(22, 'tcp', 'SSH', 'medium', 'Secure Shell - Remote administration', 'Use SSH keys for authentication, disable password login if possible, restrict source IPs', true, false, false, null),
(23, 'tcp', 'Telnet', 'critical', 'Telnet - Unencrypted remote administration', 'Disable Telnet immediately and use SSH instead', true, true, true, 'Unencrypted credentials and commands'),
(25, 'tcp', 'SMTP', 'medium', 'Simple Mail Transfer Protocol', 'Configure TLS/SSL, use SMTP authentication, consider relay restrictions', true, false, false, null),
(53, 'tcp', 'DNS', 'low', 'Domain Name System (TCP)', 'Restrict DNS queries to trusted servers, enable DNSSEC if possible', true, false, false, null),
(80, 'tcp', 'HTTP', 'low', 'Hypertext Transfer Protocol (unencrypted)', 'Redirect HTTP to HTTPS for all traffic', true, true, false, null),
(110, 'tcp', 'POP3', 'high', 'Post Office Protocol v3 (unencrypted)', 'Use POP3S (POP3 over TLS) or IMAPS instead', true, true, false, null),
(143, 'tcp', 'IMAP', 'high', 'Internet Message Access Protocol (unencrypted)', 'Use IMAPS (IMAP over TLS) instead', true, true, false, null),
(443, 'tcp', 'HTTPS', 'low', 'Hypertext Transfer Protocol Secure', 'Keep TLS updated, use strong ciphers, consider HSTS', true, false, false, null),
(445, 'tcp', 'SMB', 'critical', 'Server Message Block - Windows file sharing', 'Disable public SMB exposure, restrict to internal networks only', true, false, true, 'EternalBlue, WannaCry, NotPetya'),
(993, 'tcp', 'IMAPS', 'low', 'IMAP over SSL/TLS', 'Ensure TLS configuration is secure and up-to-date', true, false, false, null),
(995, 'tcp', 'POP3S', 'low', 'POP3 over SSL/TLS', 'Ensure TLS configuration is secure and up-to-date', true, false, false, null),
(1433, 'tcp', 'SQL Server', 'high', 'Microsoft SQL Server', 'Restrict access to trusted IPs, use strong passwords, enable encryption', true, false, true, 'Common brute-force and injection target'),
(3306, 'tcp', 'MySQL', 'high', 'MySQL Database', 'Restrict access to trusted IPs, use strong passwords, enable SSL', true, false, true, 'Common brute-force and injection target'),
(3389, 'tcp', 'RDP', 'high', 'Remote Desktop Protocol', 'Restrict access via VPN/firewall, enable Network Level Authentication, use strong passwords', true, false, true, 'BlueKeep, DejaBlue, brute-force attacks'),
(5432, 'tcp', 'PostgreSQL', 'high', 'PostgreSQL Database', 'Restrict access to trusted IPs, use strong passwords, enable SSL', true, false, true, 'Common brute-force and injection target'),
(5900, 'tcp', 'VNC', 'high', 'Virtual Network Computing', 'Use VNC over SSH tunnel or VPN, set strong passwords', true, false, true, 'Common brute-force target'),
(8080, 'tcp', 'HTTP-Proxy', 'medium', 'HTTP Proxy/Alternative HTTP', 'If used internally, restrict to internal networks; consider HTTPS', true, true, false, null)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Migration: Fix Security Definer View for public.network_summary
-- =====================================================
-- Issue:
--   Supabase flagged `public.network_summary` because views are
--   security definer by default and can bypass underlying table RLS.
--
-- Fix:
--   Recreate the view with `security_invoker = true` so reads honor
--   the caller's permissions and the existing RLS policies on
--   `public.test_results`.
-- =====================================================

BEGIN;

CREATE OR REPLACE VIEW public.network_summary
WITH (security_invoker = true) AS
SELECT
    tr.user_id,
    COUNT(*) AS total_tests,
    AVG(tr.download_speed_mbps) AS avg_download_speed,
    AVG(tr.upload_speed_mbps) AS avg_upload_speed,
    AVG(tr.ping_avg_ms) AS avg_ping,
    AVG(tr.jitter_ms) AS avg_jitter,
    AVG(tr.packet_loss_percent) AS avg_packet_loss,
    AVG(tr.network_health_score) AS avg_health_score
FROM public.test_results AS tr
GROUP BY tr.user_id;

COMMENT ON VIEW public.network_summary IS
'Aggregated per-user network metrics. Uses security_invoker so public.test_results RLS is enforced for the querying role.';

COMMIT;
