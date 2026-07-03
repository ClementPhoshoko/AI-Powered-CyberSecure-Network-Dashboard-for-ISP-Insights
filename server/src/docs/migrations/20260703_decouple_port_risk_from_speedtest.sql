-- =====================================================
-- Migration: Decouple standalone port-risk scans from speedtest test_results
-- Date: 2026-07-03
-- =====================================================

BEGIN;

-- 1) Add explicit owner on assessments (separate from speedtest linkage)
ALTER TABLE public.port_risk_assessments
ADD COLUMN IF NOT EXISTS user_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'port_risk_assessments_user_id_fkey'
  ) THEN
    ALTER TABLE public.port_risk_assessments
    ADD CONSTRAINT port_risk_assessments_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Backfill owner from linked speedtest rows
UPDATE public.port_risk_assessments pra
SET user_id = tr.user_id
FROM public.test_results tr
WHERE pra.user_id IS NULL
  AND pra.test_result_id = tr.id;

CREATE INDEX IF NOT EXISTS idx_port_risk_user_id
  ON public.port_risk_assessments(user_id);

-- 2) Allow standalone assessments that are not tied to test_results
ALTER TABLE public.port_risk_assessments
ALTER COLUMN test_result_id DROP NOT NULL;

-- 3) Link scan results directly to their assessment
ALTER TABLE public.port_scan_results
ADD COLUMN IF NOT EXISTS port_risk_assessment_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'port_scan_results_port_risk_assessment_id_fkey'
  ) THEN
    ALTER TABLE public.port_scan_results
    ADD CONSTRAINT port_scan_results_port_risk_assessment_id_fkey
    FOREIGN KEY (port_risk_assessment_id)
    REFERENCES public.port_risk_assessments(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Backfill direct assessment relation from existing test_result linkage.
-- If multiple assessments exist for the same test_result_id, use the latest one.
WITH latest_assessment_per_test AS (
  SELECT DISTINCT ON (test_result_id)
    test_result_id,
    id AS assessment_id
  FROM public.port_risk_assessments
  WHERE test_result_id IS NOT NULL
  ORDER BY test_result_id, created_at DESC, id DESC
)
UPDATE public.port_scan_results psr
SET port_risk_assessment_id = lat.assessment_id
FROM latest_assessment_per_test lat
WHERE psr.port_risk_assessment_id IS NULL
  AND psr.test_result_id = lat.test_result_id;

CREATE INDEX IF NOT EXISTS idx_port_scan_assessment
  ON public.port_scan_results(port_risk_assessment_id);

-- Keep backward compatibility for linked assessments, but allow standalone scans
ALTER TABLE public.port_scan_results
ALTER COLUMN test_result_id DROP NOT NULL;

-- 4) RLS updates for standalone support
DROP POLICY IF EXISTS "Users can view own port scan results" ON public.port_scan_results;
DROP POLICY IF EXISTS "Users can insert own port scan results" ON public.port_scan_results;

CREATE POLICY "Users can view own port scan results"
ON public.port_scan_results FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.port_risk_assessments pra
    WHERE pra.id = port_scan_results.port_risk_assessment_id
      AND pra.user_id = auth.uid()
  )
  OR (
    port_scan_results.test_result_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.test_results tr
      WHERE tr.id = port_scan_results.test_result_id
        AND tr.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert own port scan results"
ON public.port_scan_results FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.port_risk_assessments pra
    WHERE pra.id = port_scan_results.port_risk_assessment_id
      AND pra.user_id = auth.uid()
  )
  OR (
    port_scan_results.test_result_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.test_results tr
      WHERE tr.id = port_scan_results.test_result_id
        AND tr.user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can view own port risk assessments" ON public.port_risk_assessments;
DROP POLICY IF EXISTS "Users can insert own port risk assessments" ON public.port_risk_assessments;
DROP POLICY IF EXISTS "Users can update own port risk assessments" ON public.port_risk_assessments;

CREATE POLICY "Users can view own port risk assessments"
ON public.port_risk_assessments FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own port risk assessments"
ON public.port_risk_assessments FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own port risk assessments"
ON public.port_risk_assessments FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own security recommendations" ON public.security_recommendations;
DROP POLICY IF EXISTS "Users can insert own security recommendations" ON public.security_recommendations;
DROP POLICY IF EXISTS "Users can update own security recommendations" ON public.security_recommendations;

CREATE POLICY "Users can view own security recommendations"
ON public.security_recommendations FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.port_risk_assessments pra
    WHERE pra.id = security_recommendations.port_risk_assessment_id
      AND pra.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own security recommendations"
ON public.security_recommendations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.port_risk_assessments pra
    WHERE pra.id = security_recommendations.port_risk_assessment_id
      AND pra.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own security recommendations"
ON public.security_recommendations FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.port_risk_assessments pra
    WHERE pra.id = security_recommendations.port_risk_assessment_id
      AND pra.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.port_risk_assessments pra
    WHERE pra.id = security_recommendations.port_risk_assessment_id
      AND pra.user_id = auth.uid()
  )
);

COMMIT;
