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
