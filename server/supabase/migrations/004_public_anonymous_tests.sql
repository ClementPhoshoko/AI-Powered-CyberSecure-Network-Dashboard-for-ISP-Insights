-- Make user_id nullable in test_results for anonymous/public tests
ALTER TABLE test_results ALTER COLUMN user_id DROP NOT NULL;

-- Add anonymous_session_id column for tracking without auth
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS anonymous_session_id UUID;

-- Index for querying by anonymous session
CREATE INDEX IF NOT EXISTS idx_test_results_anonymous_session ON test_results(anonymous_session_id);
