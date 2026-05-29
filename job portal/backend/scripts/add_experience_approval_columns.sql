ALTER TABLE experiences
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS removed_by_company BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS removal_reason TEXT,
ADD COLUMN IF NOT EXISTS proof_document VARCHAR(255),
ADD COLUMN IF NOT EXISTS reapproval_requested BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approved_by_company_id INTEGER;

ALTER TABLE experiences
DROP CONSTRAINT IF EXISTS experiences_approval_status_check;

ALTER TABLE experiences
ADD CONSTRAINT experiences_approval_status_check
CHECK (approval_status IN ('approved', 'pending', 'rejected'));
