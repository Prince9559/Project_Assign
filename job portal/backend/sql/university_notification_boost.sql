-- University Notification Boost — run once on your database.

CREATE TABLE IF NOT EXISTS university_notification_credits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  university_id INT NOT NULL,
  total_credits INT NOT NULL DEFAULT 1000,
  used_credits INT NOT NULL DEFAULT 0,
  remaining_credits INT NOT NULL DEFAULT 1000,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_univ_notif_credits_univ (university_id),
  CONSTRAINT fk_unc_univ FOREIGN KEY (university_id) REFERENCES university_details(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS university_notification_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  university_id INT NOT NULL,
  courses JSON NULL COMMENT 'Snapshot of course rows (JSON array)',
  industries JSON NULL COMMENT 'Snapshot: industry ids and names',
  message TEXT NULL,
  companies_targeted INT NOT NULL DEFAULT 0,
  credits_used INT NOT NULL DEFAULT 0,
  status ENUM('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
  progress JSON NULL COMMENT '{ total, notifications_sent, emails_sent, failed }',
  error_message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_unr_univ (university_id),
  KEY idx_unr_status (status),
  CONSTRAINT fk_unr_univ FOREIGN KEY (university_id) REFERENCES university_details(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS university_notification_courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  course_id INT NULL,
  course_name VARCHAR(255) NOT NULL,
  is_hiring TINYINT(1) NOT NULL DEFAULT 0,
  start_date DATE NULL,
  intake INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_unc_req (request_id),
  CONSTRAINT fk_unc_req FOREIGN KEY (request_id) REFERENCES university_notification_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS university_notification_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  company_id INT NOT NULL COMMENT 'company_recruiter_profiles.id',
  email_sent TINYINT(1) NOT NULL DEFAULT 0,
  notification_sent TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_unl_req (request_id),
  KEY idx_unl_company (company_id),
  CONSTRAINT fk_unl_req FOREIGN KEY (request_id) REFERENCES university_notification_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS university_notification_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  university_id INT NOT NULL,
  credits_added INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL COMMENT 'Total INR (incl. tax)',
  base_amount DECIMAL(12,2) NULL,
  tax_amount DECIMAL(12,2) NULL,
  razorpay_order_id VARCHAR(100) NULL,
  razorpay_payment_id VARCHAR(100) NULL,
  status ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_unp_univ (university_id),
  KEY idx_unp_rzp (razorpay_order_id),
  CONSTRAINT fk_unp_univ FOREIGN KEY (university_id) REFERENCES university_details(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
