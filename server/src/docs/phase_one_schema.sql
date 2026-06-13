-- =====================================================
-- CyberSecure Network Dashboard
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
