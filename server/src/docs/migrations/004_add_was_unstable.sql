-- Migration 004: Add was_unstable column to test_results
-- Tracks when speed test passes fluctuate beyond a 2.5x ratio (max/min),
-- indicating an erratic connection.

ALTER TABLE test_results
  ADD COLUMN IF NOT EXISTS was_unstable BOOLEAN DEFAULT FALSE;
