-- Optional: many-to-many industries per company recruiter profile.
-- Run once if you want extra industry tags beyond company_recruiter_profiles.industry_id.
-- The notification boost API uses profile.industry_id OR this mapping.

CREATE TABLE IF NOT EXISTS company_industries (
  company_id INT NOT NULL COMMENT 'company_recruiter_profiles.id',
  industry_id INT NOT NULL,
  PRIMARY KEY (company_id, industry_id),
  KEY idx_ci_industry (industry_id),
  CONSTRAINT fk_ci_company FOREIGN KEY (company_id) REFERENCES company_recruiter_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_ci_industry FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Backfill from primary industry on profiles (idempotent)
INSERT IGNORE INTO company_industries (company_id, industry_id)
SELECT id, industry_id
FROM company_recruiter_profiles
WHERE industry_id IS NOT NULL;
