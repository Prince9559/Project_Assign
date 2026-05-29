-- Demo seed for Company Employee Management UI
-- Run this after running add_experience_approval_columns.sql
-- PostgreSQL script

-- 1) Pick one company profile (first row) as active demo company
WITH demo_company AS (
  SELECT id
  FROM company_recruiter_profiles
  ORDER BY id
  LIMIT 1
),
-- 2) Pick up to 3 existing experiences to convert into demo states
picked_experiences AS (
  SELECT e.id, ROW_NUMBER() OVER (ORDER BY e.id) AS rn
  FROM experiences e
  WHERE e.user_detail_id IS NOT NULL
  ORDER BY e.id
  LIMIT 3
)
UPDATE experiences e
SET
  company_id = dc.id,
  company_recruiter_profile_id = dc.id,
  job_role_id = COALESCE(
    e.job_role_id,
    (SELECT id FROM job_roles ORDER BY id LIMIT 1)
  ),
  start_date = COALESCE(e.start_date, DATE '2022-01-01'),
  end_date = CASE
    WHEN pe.rn = 1 THEN NULL
    WHEN pe.rn = 2 THEN (CURRENT_DATE + INTERVAL '1 year')::date
    ELSE DATE '2023-12-31'
  END,
  approval_status = CASE
    WHEN pe.rn = 1 THEN 'approved'
    WHEN pe.rn = 2 THEN 'pending'
    ELSE 'rejected'
  END,
  removed_by_company = CASE WHEN pe.rn = 3 THEN true ELSE false END,
  removal_reason = CASE
    WHEN pe.rn = 3 THEN 'Demo: Rejected by company for verification mismatch'
    ELSE NULL
  END,
  proof_document = CASE
    WHEN pe.rn = 2 THEN 'uploads/demo/proof-sample.pdf'
    ELSE NULL
  END,
  reapproval_requested = CASE WHEN pe.rn = 2 THEN true ELSE false END,
  approved_by_company_id = dc.id,
  updated_at = NOW()
FROM picked_experiences pe
CROSS JOIN demo_company dc
WHERE e.id = pe.id;

-- 3) If experiences are empty/minimal, insert fallback demo rows (up to 3 users)
WITH demo_company AS (
  SELECT id
  FROM company_recruiter_profiles
  ORDER BY id
  LIMIT 1
),
demo_users AS (
  SELECT ud.id AS user_detail_id, ROW_NUMBER() OVER (ORDER BY ud.id) AS rn
  FROM user_details ud
  ORDER BY ud.id
  LIMIT 3
)
INSERT INTO experiences (
  user_detail_id,
  company_recruiter_profile_id,
  start_date,
  end_date,
  job_role_id,
  company_id,
  organization_name,
  status,
  approval_status,
  removed_by_company,
  removal_reason,
  proof_document,
  reapproval_requested,
  approved_by_company_id,
  created_at,
  updated_at
)
SELECT
  du.user_detail_id,
  dc.id,
  DATE '2022-01-01',
  CASE
    WHEN du.rn = 1 THEN NULL
    WHEN du.rn = 2 THEN (CURRENT_DATE + INTERVAL '1 year')::date
    ELSE DATE '2023-12-31'
  END,
  (SELECT id FROM job_roles ORDER BY id LIMIT 1),
  dc.id,
  NULL,
  'approved',
  CASE
    WHEN du.rn = 1 THEN 'approved'
    WHEN du.rn = 2 THEN 'pending'
    ELSE 'rejected'
  END,
  CASE WHEN du.rn = 3 THEN true ELSE false END,
  CASE
    WHEN du.rn = 3 THEN 'Demo: Rejected by company for verification mismatch'
    ELSE NULL
  END,
  CASE
    WHEN du.rn = 2 THEN 'uploads/demo/proof-sample.pdf'
    ELSE NULL
  END,
  CASE WHEN du.rn = 2 THEN true ELSE false END,
  dc.id,
  NOW(),
  NOW()
FROM demo_users du
CROSS JOIN demo_company dc
WHERE NOT EXISTS (
  SELECT 1
  FROM experiences e
  WHERE e.user_detail_id = du.user_detail_id
    AND (e.company_id = dc.id OR e.company_recruiter_profile_id = dc.id)
);

-- 4) Quick check output
SELECT
  e.id,
  ud.first_name,
  ud.last_name,
  jr.title AS role,
  EXTRACT(YEAR FROM e.start_date)::int AS start_year,
  EXTRACT(YEAR FROM e.end_date)::int AS end_year,
  e.approval_status,
  e.removed_by_company,
  e.reapproval_requested
FROM experiences e
LEFT JOIN user_details ud ON ud.id = e.user_detail_id
LEFT JOIN job_roles jr ON jr.id = e.job_role_id
WHERE e.company_id IS NOT NULL OR e.company_recruiter_profile_id IS NOT NULL
ORDER BY e.updated_at DESC
LIMIT 20;
