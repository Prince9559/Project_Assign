ALTER TABLE educations
  ADD COLUMN approval_status ENUM('approved', 'pending', 'rejected') NOT NULL DEFAULT 'approved',
  ADD COLUMN removed_by_university TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN removal_reason TEXT NULL,
  ADD COLUMN proof_document VARCHAR(255) NULL,
  ADD COLUMN reapproval_requested TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN approved_by_university_id INT NULL;
