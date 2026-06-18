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
