-- AI Prediction learning pathway: step definitions + per-user progress (run once on MySQL)

CREATE TABLE IF NOT EXISTS ai_pathway_steps (
  id INT NOT NULL AUTO_INCREMENT,
  pathway_id INT NOT NULL COMMENT 'user_pathways.pathway_id',
  pathway_step_id INT NULL COMMENT 'pathway_steps.step_id when synced from generated pathway',
  step_title VARCHAR(500) NOT NULL,
  resource_title VARCHAR(500) NULL,
  resource_type ENUM('job', 'internship', 'project', 'course') NOT NULL,
  resource_link TEXT NULL,
  description TEXT NULL,
  platform_source VARCHAR(255) NULL,
  duration_label VARCHAR(255) NULL,
  skills JSON NULL,
  sub_skills JSON NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ai_steps_pathway (pathway_id),
  KEY idx_ai_steps_order (pathway_id, order_index),
  UNIQUE KEY uq_pathway_step (pathway_step_id),
  CONSTRAINT fk_ai_steps_pathway
    FOREIGN KEY (pathway_id) REFERENCES user_pathways (pathway_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_pathway_progress (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  pathway_id INT NOT NULL,
  step_id INT NOT NULL COMMENT 'ai_pathway_steps.id',
  status ENUM('pending', 'in_progress', 'completed') NOT NULL DEFAULT 'pending',
  completion_file VARCHAR(1024) NULL COMMENT 'Relative path under uploads/ or full URL',
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_step (user_id, step_id),
  KEY idx_progress_pathway (pathway_id),
  KEY idx_progress_user (user_id),
  CONSTRAINT fk_ai_progress_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ai_progress_pathway
    FOREIGN KEY (pathway_id) REFERENCES user_pathways (pathway_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ai_progress_step
    FOREIGN KEY (step_id) REFERENCES ai_pathway_steps (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
