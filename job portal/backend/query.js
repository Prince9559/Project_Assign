









// --1. Add new column
// ALTER TABLE jobposts ADD COLUMN college_id INT AFTER college_name;

// --2. Update existing row(replace 1 with actual school_colleges id)
// UPDATE jobposts SET college_id = 1 WHERE[your - row - condition];

// --3. Add foreign key
// ALTER TABLE jobposts
// ADD CONSTRAINT fk_jobpost_schoolcollege
// FOREIGN KEY(college_id) REFERENCES school_colleges(id)
// ON DELETE RESTRICT;

// --4. Drop old column(when ready)
// ALTER TABLE jobposts DROP COLUMN college_name;







// --1. First verify your existing city values
// SELECT DISTINCT cityChoice FROM jobposts;

// --2. Create a temporary mapping table of city options
// CREATE TEMPORARY TABLE city_mapping AS
// SELECT id, value FROM filter_options
// WHERE category = 'cities';

// --3. Add new integer column(as nullable first)
// ALTER TABLE jobposts ADD COLUMN city_id INT NULL;

// --4. Map existing string values to IDs
// UPDATE jobposts jp
// JOIN city_mapping cm ON jp.cityChoice = cm.value
// SET jp.city_id = cm.id;

// --5. For any unmapped cities(handle NULLs as needed)
// UPDATE jobposts SET city_id = NULL WHERE city_id IS NULL AND cityChoice IS NOT NULL;

// --6. Drop old column and rename new one
// ALTER TABLE jobposts DROP COLUMN cityChoice;
// ALTER TABLE jobposts CHANGE COLUMN city_id city_id INT;

// --7. Add foreign key constraint
// ALTER TABLE jobposts
// ADD CONSTRAINT fk_jobpost_city
// FOREIGN KEY(city_id) REFERENCES filter_options(id)
// ON DELETE RESTRICT;

// --8. Cleanup
// DROP TEMPORARY TABLE city_mapping;



// --For duration
// ALTER TABLE jobposts ADD COLUMN duration_id INT;
// UPDATE jobposts jp
// JOIN filter_options fo ON jp.internshipDuration = fo.value AND fo.category = 'duration'
// SET jp.duration_id = fo.id;
// ALTER TABLE jobposts DROP COLUMN internshipDuration;
// ALTER TABLE jobposts CHANGE COLUMN duration_id duration_id INT;
// ALTER TABLE jobposts ADD CONSTRAINT fk_jobpost_duration FOREIGN KEY(duration_id) REFERENCES filter_options(id);

// --For perks(assuming comma - separated values, needs more complex handling)
// --This would require creating a junction table for many - to - many relationship


// ALTER TABLE jobposts
// MODIFY COLUMN perks TEXT;

// ALTER TABLE jobposts
// MODIFY COLUMN screening_questions TEXT;

// --Update perks format if needed
// UPDATE jobposts SET perks = JSON_ARRAY(perks)
// WHERE perks NOT LIKE '[%' AND perks IS NOT NULL;



{
  /*--------------------------------13-08-2025--------------------------------------------

query for update application table, because it contains duplicate fields which is already defined, causes redundency,for implement single source of truth

--1. First, add the new location_id column
ALTER TABLE applications 
ADD COLUMN location_id INT NULL,
ADD CONSTRAINT fk_application_location 
FOREIGN KEY(location_id) REFERENCES locations(id);

--2. Then remove the duplicate columns(run these one at a time to avoid errors)
ALTER TABLE applications DROP COLUMN name;
ALTER TABLE applications DROP COLUMN location;
ALTER TABLE applications DROP COLUMN experience;
ALTER TABLE applications DROP COLUMN skills;
ALTER TABLE applications DROP COLUMN language;
ALTER TABLE applications DROP COLUMN resume;
ALTER TABLE applications DROP COLUMN education;
ALTER TABLE applications DROP COLUMN email;
ALTER TABLE applications DROP COLUMN phoneNumber;

--3. Optional: Add index for better performance on user queries
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_job_post_id ON applications(job_post_id);


---------------------------------16-08-2025---------------------------------------------------------------------------
ye krnna  h abhi>>>>

we are creating junction table for jobPost because it can contains only single college and course redundency and does't prevent duplicate values, but Now it can be handled by using junction table




-- 1. Create JobPostCollege junction table
CREATE TABLE IF NOT EXISTS job_post_colleges (
  job_post_id INT NOT NULL,
  college_id INT NOT NULL,
  PRIMARY KEY (job_post_id, college_id),
  FOREIGN KEY (job_post_id) REFERENCES jobposts(job_id) ON DELETE CASCADE,
  FOREIGN KEY (college_id) REFERENCES school_colleges(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2. Create JobPostCourse junction table 
CREATE TABLE IF NOT EXISTS job_post_courses (
  job_post_id INT NOT NULL,
  course_id INT NOT NULL,
  PRIMARY KEY (job_post_id, course_id),
  FOREIGN KEY (job_post_id) REFERENCES jobposts(job_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Add indexes for performance
CREATE INDEX idx_jobpostcollege_jobpost ON job_post_colleges(job_post_id);
CREATE INDEX idx_jobpostcollege_college ON job_post_colleges(college_id);
CREATE INDEX idx_jobpostcourse_jobpost ON job_post_courses(job_post_id);
CREATE INDEX idx_jobpostcourse_course ON job_post_courses(course_id);


-- 4. First drop the foreign key constraints
ALTER TABLE jobposts DROP FOREIGN KEY fk_jobposts_schoolcollege;  -- college_id constraint
ALTER TABLE jobposts DROP FOREIGN KEY fk_jobpost_course;         -- course_id constraint

-- 5. Then remove the columns
ALTER TABLE jobposts DROP COLUMN college_id;
ALTER TABLE jobposts DROP COLUMN course_id;


---------------------------19-08-2025--------------------------------------------------------

-- Create the junction table
CREATE TABLE job_post_skills (
    job_post_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (job_post_id, skill_id),
    FOREIGN KEY (job_post_id) REFERENCES jobposts(job_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Add individual indexes
CREATE INDEX idx_job_post_skills_jobpost ON job_post_skills(job_post_id);
CREATE INDEX idx_job_post_skills_skill ON job_post_skills(skill_id);

-- Add composite index
CREATE INDEX idx_job_post_skills_composite ON job_post_skills(job_post_id, skill_id);



----------------------------------------------------



CREATE TABLE `otps` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `otp` VARCHAR(255) NOT NULL,
  `user_id` INT NOT NULL,
  `purpose` ENUM(
    'email_verification', 
    'phone_verification', 
    'password_reset', 
    'job_application', 
    'document_verification', 
    'aadhaar_verification'
  ) NOT NULL,
  `expires_at` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 10 MINUTE),
  `is_used` TINYINT(1) NOT NULL DEFAULT 0,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `verification_attempts` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `expires_at` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 10 MINUTE),
  `is_used` TINYINT(1) NOT NULL DEFAULT 0,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `verification_attempts` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `otp_verification_index` (`user_id`, `purpose`, `is_used`, `expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

---------------------------

CREATE TABLE languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    INDEX (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-------------------------------------------------
CREATE TABLE IF NOT EXISTS job_post_cities (
  job_post_id INT NOT NULL,
  city_id INT NOT NULL,
  PRIMARY KEY (job_post_id, city_id),
  INDEX jobpostcity_jobpost_idx (job_post_id),
  INDEX jobpostcity_city_idx (city_id),
  UNIQUE INDEX jobpostcity_composite_idx (job_post_id, city_id),
  CONSTRAINT fk_jobpostcity_jobpost
    FOREIGN KEY (job_post_id)
    REFERENCES jobposts (job_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_jobpostcity_city
    FOREIGN KEY (city_id)
    REFERENCES locations (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

--------------------------------------------------25-08-2025-----------------------------------------------------------


=>Removed column interview_time from TABLE interview_invitations

ALTER TABLE interview_invitations
DROP interview_time;

=>Added two new columns start_time and end_time to manage interview timings

ALTER TABLE interview_invitations ADD start_time TIME NOT NULL AFTER interview_date, ADD end_time TIME NOT NULL AFTER start_time;



--------------------01-09-2025--------------------------------

ALTER TABLE company_recruiter_profiles
DROP COLUMN recruiter_name,
DROP COLUMN recruiter_email,
DROP COLUMN recruiter_phone;


CREATE TABLE IF NOT EXISTS `industries` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `company_languages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_recruiter_profile_id` INT NOT NULL,
  `language_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `company_language_unique` (`company_recruiter_profile_id` ASC, `language_id` ASC) VISIBLE,
  INDEX `fk_company_language_language_idx` (`language_id` ASC) VISIBLE,
  CONSTRAINT `fk_company_language_company`
    FOREIGN KEY (`company_recruiter_profile_id`)
    REFERENCES `company_recruiter_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_company_language_language`
    FOREIGN KEY (`language_id`)
    REFERENCES `languages` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



ALTER TABLE company_recruiter_profiles
  DROP COLUMN designation,
  DROP COLUMN industry,
  DROP COLUMN location,
  ADD COLUMN designation_id INT NULL AFTER user_id,
  ADD COLUMN industry_id INT NULL AFTER company_name,
  ADD COLUMN company_location_id INT NULL AFTER industry_id,
  ADD CONSTRAINT fk_company_recruiter_profiles_designation
      FOREIGN KEY (designation_id) REFERENCES job_roles(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_company_recruiter_profiles_industry
      FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_company_recruiter_profiles_location
      FOREIGN KEY (company_location_id) REFERENCES locations(id) ON DELETE SET NULL;
   
   INSERT INTO industries (name, created_at, updated_at) VALUES
('Information Technology (IT)', NOW(), NOW()),
('Healthcare', NOW(), NOW()),
('Finance & Banking', NOW(), NOW()),
('Education & Training', NOW(), NOW()),
('Manufacturing', NOW(), NOW()),
('Retail & E-commerce', NOW(), NOW()),
('Construction & Real Estate', NOW(), NOW()),
('Telecommunications', NOW(), NOW()),
('Hospitality & Tourism', NOW(), NOW()),
('Media & Entertainment', NOW(), NOW()),
('Logistics & Transportation', NOW(), NOW()),
('Agriculture & Food Processing', NOW(), NOW()),
('Energy & Utilities', NOW(), NOW()),
('Legal & Consulting', NOW(), NOW()),
('Government & Public Sector', NOW(), NOW());



INSERT INTO languages (name) VALUES
('English'),
('Hindi'),
('Spanish'),
('French'),
('German'),
('Mandarin'),
('Arabic'),
('Bengali'),
('Portuguese'),
('Russian'),
('Japanese'),
('Korean'),
('Urdu'),
('Punjabi'),
('Italian');





ALTER TABLE experiences
  DROP COLUMN current_company,
  DROP COLUMN current_job_role,
  ADD COLUMN job_role_id INT NULL AFTER company_recruiter_profile_id,
  ADD COLUMN company_id INT NULL AFTER job_role_id,
  ADD CONSTRAINT fk_experiences_job_role
      FOREIGN KEY (job_role_id) REFERENCES job_roles(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_experiences_company
      FOREIGN KEY (company_id) REFERENCES company_recruiter_profiles(id) ON DELETE SET NULL;




ALTER TABLE user_skills
  ADD COLUMN authority_id INT NULL AFTER skill_id ,
  ADD CONSTRAINT fk_user_skills_authority
  FOREIGN KEY (authority_id) REFERENCES company_recruiter_profiles(id) ON DELETE SET NULL;



-------------------------------10-09-2025------------------

ALTER TABLE assignments 
CHANGE COLUMN file_upload assignment_url TEXT NULL;

 //added column slug in feed posts for unique url sharing  
  ALTER TABLE feed_posts ADD COLUMN slug VARCHAR(255) UNIQUE;

-----------------------------12-09-25-------------
ALTER TABLE university_details
DROP COLUMN email_id,
DROP COLUMN phone;
DROP COLUMN course_id;


ALTER TABLE university_details
ADD COLUMN university_logo_url VARCHAR(255) NULL;


ALTER TABLE  university_details
CHANGE COLUMN adhar_verified aadhar_verified BOOLEAN DEFAULT FALSE;


CREATE TABLE university_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    university_id INT NOT NULL,
    course_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES university_details(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_university_course (university_id, course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


---------------------16-09-2025---------------------------
//changed by default user status to 0 and made it not null
now the status will be 0 or 1 or 2
ALTER TABLE `users` CHANGE `status` `status` INT(11) NOT NULL DEFAULT '0';



----------------------17-09-2025---------------

ALTER TABLE `users`
ADD COLUMN `google_id` VARCHAR(255) NULL UNIQUE AFTER `status`;

-------------------------18---09-2025----------------
ALTER TABLE `users`
ADD COLUMN `accepted_terms_at` DATETIME NULL AFTER `status`;

------19-0-2025-----------------

ALTER TABLE `job_posts`
ADD COLUMN `active_status` TINYINT NOT NULL DEFAULT 1 AFTER `views`;



-----------------22-9-2025-------------
ALTER TABLE company_recruiter_profiles
ADD COLUMN email_alert_frequency ENUM('off', 'daily', 'weekly', 'monthly') DEFAULT 'off',
ADD COLUMN last_alert_sent_at DATETIME NULL;



-----------------26-9-2025-------------------------
ALTER TABLE `user_skills`
ADD COLUMN `start_date` DATE NULL DEFAULT NULL AFTER `authority_id`,
ADD COLUMN `end_date` DATE NULL DEFAULT NULL AFTER `start_date`;



-----------------------30-09-2025--------------------
-- add uuid NULLABLE (not NOT NULL yet)
ALTER TABLE `users` ADD COLUMN `uuid` VARCHAR(36) NULL UNIQUE AFTER `id`;


----------------------03-10-2025---------------

// added start_date and end_date in educations

// Add new DATE columns
ALTER TABLE educations 
ADD COLUMN start_date DATE NULL,
ADD COLUMN end_date DATE NULL;

// Migrate existing start_year (string like '2020') → start_date = '2020-01-01'
UPDATE educations 
SET start_date = CONCAT(start_year, '-01-01')
WHERE start_year IS NOT NULL AND start_year REGEXP '^[0-9]{4}$';

// Migrate end_year → end_date = '2020-12-31'
UPDATE educations 
SET end_date = CONCAT(end_year, '-12-31')
WHERE end_year IS NOT NULL AND end_year REGEXP '^[0-9]{4}$';

// Drop old columns
ALTER TABLE educations 
DROP COLUMN start_year,
DROP COLUMN end_year;


--------------------04-10-2025--------------
-- 1. Create the new authorities table
CREATE TABLE IF NOT EXISTS `authorities` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `authority_type` ENUM('COMPANY','UNIVERSITY') NOT NULL,
  `company_id` INT NULL DEFAULT NULL,
  `school_college_id` INT NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_school_college_id` (`school_college_id`),
  CONSTRAINT `fk_authorities_company` 
    FOREIGN KEY (`company_id`) 
    REFERENCES `company_recruiter_profiles` (`id`) 
    ON DELETE SET NULL,
  CONSTRAINT `fk_authorities_school_college` 
    FOREIGN KEY (`school_college_id`) 
    REFERENCES `school_colleges` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Add authority_type column (for valid company skills only)
ALTER TABLE `user_skills`
ADD COLUMN `authority_type` ENUM('COMPANY','UNIVERSITY') NOT NULL DEFAULT 'COMPANY' AFTER `authority_id`;

-- 3. Delete skills without authority
DELETE us FROM `user_skills` us
LEFT JOIN `company_recruiter_profiles` crp ON crp.id = us.authority_id
WHERE us.authority_id IS NULL OR crp.id IS NULL;

-- 4. Create authorities for remaining valid companies
INSERT INTO `authorities` (`authority_type`, `company_id`, `school_college_id`, `created_at`)
SELECT 'COMPANY', us.authority_id, NULL, NOW()
FROM `user_skills` us
INNER JOIN `company_recruiter_profiles` crp ON crp.id = us.authority_id
GROUP BY us.authority_id;

-- 5. Auto-drop the old FK 
SET @fk_name = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'user_skills'
    AND COLUMN_NAME = 'authority_id'
    AND REFERENCED_TABLE_NAME = 'company_recruiter_profiles'
  LIMIT 1
);

SET @drop_fk = IF(
  @fk_name IS NOT NULL,
  CONCAT('ALTER TABLE `user_skills` DROP FOREIGN KEY `', @fk_name, '`'),
  'SELECT ''No old FK found'''
);

PREPARE stmt FROM @drop_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. update authority id
UPDATE `user_skills` us
JOIN `company_recruiter_profiles` crp ON crp.id = us.authority_id
JOIN `authorities` a ON a.company_id = crp.id
SET us.authority_id = a.id;

-- 7. making authority_id not null again
ALTER TABLE `user_skills`
MODIFY COLUMN `authority_id` INT NOT NULL;

-- 8. adding the foreign key
ALTER TABLE `user_skills`
ADD CONSTRAINT `fk_user_skills_authority_new`
  FOREIGN KEY (`authority_id`)
  REFERENCES `authorities` (`id`)
  ON DELETE CASCADE;


-------------------------------------08-10-2025--------------
ALTER TABLE `job_posts`
ADD COLUMN `min_skill_match_required` INT NOT NULL DEFAULT 0 AFTER `views`;




-----------------10-10-2025------------

ALTER TABLE `feed_posts`
  DROP `comment_Count`,
  DROP `comments`;


----created a new comment table
CREATE TABLE `post_comments` (
  `id` INT  NOT NULL AUTO_INCREMENT,
  `post_id` INT  NOT NULL,
  `user_id` INT  NOT NULL,
  `parent_comment_id` INT NULL DEFAULT NULL, 
  `comment` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  
  -- Foreign key to feed_posts
  CONSTRAINT `fk_post_comments_post_id`
    FOREIGN KEY (`post_id`)
    REFERENCES `feed_posts` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  
  -- Foreign key to users
  CONSTRAINT `fk_post_comments_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  
  -- Self-referencing foreign key for replies (optional)
  CONSTRAINT `fk_post_comments_parent`
    FOREIGN KEY (`parent_comment_id`)
    REFERENCES `post_comments` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


----comment count column
ALTER TABLE `feed_posts`
ADD COLUMN `comment_count` INT  NOT NULL DEFAULT 0 AFTER `like_count`;


-- Speed up fetching comments for a post
CREATE INDEX `idx_post_comments_post_id` ON `post_comments` (`post_id`);

-- Speed up fetching user's comments
CREATE INDEX `idx_post_comments_user_id` ON `post_comments` (`user_id`);

-- Speed up threaded replies
CREATE INDEX `idx_post_comments_parent` ON `post_comments` (`parent_comment_id`);




-----------------13-10-2025-----------
ALTER TABLE `educations`
MODIFY COLUMN `school_college_id` INT NULL;

ALTER TABLE `educations`
MODIFY COLUMN `course_id` INT NULL;

ALTER TABLE `educations`
ADD COLUMN `other_institution_name` VARCHAR(255) NULL DEFAULT NULL
AFTER `school_college_id`;

ALTER TABLE `educations`
ADD COLUMN `standard_or_grade` VARCHAR(255) NULL DEFAULT NULL
AFTER `board_or_university`;


------------------------------------17-10-2025--------------------------------------------------
ALTER TABLE `experiences`
ADD COLUMN `authority_id` INT NULL DEFAULT NULL AFTER `user_detail_id`,
ADD INDEX `idx_authority_id` (`authority_id`),
ADD CONSTRAINT `fk_experiences_authority`
  FOREIGN KEY (`authority_id`)
  REFERENCES `authorities` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;


ALTER TABLE `user_skills`
ADD COLUMN `experience_id` INT NULL DEFAULT NULL AFTER `authority_type`,
ADD INDEX `idx_experience_id` (`experience_id`),
ADD CONSTRAINT `fk_user_skills_experience`
  FOREIGN KEY (`experience_id`)
  REFERENCES `experiences` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;


ALTER TABLE `experiences`
ADD COLUMN `organization_name` VARCHAR(255) NULL DEFAULT NULL AFTER `authority_id`;


ALTER TABLE `user_skills`
MODIFY COLUMN `authority_id` INT NULL DEFAULT NULL;


ALTER TABLE `user_skills`
MODIFY COLUMN `authority_type` ENUM('COMPANY', 'UNIVERSITY') NULL;


-----------------------------------21-10-2025------------------------
ALTER TABLE `university_details`
  ADD COLUMN `affiliated_university` VARCHAR(255) NULL DEFAULT NULL AFTER `college_name`,
  ADD COLUMN `authorization_letter_url` VARCHAR(500) NULL DEFAULT NULL AFTER `university_logo_url`;

-----------------------------------01-11-2025--------------------------------------------------------


-- ==================== CONVERSATIONS TABLE ====================

CREATE TABLE IF NOT EXISTS `conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` ENUM('job_application', 'general_inquiry', 'interview', 'assignment') NOT NULL DEFAULT 'job_application',
  `job_application_id` INT DEFAULT NULL,
  `last_message_at` DATETIME DEFAULT NULL,
  `is_archived` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_last_message_at` (`last_message_at`),
  INDEX `idx_job_application_id` (`job_application_id`),
  
  FOREIGN KEY (`job_application_id`) REFERENCES `applications`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==================== CONVERSATION_PARTICIPANTS TABLE ====================
CREATE TABLE IF NOT EXISTS `conversation_participants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `user_type` ENUM('STUDENT', 'COMPANY', 'UNIVERSITY') NOT NULL,
  `last_read_at` DATETIME DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_conversation_id` (`conversation_id`),
  INDEX `idx_user_id` (`user_id`),
  UNIQUE KEY `unique_participant` (`conversation_id`, `user_id`),
  
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


 -- ==================== MESSAGES TABLE ====================
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT NOT NULL,
  `sender_id` INT NOT NULL,
  `sender_type` ENUM('STUDENT', 'COMPANY', 'UNIVERSITY') NOT NULL,
  `message_type` ENUM('text', 'image', 'document', 'assignment', 'interview_invite', 'system') NOT NULL DEFAULT 'text',
  `content` TEXT,
  `metadata` JSON DEFAULT NULL,
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `is_edited` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_conversation_created` (`conversation_id`, `created_at`),
  INDEX `idx_sender_id` (`sender_id`),
  
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==================== MESSAGE_ATTACHMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS `message_attachments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `message_id` INT NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_type` VARCHAR(100) NOT NULL,
  `file_size` INT NOT NULL,
  `uploaded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_message_id` (`message_id`),
  
  FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




-----------------------------------------05-11-2025----------------------------------------

CREATE TABLE one_time_purchases (
    purchase_id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    post_type ENUM('active', 'future', 'college') NOT NULL,
    
    job_id INT DEFAULT NULL COMMENT 'Linked job posting',
    
    -- For college_specific (ready for future)
    college_ids JSON DEFAULT NULL,
    college_count INT DEFAULT 0,
    
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refund') DEFAULT 'pending',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES company_recruiter_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES job_posts(job_id) ON DELETE SET NULL,
    
    INDEX idx_company (company_id),
    INDEX idx_job (job_id),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;






CREATE TABLE plans (
    plan_id INT PRIMARY KEY AUTO_INCREMENT,
    plan_name VARCHAR(100) NOT NULL,
    plan_type ENUM('active', 'future', 'college') NOT NULL,
    description TEXT,
    
    -- Pricing
    monthly_price DECIMAL(10, 2) NOT NULL,
    yearly_price DECIMAL(10, 2) NOT NULL,
    
    -- Credits
    monthly_credits INT NOT NULL,
    yearly_credits INT NOT NULL,
    
    -- For college_specific (ready for future)
    price_per_college_monthly DECIMAL(10, 2) DEFAULT 0,
    price_per_college_yearly DECIMAL(10, 2) DEFAULT 0,
    
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_plan_type (plan_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE payment_orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    
    -- What they're buying
    purchase_type ENUM('subscription', 'one_time_post') NOT NULL,
    
    -- For subscriptions
    plan_id INT DEFAULT NULL,
    billing_cycle ENUM('monthly', 'yearly') DEFAULT NULL,
    
    -- For one-time posts
    post_type ENUM('active', 'future', 'college') DEFAULT NULL,
    job_id INT DEFAULT NULL,
    
    -- For college_specific (ready for future)
    college_ids JSON DEFAULT NULL,
    
    -- Pricing
    amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Razorpay
    razorpay_order_id VARCHAR(100) DEFAULT NULL,
    
    status ENUM('created', 'paid', 'failed', 'expired', 'refunded') DEFAULT 'created',
    expires_at TIMESTAMP NULL DEFAULT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES company_recruiter_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE SET NULL,
    FOREIGN KEY (job_id) REFERENCES job_posts(job_id) ON DELETE SET NULL,
    
    INDEX idx_razorpay_order (razorpay_order_id),
    INDEX idx_company_status (company_id, status),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE payment_transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    company_id INT NOT NULL,
    
    -- Razorpay details
    razorpay_payment_id VARCHAR(100) DEFAULT NULL,
    razorpay_order_id VARCHAR(100) DEFAULT NULL,
    razorpay_signature VARCHAR(255) DEFAULT NULL,
    
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
    
    payment_method VARCHAR(50) DEFAULT NULL,
    payment_date TIMESTAMP NULL DEFAULT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES payment_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES company_recruiter_profiles(id) ON DELETE CASCADE,
    
    INDEX idx_razorpay_payment (razorpay_payment_id),
    INDEX idx_order (order_id),
    INDEX idx_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



ALTER TABLE job_posts 
ADD COLUMN payment_type ENUM('subscription', 'one_time', 'free') DEFAULT 'free' AFTER duration_id,
ADD COLUMN subscription_id INT DEFAULT NULL COMMENT 'If paid via subscription',
ADD COLUMN purchase_id INT DEFAULT NULL COMMENT 'If paid via one-time',
ADD COLUMN college_ids JSON DEFAULT NULL COMMENT 'For college_specific posts (future)',
ADD COLUMN is_college_specific TINYINT(1) DEFAULT 0,
ADD INDEX idx_payment_type (payment_type),
ADD INDEX idx_subscription (subscription_id),
ADD INDEX idx_purchase (purchase_id),
ADD FOREIGN KEY (purchase_id) REFERENCES one_time_purchases(purchase_id) ON DELETE SET NULL;



----------------------------------06-11-2025--------------------------------------------

ALTER TABLE plans
  ADD COLUMN plan_slug VARCHAR(100) UNIQUE NOT NULL AFTER plan_name,
  ADD COLUMN features JSON NULL DEFAULT NULL COMMENT 'Plan features for display' AFTER yearly_credits,
  ADD COLUMN is_visible TINYINT(1) DEFAULT 1 COMMENT 'Show on pricing page' AFTER is_active,
  ADD COLUMN is_featured TINYINT(1) DEFAULT 0 COMMENT 'Highlight on frontend' AFTER is_visible,
  ADD COLUMN display_order INT DEFAULT 0 COMMENT 'Sort order on frontend' AFTER is_featured,
  ADD COLUMN razorpay_plan_id_monthly VARCHAR(100) NULL COMMENT 'Razorpay subscription plan ID' AFTER price_per_college_yearly,
  ADD COLUMN razorpay_plan_id_yearly VARCHAR(100) NULL COMMENT 'Razorpay subscription plan ID' AFTER razorpay_plan_id_monthly;


ALTER TABLE plans
  MODIFY COLUMN plan_type ENUM('active', 'future', 'college', 'both') NOT NULL;

-- Add indexes
ALTER TABLE plans
  ADD INDEX idx_visibility (is_active, is_visible),
  ADD INDEX idx_slug (plan_slug);




CREATE TABLE company_subscriptions (
    subscription_id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    plan_id INT NOT NULL,
    
    -- Razorpay Subscription
    razorpay_subscription_id VARCHAR(100) UNIQUE COMMENT 'Razorpay subscription ID',
    razorpay_plan_id VARCHAR(100),
    razorpay_customer_id VARCHAR(100),
    
    -- Subscription Details
    billing_cycle ENUM('monthly', 'yearly') NOT NULL,
    status ENUM('active', 'paused', 'cancelled', 'expired', 'pending') DEFAULT 'pending',
    
    -- Dates
    start_date DATE,
    current_period_start DATE,
    current_period_end DATE,
    next_billing_date DATE,
    cancelled_at DATE DEFAULT NULL,
    
    -- Credits Management
    total_credits INT NOT NULL,
    used_credits INT DEFAULT 0,
    remaining_credits INT NOT NULL,
    
    -- For college-specific (Phase 2)
    college_ids JSON DEFAULT NULL,
    college_count INT DEFAULT 0,
    
    -- Pricing
    amount_per_cycle DECIMAL(10, 2) NOT NULL,
    
    -- Auto-renewal
    auto_renew TINYINT(1) DEFAULT 1,
    
    -- Metadata
    metadata JSON COMMENT 'Store plan snapshot and other details',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES company_recruiter_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE RESTRICT,
    
    INDEX idx_company_status (company_id, status),
    INDEX idx_razorpay_sub (razorpay_subscription_id),
    INDEX idx_next_billing (next_billing_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;





CREATE TABLE subscription_credit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    subscription_id INT NOT NULL,
    company_id INT NOT NULL,
    
    action_type ENUM('allocated', 'used', 'refunded', 'reset') NOT NULL,
    
    credits_before INT NOT NULL,
    credits_changed INT NOT NULL COMMENT 'Positive for add, negative for deduct',
    credits_after INT NOT NULL,
    
    job_id INT DEFAULT NULL COMMENT 'If used for job posting',
    
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (subscription_id) REFERENCES company_subscriptions(subscription_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES company_recruiter_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES job_posts(job_id) ON DELETE SET NULL,
    
    INDEX idx_subscription (subscription_id),
    INDEX idx_company (company_id),
    INDEX idx_action (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




ALTER TABLE payment_orders
ADD COLUMN subscription_id INT DEFAULT NULL COMMENT 'For subscription payments',
ADD COLUMN is_subscription_payment TINYINT(1) DEFAULT 0,
ADD FOREIGN KEY (subscription_id) REFERENCES company_subscriptions(subscription_id) ON DELETE SET NULL;


-------------------------------------07-11-2025-----------------------

--inserting sample plans

INSERT INTO plans (
  plan_name,
  plan_slug,
  plan_type,
  description,
  monthly_price,
  yearly_price,
  monthly_credits,
  yearly_credits,
  features,
  is_active,
  is_visible,
  is_featured,
  display_order,
  price_per_college_monthly,
  price_per_college_yearly,
  razorpay_plan_id_monthly,
  razorpay_plan_id_yearly,
  created_at,
  updated_at
) VALUES
  --  Starter Plan — Active Only
  (
    'Starter',
    'starter-active',
    'active',
    'Ideal for new recruiters. Post 5 active opportunities per month.',
    499.00,
    4990.00,
    5,
    60,
    '{"support":"email","auto_renew":true,"analytics":false}',
    1,
    1,
    0,
    10,
    NULL,
    NULL,
    NULL,  -- ← Will be filled by app (Razorpay)
    NULL,  -- ← Will be filled by app
    NOW(),
    NOW()
  ),

  -- Growth Plan — Future Only
  (
    'Growth',
    'growth-future',
    'future',
    'For companies planning ahead. Post 8 future-dated opportunities per month.',
    999.00,
    9990.00,
    8,
    96,
    '{"support":"email","auto_renew":true,"custom_dates":true,"reminders":true}',
    1,
    1,
    0,
    20,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
  ),

  --  Pro Plan — Both Active + Future
  (
    'Pro',
    'pro-both',
    'both',
    'Most popular. Mix of active and future postings. Priority support.',
    1499.00,
    14990.00,
    15,
    180,
    '{"support":"priority","auto_renew":true,"analytics":true,"custom_dates":true,"reminders":true}',
    1,
    1,
    1,
    30,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
  ),

  --  Enterprise — Both (High Volume)
  (
    'Enterprise',
    'enterprise-both',
    'both',
    'For scaling teams. Unlimited features, dedicated account manager.',
    2999.00,
    29990.00,
    40,
    480,
    '{"support":"dedicated","auto_renew":true,"analytics":true,"custom_dates":true,"reminders":true,"api_access":true,"white_label":false}',
    1,
    1,
    0,
    40,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
  )
ON DUPLICATE KEY UPDATE
  plan_name = VALUES(plan_name),
  description = VALUES(description),
  monthly_price = VALUES(monthly_price),
  yearly_price = VALUES(yearly_price),
  monthly_credits = VALUES(monthly_credits),
  yearly_credits = VALUES(yearly_credits),
  features = VALUES(features),
  updated_at = NOW();


ALTER TABLE company_recruiter_profiles 
ADD COLUMN razorpay_customer_id VARCHAR(100) NULL DEFAULT NULL COMMENT 'Razorpay customer ID for subscriptions',
ADD INDEX idx_rzp_customer (razorpay_customer_id);






ALTER TABLE job_posts
ADD COLUMN post_type ENUM('active', 'future', 'college') NULL;




--------------------------11-11-2025------------------------
ALTER TABLE company_subscriptions 
MODIFY COLUMN status ENUM('active', 'paused', 'cancelled', 'expired', 'pending', 'created', 'authenticated', 'halted') 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci 
NOT NULL 
DEFAULT 'created';


-- Update existing job_posts with correct post_type
UPDATE job_posts jp
SET post_type = CASE
  -- Rule 1: If associated with ≥1 college → 'college'
  WHEN (
    SELECT COUNT(*)
    FROM job_post_colleges jpc
    WHERE jpc.job_post_id = jp.job_id
  ) > 0 THEN 'college'

  -- Rule 2: No colleges → infer from active_status
  WHEN jp.active_status = 1 THEN 'active'
  WHEN jp.active_status IN (0, 2) THEN 'future'
  ELSE 'future'  -- fallback
END;

----------------------------------------------15-11-2025-------------------------
ALTER TABLE `company_subscriptions`
ADD COLUMN `cancel_at` DATE NULL COMMENT 'Scheduled cancellation date (if cancel_at_cycle_end=true)' AFTER `next_billing_date`;

ALTER TABLE `company_subscriptions`
ADD COLUMN `last_payment_failed_at` DATETIME NULL COMMENT 'Timestamp of last failed auto-charge attempt' AFTER `cancel_at`;


ALTER TABLE `company_subscriptions` 
MODIFY COLUMN `status` ENUM(
  'active',
  'paused',
  'halted',
  'cancelling',       
  'cancelled',
  'expired',
  'completed',
  'created',
  'authenticated',
  'pending'         
) NOT NULL DEFAULT 'created' COMMENT 'Subscription lifecycle status';
 

UPDATE `company_subscriptions`
SET `cancel_at` = `current_period_end`
WHERE `status` = 'cancelled' 
  AND `cancel_at` IS NULL
  AND `current_period_end` IS NOT NULL;



--------------------------------------17-11-2025-----------------------

DROP TABLE IF EXISTS `notifications`;


CREATE TABLE `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `user_role` ENUM('STUDENT','COMPANY','UNIVERSITY') NOT NULL,
  `type` VARCHAR(100) NOT NULL COMMENT 'e.g., application_received, job_posted',
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT NULL,
  `action_url` VARCHAR(500) NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT '0',
  `is_archived` TINYINT(1) NOT NULL DEFAULT '0',
  `metadata` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_status` (`user_id`, `is_read`, `created_at`),
  KEY `idx_user_role` (`user_id`, `user_role`),
  CONSTRAINT `fk_notifications_user` 
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-------------------------------19-11-2025-------------------------


ALTER TABLE `university_details`
ADD COLUMN `school_college_id` INT NULL DEFAULT NULL AFTER `social_media_link`,
ADD CONSTRAINT `fk_university_school_college`
  FOREIGN KEY (`school_college_id`) REFERENCES `school_colleges` (`id`)
  ON DELETE SET NULL;


ALTER TABLE `university_details`
ADD COLUMN `is_verified` TINYINT(1) NOT NULL DEFAULT 0 AFTER `school_college_id`;



--------------------------------------------20-11-2025---------------------------------


-- university credits buying

CREATE TABLE `university_credit_packages` (
  `package_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `credits` int(11) NOT NULL COMMENT 'Number of contact views granted',
  `price_inr` decimal(10,2) NOT NULL,
  `validity_days` int(11) DEFAULT NULL COMMENT 'Days until credits expire (NULL = never)',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`package_id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




CREATE TABLE `university_credit_orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `university_id` int(11) NOT NULL,
  `package_id` int(11) NOT NULL,
  `credits_purchased` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `validity_days` int(11) DEFAULT NULL,
  `razorpay_order_id` varchar(100) DEFAULT NULL,
  `status` enum('created','authorized','paid','failed','expired', 'refunded') NOT NULL DEFAULT 'created',
  `expires_at` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `razorpay_order_id` (`razorpay_order_id`),
  KEY `university_id` (`university_id`),
  KEY `package_id` (`package_id`),
  KEY `status` (`status`),
  CONSTRAINT `fk_uco_university` 
    FOREIGN KEY (`university_id`) REFERENCES `university_details` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_uco_package` 
    FOREIGN KEY (`package_id`) REFERENCES `university_credit_packages` (`package_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `university_credit_batches` (
  `batch_id` int(11) NOT NULL AUTO_INCREMENT,
  `university_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `credits_added` int(11) NOT NULL,
  `credits_used` int(11) NOT NULL DEFAULT 0,
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`batch_id`),
  KEY `university_id` (`university_id`),
  KEY `order_id` (`order_id`),
  KEY `idx_univ_expires` (`university_id`, `expires_at`),
  CONSTRAINT `fk_ucb_university` 
    FOREIGN KEY (`university_id`) REFERENCES `university_details` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ucb_order` 
    FOREIGN KEY (`order_id`) REFERENCES `university_credit_orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




CREATE TABLE `contact_unlocks` (
  `unlock_id` int(11) NOT NULL AUTO_INCREMENT,
  `university_id` int(11) NOT NULL,
  `recruiter_user_id` int(11) NOT NULL,
  `job_id` int(11) DEFAULT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `unlocked_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`unlock_id`),
  UNIQUE KEY `unique_university_recruiter` (`university_id`, `recruiter_user_id`),
  KEY `university_id` (`university_id`),
  KEY `recruiter_user_id` (`recruiter_user_id`),
  KEY `job_id` (`job_id`),
  KEY `batch_id` (`batch_id`),
  CONSTRAINT `fk_cu_university` 
    FOREIGN KEY (`university_id`) REFERENCES `university_details` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cu_recruiter` 
    FOREIGN KEY (`recruiter_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cu_job` 
    FOREIGN KEY (`job_id`) REFERENCES `job_posts` (`job_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cu_batch` 
    FOREIGN KEY (`batch_id`) REFERENCES `university_credit_batches` (`batch_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE `credit_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `university_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action_type` enum('purchased','used','expired','admin') NOT NULL,
  `credits_before` int(11) NOT NULL,
  `credits_changed` int(11) NOT NULL,
  `credits_after` int(11) NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `university_id` (`university_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_univ_created` (`university_id`, `created_at`),
  CONSTRAINT `fk_cl_university` 
    FOREIGN KEY (`university_id`) REFERENCES `university_details` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cl_user` 
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



ALTER TABLE university_credit_packages
ADD COLUMN tax_rate_percent DECIMAL(5,2) DEFAULT 18.00 COMMENT 'GST % (e.g., 18.00 for 18%)';


ALTER TABLE university_credit_orders
ADD COLUMN base_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER amount,
ADD COLUMN tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;


ALTER TABLE university_credit_packages 
ADD COLUMN IF NOT EXISTS description TEXT 
COMMENT 'description to show on pricing page';


-- Add metadata column (JSON, nullable)
ALTER TABLE university_credit_packages 
ADD COLUMN IF NOT EXISTS meta JSON 
COMMENT 'Extensible config: { "max_unlocks_per_day": 10, "features": ["export", "bulk"] }';


INSERT INTO `university_credit_packages` 
(`name`, `credits`, `price_inr`, `validity_days`, `is_active`, `display_order`, `description`, `tax_rate_percent`, `meta`)
VALUES
(
  'Trial: 25 Unlocks',
  25,
  249.00,
  90,
  1,
  1,
  'Low-risk trial — 25 recruiter contacts for ₹249 (incl. 18% GST). Valid 90 days.',
  18.00,
  '{"highlight": false, "badge": null, "max_unlocks_per_day": 10}'
),
(
  'Starter: 50 Unlocks',
  50,
  449.00,
  180,
  1,
  2,
  'Best value for small colleges — 50 unlocks at just ₹9/contact (save 10%!). Valid 6 months.',
  18.00,
  '{"highlight": false, "badge": "Popular", "max_unlocks_per_day": 25}'
),
(
  'Pro: 100 Unlocks',
  100,
  799.00,
  365,
  1,
  3,
  'Most popular plan — 100 contacts for ₹8/contact + 1-year validity. Ideal for active hiring.',
  18.00,
  '{"highlight": true, "badge": "Best Value", "max_unlocks_per_day": 50}'
),
(
  'Institutional: 250 Unlocks',
  250,
  1749.00,
  730,
  1,
  4,
  'Bulk savings for large universities — 250 contacts at ₹7/contact (30% off!) + 2-year validity.',
  18.00,
  '{"highlight": false, "badge": "Premium", "max_unlocks_per_day": 100, "support_priority": "high"}'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  credits = VALUES(credits),
  price_inr = VALUES(price_inr),
  validity_days = VALUES(validity_days),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order),
  description = VALUES(description),
  tax_rate_percent = VALUES(tax_rate_percent),
  meta = VALUES(meta);

------------------------------------22-11-2025---------------------------------------

ALTER TABLE `plans` 
MODIFY COLUMN `plan_type` ENUM('active','future','both','college','college_credits') 
NOT NULL DEFAULT 'active';

INSERT INTO `plans` (
  `plan_name`, `plan_slug`, `plan_type`, `description`, 
  `monthly_price`, `yearly_price`, 
  `monthly_credits`, `yearly_credits`, 
  `features`, 
  `is_active`, `is_visible`, `is_featured`, `display_order`,
  `price_per_college_monthly`, `price_per_college_yearly`,
  `razorpay_plan_id_monthly`, `razorpay_plan_id_yearly`,
  `created_at`, `updated_at`
) VALUES
  ('College Pack: 5', 'college-5', 'college_credits', 'Post to up to 5 colleges. Credits expire in 6 months.', 
   NULL, 500.00, 
   NULL, 5, 
   '{"expiry_days": 180}', 
   1, 1, 0, 9,
   NULL, NULL,
   NULL, NULL,
   NOW(), NOW()),

  ('College Pack: 10', 'college-10', 'college_credits', 'Post to up to 10 colleges. Credits expire in 6 months.', 
   NULL, 900.00, 
   NULL, 10, 
   '{"expiry_days": 180}', 
   1, 1, 0, 11,
   NULL, NULL,
   NULL, NULL,
   NOW(), NOW()),

  ('College Pack: 15', 'college-15', 'college_credits', 'Post to up to 15 colleges. Credits expire in 6 months.', 
   NULL, 1250.00, 
   NULL, 15, 
   '{"expiry_days": 180}', 
   1, 1, 0, 12,
   NULL, NULL,
   NULL, NULL,
   NOW(), NOW()),

  ('College Pack: 20', 'college-20', 'college_credits', 'Post to up to 20 colleges. Credits expire in 6 months.', 
   NULL, 1500.00, 
   NULL, 20, 
   '{"expiry_days": 180}', 
   1, 1, 0, 13,
   NULL, NULL,
   NULL, NULL,
   NOW(), NOW());

ALTER TABLE `company_subscriptions` 
MODIFY COLUMN `billing_cycle` ENUM('monthly','yearly','one_time') 
NOT NULL;




---------------------------------04-12-2025-----------------------------------------------

ALTER TABLE `conversations`
ADD UNIQUE KEY `conversations_job_application_id_type_unique` (`job_application_id`, `type`);




-----------------------------------06-12-2025------------------------------------------
INSERT INTO `filter_options` (`id`, `category`, `value`, `is_active`, `created_at`, `updated_at`) VALUES (NULL, 'duration', '6 Month', '1', '2025-08-08 13:58:10', '2025-08-08 13:58:10');

INSERT INTO `filter_options` (`id`, `category`, `value`, `is_active`, `created_at`, `updated_at`) VALUES (NULL, 'duration', '12 Month', '1', '2025-08-08 13:58:10', '2025-08-08 13:58:10');


ALTER TABLE applications
ADD COLUMN screening_answers JSON NOT NULL DEFAULT '[]' COMMENT 'Stores [{question: "...", answer: "..."}]';


-------------------------------------08-12-2025--------------------------------------------------
ALTER TABLE `job_posts`
ADD COLUMN `project_start_date` DATE NULL COMMENT 'Start date for Project-type opportunities',
ADD COLUMN `project_end_date` DATE NULL COMMENT 'End date for Project-type opportunities';





ALTER TABLE `interview_invitations`
  MODIFY COLUMN `interview_type` ENUM('Video call','Phone','In-office') NOT NULL DEFAULT 'In-office',
  ADD COLUMN `phone_number` VARCHAR(20) NULL,
  ADD COLUMN `office_address` TEXT NULL;

ALTER TABLE `interview_invitations`
MODIFY COLUMN `interview_type` VARCHAR(20) NOT NULL DEFAULT 'In-office';




-- 1. Normalize known variants to standard names
UPDATE `interview_invitations`
SET `interview_type` = 'Video call'
WHERE LOWER(TRIM(`interview_type`)) IN ('videocall', 'video call', 'video', 'videocalling', 'vc');

UPDATE `interview_invitations`
SET `interview_type` = 'Phone'
WHERE LOWER(TRIM(`interview_type`)) IN ('phone', 'phone call', 'call', 'telephonic');

UPDATE `interview_invitations`
SET `interview_type` = 'In-office'
WHERE LOWER(TRIM(`interview_type`)) IN ('in office', 'in-office', 'office', 'in person', 'inperson', '');

-- 2. Handle NULL or empty interview_type
--    → if video_link exists (non-null & non-empty), set to 'Video call'
UPDATE `interview_invitations`
SET `interview_type` = 'Video call'
WHERE (`interview_type` IS NULL OR TRIM(`interview_type`) = '')
  AND (`video_link` IS NOT NULL AND TRIM(`video_link`) != '');

-- 3. Remaining NULL/empty → default to 'In-office'
UPDATE `interview_invitations`
SET `interview_type` = 'In-office'
WHERE (`interview_type` IS NULL OR TRIM(`interview_type`) = '');


ALTER TABLE `interview_invitations`
ALTER COLUMN `interview_type` SET DEFAULT 'In-office';


----------------------------------09-12-2025-----------------------------------------------
ALTER TABLE `interview_invitations`
  ADD COLUMN `scheduled_notification_sent_at` DATETIME NULL DEFAULT NULL AFTER `office_address`,
  ADD COLUMN `reminder_notification_sent_at` DATETIME NULL DEFAULT NULL AFTER `scheduled_notification_sent_at`;



ALTER TABLE `job_posts`
  ADD COLUMN `eligible_education_levels` JSON NULL DEFAULT '[]' AFTER `college_ids`,
  ADD COLUMN `eligible_specialization_ids` JSON NULL DEFAULT '[]' AFTER `eligible_education_levels`,
  ADD COLUMN `other_eligible_specializations` JSON NULL DEFAULT '[]' AFTER `eligible_specialization_ids`,
  ADD COLUMN `include_pursuing_students` BOOLEAN NOT NULL DEFAULT FALSE AFTER `other_eligible_specializations`,
  ADD COLUMN `experience_required` BOOLEAN NOT NULL DEFAULT FALSE AFTER `include_pursuing_students`,
  ADD COLUMN `experience_min` INT NULL DEFAULT NULL AFTER `experience_required`,
  ADD COLUMN `experience_max` INT NULL DEFAULT NULL AFTER `experience_min`,
  ADD COLUMN `experience_types` JSON NULL DEFAULT '[]' AFTER `experience_max`;

---------------------------------10-12-2025---------------------

CREATE TABLE `assignment_submissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `assignment_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `text_response` TEXT NULL,
  `file_url` VARCHAR(500) NULL,
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assignment_id` (`assignment_id`),
  KEY `idx_student_id` (`student_id`),
  CONSTRAINT `fk_submission_assignment` 
    FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submission_student` 
    FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


ALTER TABLE `messages` 
MODIFY COLUMN `message_type` ENUM('text','image','document','assignment','assignment_submission','interview_invite','system') 
NOT NULL DEFAULT 'text';


----------------------------------12-12-2025--------------------

CREATE TABLE `access_scopes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `scope_type` ENUM('COMPANY','UNIVERSITY') NOT NULL,
  `scope_id` INT NOT NULL COMMENT 'ID of the scoped entity (e.g., company_recruiter_profiles.id)',
  `name` VARCHAR(255) NOT NULL COMMENT 'Human-readable name (e.g., company name)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_scope_type_scope_id` (`scope_type`, `scope_id`),
  KEY `idx_scope_type` (`scope_type`),
  KEY `idx_scope_id` (`scope_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `access_roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `scope_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `is_system` TINYINT(1) NOT NULL DEFAULT '0',
  `created_by` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_scope_id_name` (`scope_id`, `name`),
  KEY `idx_scope_id` (`scope_id`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_access_roles_scope_id` 
    FOREIGN KEY (`scope_id`) REFERENCES `access_scopes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_access_roles_created_by` 
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `user_access_memberships` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `scope_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT '0',
  `status` ENUM('invited','active','suspended','left') NOT NULL DEFAULT 'invited',
  `joined_at` DATETIME NULL,
  `created_by` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_scope` (`user_id`, `scope_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_scope_id` (`scope_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_memberships_user_id` 
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_memberships_scope_id` 
    FOREIGN KEY (`scope_id`) REFERENCES `access_scopes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_memberships_role_id` 
    FOREIGN KEY (`role_id`) REFERENCES `access_roles` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_memberships_created_by` 
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;








CREATE TABLE `permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL COMMENT 'Code-safe permission key, e.g., ''job.create''',
  `module` VARCHAR(30) NOT NULL COMMENT 'Logical grouping, e.g., ''job'', ''applicant''',
  `name` VARCHAR(100) NOT NULL COMMENT 'Human-readable name',
  `description` TEXT NULL,
  `is_deprecated` TINYINT(1) NOT NULL DEFAULT '0',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permission_key` (`key`),
  KEY `idx_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--  Seed core permissions (run AFTER table creation)
INSERT INTO `permissions` (`key`, `module`, `name`, `description`) VALUES
('job.create', 'job', 'Create Job Post', 'Create new job/internship/project postings'),
('job.edit.own', 'job', 'Edit Own Jobs', 'Edit jobs created by the user'),
('job.edit.all', 'job', 'Edit All Jobs', 'Edit any job in the company'),
('job.delete.own', 'job', 'Delete Own Jobs', 'Delete own draft/published jobs'),
('job.delete.all', 'job', 'Delete All Jobs', 'Delete any job in the company'),
('job.view.own', 'job', 'View Own Jobs', 'View jobs created by the user'),
('job.view.all', 'job', 'View All Jobs', 'View all jobs in the company'),
('job.toggle.active', 'job', 'Toggle Job Status', 'Activate/deactivate/pause jobs'),

('applicant.view.own', 'applicant', 'View Own Applicants', 'View applicants to own jobs'),
('applicant.view.all', 'applicant', 'View All Applicants', 'View all applicants in the company'),
('applicant.schedule.interview', 'applicant', 'Schedule Interviews', 'Create and manage interview slots'),
('applicant.give.feedback', 'applicant', 'Submit Feedback', 'Add feedback/notes on applicants'),
('applicant.download.resume', 'applicant', 'Download Resumes', 'Download applicant resumes/CVs'),

('user.invite', 'user', 'Invite Team Members', 'Invite new users to the company'),
('user.manage.roles', 'user', 'Manage Roles & Permissions', 'Create/edit roles and assign permissions'),
('user.view.list', 'user', 'View Team List', 'See list of team members and their roles'),
('user.suspend', 'user', 'Suspend Team Members', 'Temporarily disable a user''s access'),
('user.remove', 'user', 'Remove Team Members', 'Remove a user from the company'),

('profile.edit.company', 'profile', 'Edit Company Profile', 'Update company name, logo, about, etc.'),
('profile.edit.contact', 'profile', 'Edit Contact Info', 'Update phone, email, address'),

('billing.view', 'billing', 'View Billing Info', 'See invoices, plans, usage'),
('billing.manage.payment', 'billing', 'Manage Payment Methods', 'Add/update payment methods'),

('analytics.view.dashboard', 'analytics', 'View Analytics Dashboard', 'Access hiring metrics and reports');



CREATE TABLE `role_permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `role_id` INT NOT NULL,
  `permission_id` INT NOT NULL,
  `created_by` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_permission_id` (`permission_id`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_role_perms_role_id` 
    FOREIGN KEY (`role_id`) REFERENCES `access_roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_perms_permission_id` 
    FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_perms_created_by` 
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `audit_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `event_type` VARCHAR(50) NOT NULL COMMENT 'e.g., ''role.created'', ''permission.granted''',
  `actor_user_id` INT NOT NULL,
  `scope_id` INT NULL,
  `target_type` VARCHAR(30) NULL COMMENT 'e.g., ''user'', ''role'', ''job''',
  `target_id` VARCHAR(100) NULL COMMENT 'String to support UUIDs or compound IDs',
  `old_value` JSON NULL,
  `new_value` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_actor_user_id` (`actor_user_id`),
  KEY `idx_scope_id` (`scope_id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_audit_actor_user_id` 
    FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_audit_scope_id` 
    FOREIGN KEY (`scope_id`) REFERENCES `access_scopes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




-- Add invited_email column to user_access_memberships
ALTER TABLE `user_access_memberships`
ADD COLUMN `invited_email` VARCHAR(255) NULL COMMENT 'Email of invited (non-registered) user' AFTER `created_by`;

-- Add index for invite lookup
CREATE INDEX `idx_invited_email` ON `user_access_memberships` (`invited_email`);






--------------------------------------------13-12-2025-----------------------------
-- also added a particular user according to scope for testing access_roles

ALTER TABLE `user_access_memberships`
MODIFY COLUMN `user_id` INT NULL;

-- undo the changes
ALTER TABLE `user_access_memberships`
MODIFY COLUMN `user_id` INT NOT NULL;


--------------------------------------------15-12-2025---------------------

-- Clear existing (if testing)
DELETE FROM permissions;

-- Insert core permissions
INSERT INTO permissions (`key`, `module`, `name`, `description`) VALUES
--  JOB MANAGEMENT
('job.create', 'job', 'Create Job Post', 'Create new job/internship/project postings'),
('job.edit.own', 'job', 'Edit Own Jobs', 'Edit jobs created by the user'),
('job.edit.all', 'job', 'Edit All Jobs', 'Edit any job in the company'),
('job.delete.own', 'job', 'Delete Own Jobs', 'Delete own draft/published jobs'),
('job.delete.all', 'job', 'Delete All Jobs', 'Delete any job in the company'),
('job.view.own', 'job', 'View Own Jobs', 'View jobs created by the user'),
('job.view.all', 'job', 'View All Jobs', 'View all jobs in the company'),
('job.toggle.active', 'job', 'Toggle Job Status', 'Activate/deactivate/pause jobs'),

--  APPLICANT MANAGEMENT
('applicant.view.own', 'applicant', 'View Own Applicants', 'View applicants to own jobs'),
('applicant.view.all', 'applicant', 'View All Applicants', 'View all applicants in the company'),
('applicant.schedule.interview', 'applicant', 'Schedule Interviews', 'Create and manage interview slots'),
('applicant.give.feedback', 'applicant', 'Submit Feedback', 'Add feedback/notes on applicants'),
('applicant.download.resume', 'applicant', 'Download Resumes', 'Download applicant resumes/CVs'),

--  FEED MANAGEMENT
('feed.post', 'feed', 'Post to Company Feed', 'Create posts on company feed'),
('feed.edit.own', 'feed', 'Edit Own Feed Posts', 'Edit own feed posts'),
('feed.delete.own', 'feed', 'Delete Own Feed Posts', 'Delete own feed posts'),

--  PROFILE MANAGEMENT
('profile.edit.company', 'profile', 'Edit Company Profile', 'Update company name, logo, about, etc.'),
('profile.edit.contact', 'profile', 'Edit Contact Info', 'Update phone, email, address'),

--  TEAM & ROLE MANAGEMENT
('user.invite', 'user', 'Invite Team Members', 'Add new team members'),
('user.manage.roles', 'user', 'Manage Roles & Permissions', 'Create/edit roles and assign permissions'),
('user.view.list', 'user', 'View Team List', 'See list of team members and their roles'),
('user.suspend', 'user', 'Suspend Team Members', 'Temporarily disable a user''s access'),
('user.remove', 'user', 'Remove Team Members', 'Remove a user from the company'),

--  BILLING (Critical for your subscription model)
('billing.view', 'billing', 'View Billing Info', 'See invoices, plans, usage'),
('billing.manage.payment', 'billing', 'Manage Payment Methods', 'Add/update payment methods'),

--  ANALYTICS
('analytics.view.dashboard', 'analytics', 'View Analytics Dashboard', 'Access hiring metrics and reports');




CREATE TABLE `job_access` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `job_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `access_level` ENUM('view','edit','manage') NOT NULL DEFAULT 'view',
  `assigned_by` INT NOT NULL,
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_job_user` (`job_id`, `user_id`),
  KEY `idx_job_id` (`job_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_job_access_job` 
    FOREIGN KEY (`job_id`) REFERENCES `job_posts` (`job_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_job_access_user` 
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_job_access_assigned_by` 
    FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB;


INSERT INTO permissions (`key`, `module`, `name`, `description`) 
VALUES ('job.assign', 'job', 'Assign Job Access', 'Assign team members to jobs');




--------------------------------16-12-2025-------------------------

CREATE TABLE `profile_views` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `viewer_user_id` INT NOT NULL,
  `viewed_user_id` INT NOT NULL,
  `source` VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'direct',
  `viewed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  
  KEY `idx_viewer_viewed` (`viewer_user_id`, `viewed_user_id`),
  KEY `idx_viewed_user_time` (`viewed_user_id`, `viewed_at`),
  KEY `idx_viewer_at` (`viewer_user_id`, `viewed_at`),
  
  CONSTRAINT `fk_profile_views_viewer_user` 
    FOREIGN KEY (`viewer_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    
  CONSTRAINT `fk_profile_views_viewed_user` 
    FOREIGN KEY (`viewed_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



INSERT INTO role_permissions (role_id, permission_id, created_by, created_at)
SELECT 
  ar.id AS role_id,
  p.id AS permission_id,
  uam.user_id AS created_by,   --  owner's user ID
  NOW() AS created_at
FROM access_roles ar
INNER JOIN user_access_memberships uam 
  ON uam.role_id = ar.id 
  AND uam.is_primary = true    -- ensure we get the actual owner user
  AND uam.status = 'active'
CROSS JOIN permissions p
WHERE 
  ar.name = 'Owner' 
  AND ar.is_system = true
  AND p.is_deprecated = false
  AND NOT EXISTS (
    SELECT 1 
    FROM role_permissions rp 
    WHERE rp.role_id = ar.id 
      AND rp.permission_id = p.id
  );


--------------------------------------------19-12-2025------------------------------------
ALTER TABLE `job_post_skills`
ADD COLUMN `type` ENUM('must_have', 'preferred') NOT NULL DEFAULT 'preferred';




------------------------------------------29-12-2025--------------------------------
ALTER TABLE interview_invitations
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' AFTER message;






-----------------------------------------31-12-2025----------------------------


CREATE TABLE learning_resources (
  resource_id INT PRIMARY KEY AUTO_INCREMENT,
  resource_type ENUM('course', 'project', 'internship') NOT NULL,
  
  -- Internal or external resource
  source_type ENUM('internal', 'external_agency') DEFAULT 'internal',
  
  -- For internal resources (your jobposts)
  job_post_id INT NULL,
  
  -- For external resources (3rd party) - will use later
  external_provider_name VARCHAR(255) NULL,
  external_resource_id VARCHAR(255) NULL,
  external_url TEXT NULL,
  
  -- Common metadata
  title VARCHAR(500) NOT NULL,
  description TEXT,
  difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
  
  -- Timeline
  total_duration DECIMAL(5,2) NOT NULL,
  
  -- Availability
  is_active BOOLEAN DEFAULT TRUE,
  available_seats INT NULL,
  
  -- Dates (for internships/projects)
  start_date DATE NULL,
  end_date DATE NULL,
  
  -- Additional metadata
  rating DECIMAL(3,2) NULL,
  completion_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_type (resource_type),
  INDEX idx_active (is_active),
  INDEX idx_source (source_type),
  
  FOREIGN KEY (job_post_id) REFERENCES job_posts(job_id) ON DELETE CASCADE
);




CREATE TABLE resource_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  resource_id INT NOT NULL,
  skill_id INT NOT NULL,
  
  -- How important is this skill in this resource?
  skill_importance ENUM('primary', 'secondary', 'bonus') DEFAULT 'primary',
  
  -- Time to learn THIS specific skill within the resource
  -- NULL for internships/projects (no per-skill granularity)
  -- Set for courses only
  skill_learning_duration DECIMAL(5,2) NULL,
  
  -- Is this skill a prerequisite or outcome?
  skill_type ENUM('prerequisite', 'outcome') DEFAULT 'outcome',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_resource_skill (resource_id, skill_id),
  FOREIGN KEY (resource_id) REFERENCES learning_resources(resource_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
  
  INDEX idx_skill (skill_id),
  INDEX idx_resource (resource_id)
);


CREATE TABLE user_pathway_preferences (
  user_id INT PRIMARY KEY,
  
  -- Ordered preference (JSON array)
  resource_priority JSON NOT NULL DEFAULT '["internship", "project", "course"]',
  
  -- Constraints
  max_timeline INT DEFAULT 365,
  min_timeline INT DEFAULT 1,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE user_pathways (
  pathway_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  -- What triggered this pathway?
  strategy_type ENUM('job_specific', 'company_target', 'direct_upskilling') NOT NULL,
  target_job_id INT NULL,
  target_company_id INT NULL,
  target_domains JSON NULL,
  
  -- Pathway metadata
  pathway_rank TINYINT NOT NULL,  -- 1, 2, or 3
  total_duration DECIMAL(5,2) NOT NULL,
  total_skills_covered INT NOT NULL,
  skill_coverage_percent DECIMAL(5,2) DEFAULT 100.00,
  
  -- Resource composition
  total_internships INT DEFAULT 0,
  total_projects INT DEFAULT 0,
  total_courses INT DEFAULT 0,
  
  -- Scoring
  pathway_score DECIMAL(8,2) NOT NULL,
  
  -- Status
  status ENUM('suggested', 'selected', 'in_progress', 'completed', 'abandoned') DEFAULT 'suggested',
  selected_at TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (target_job_id) REFERENCES job_posts(job_id) ON DELETE SET NULL,
  
  INDEX idx_user_status (user_id, status),
  INDEX idx_created (created_at)
);




CREATE TABLE pathway_steps (
  step_id INT PRIMARY KEY AUTO_INCREMENT,
  pathway_id INT NOT NULL,
  resource_id INT NOT NULL,
  
  -- Sequencing
  step_order INT NOT NULL,
  
  -- What skills does THIS step cover for THIS user?
  skills_to_learn JSON NOT NULL,
  
  -- Timeline for THIS user
  -- For courses: personalized based on skills user already knows
  -- For internships/projects: full duration (no personalization)
  expected_duration DECIMAL(5,2) NOT NULL,
  
  -- Status tracking
  status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending',
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  
  -- Progress
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pathway_id) REFERENCES user_pathways(pathway_id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES learning_resources(resource_id) ON DELETE RESTRICT,
  
  UNIQUE KEY unique_pathway_step (pathway_id, step_order),
  INDEX idx_pathway (pathway_id)
);



-------------------------------------03-01-2026------------------------------

ALTER TABLE `user_skills` CHANGE `skill` `skill` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL;



------------------------------------05-01-2026--------------------------------
ALTER TABLE user_pathways 
ADD COLUMN target_company_ids JSON DEFAULT NULL AFTER target_company_id,
ADD COLUMN target_role_ids JSON DEFAULT NULL AFTER target_company_ids;



ALTER TABLE `user_pathways` 
MODIFY COLUMN `strategy_type` ENUM('job_specific', 'company_target', 'direct_upskilling','company_role_target')
NOT NULL;

------------------------------------06-01-2026--------------------------
ALTER TABLE learning_resources 
MODIFY COLUMN resource_type ENUM('course', 'project', 'internship', 'job') NOT NULL;


ALTER TABLE `user_pathways` ADD `total_jobs` INT(11) NULL DEFAULT '0' AFTER `total_courses`;


-------------------------------------09-01-2026--------------------------

ALTER TABLE `job_post_skills`
ADD COLUMN `min_experience_months` INT UNSIGNED NULL DEFAULT NULL
COMMENT 'Minimum experience in months for this skill (optional)';



------------------------------------13-01-2026----------------------------

ALTER TABLE `user_skills`
ADD COLUMN `experience_months` INT UNSIGNED NULL DEFAULT NULL
COMMENT 'Experience in months for this specific skill';




------------------------------------16-01-2026---------------------------


-- Add user_category column to user_details for ai prediction

ALTER TABLE user_details 
ADD COLUMN user_category ENUM('currently_studying', 'fresher', 'working_professional') 
NOT NULL DEFAULT 'currently_studying'
AFTER about_us;




ALTER TABLE resource_skills
ADD COLUMN experience_months_provided INT DEFAULT 0 ,
ADD COLUMN is_prerequisite BOOLEAN DEFAULT FALSE;




DROP TABLE IF EXISTS pathway_steps;
DROP TABLE IF EXISTS user_pathways;





-- Create new user_pathways table
CREATE TABLE user_pathways (
  pathway_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  
  -- Target information
  target_type ENUM('job_specific', 'role_specific', 'upskilling') NOT NULL,
  target_job_id INT DEFAULT NULL,
  target_role_name VARCHAR(255) DEFAULT NULL,
  
  -- Pathway metadata
  pathway_rank TINYINT NOT NULL COMMENT '1, 2, 3 for top 3 pathways',
  total_duration_months DECIMAL(5,2) NOT NULL,
  
  -- Skill coverage
  must_have_coverage_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  preferred_coverage_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  overall_skill_coverage_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  
  -- Experience gained (JSON: {skill_id: experience_months, ...})
  total_experience_gained JSON DEFAULT NULL,
  
  -- Resource counts
  total_courses INT DEFAULT 0,
  total_projects INT DEFAULT 0,
  total_internships INT DEFAULT 0,
  total_jobs INT DEFAULT 0,
  
  -- Scoring
  pathway_score DECIMAL(8,2) NOT NULL,
  
  -- User preferences snapshot
  user_preferences JSON DEFAULT NULL,
  
  -- Status
  status ENUM('active', 'outdated', 'selected', 'in_progress', 'completed', 'abandoned') DEFAULT 'active',
  
  -- Cache expiry
  expires_at DATETIME DEFAULT NULL COMMENT 'Pathway cache expiry (e.g., 7 days from generation)',
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  CONSTRAINT fk_user_pathways_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_pathways_job FOREIGN KEY (target_job_id) REFERENCES job_posts(job_id) ON DELETE SET NULL,
  
  -- Indexes
  KEY idx_user_target (user_id, target_type, status),
  KEY idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;






-- Create pathway_steps table
CREATE TABLE pathway_steps (
  step_id INT AUTO_INCREMENT PRIMARY KEY,
  pathway_id INT NOT NULL,
  step_order INT NOT NULL COMMENT '1, 2, 3, ... order in pathway',
  
  -- Resource reference (can be NULL if placeholder)
  resource_id INT DEFAULT NULL,
  
  -- Metadata (stored for display even if resource deleted)
  resource_type ENUM('course', 'project', 'internship', 'job') NOT NULL,
  resource_title VARCHAR(500) NOT NULL,
  resource_missing TINYINT(1) DEFAULT 0 COMMENT 'TRUE if this is a placeholder for missing resource',
  
  -- Step details
  duration_months DECIMAL(5,2) NOT NULL,
  
  -- Skills gained in this step (JSON array)
  skills_gained JSON DEFAULT NULL COMMENT 'Array of {skill_id, skill_name, experience_months}',
  
  -- Prerequisites met?
  prerequisites_met TINYINT(1) DEFAULT 1 COMMENT 'Does user meet prerequisites at this step?',
  
  -- Why this step is needed
  step_reasoning TEXT DEFAULT NULL COMMENT 'E.g., "Adds React skill with 6 months experience (required: 12 months)"',
  
  -- Status
  status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending',
  
  started_at DATETIME DEFAULT NULL,
  completed_at DATETIME DEFAULT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  CONSTRAINT fk_pathway_steps_pathway FOREIGN KEY (pathway_id) REFERENCES user_pathways(pathway_id) ON DELETE CASCADE,
  CONSTRAINT fk_pathway_steps_resource FOREIGN KEY (resource_id) REFERENCES learning_resources(resource_id) ON DELETE SET NULL,
  
  -- Indexes
  KEY idx_pathway_order (pathway_id, step_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;








ALTER TABLE user_pathway_preferences
ADD COLUMN include_courses BOOLEAN DEFAULT TRUE,
ADD COLUMN include_projects BOOLEAN DEFAULT TRUE,
ADD COLUMN include_internships BOOLEAN DEFAULT TRUE,
ADD COLUMN include_jobs BOOLEAN DEFAULT TRUE,
ADD COLUMN prefer_free_resources BOOLEAN DEFAULT FALSE,
ADD COLUMN prefer_short_duration BOOLEAN DEFAULT FALSE,
ADD COLUMN max_pathway_duration_months INT NULL;




------------------------------------09-02-2026--------------------------------------------

ALTER TABLE `company_recruiter_profiles`
  ADD COLUMN `gst_number` VARCHAR(50) NULL DEFAULT NULL AFTER `about`,
  ADD COLUMN `company_address` TEXT NULL DEFAULT NULL AFTER `gst_number`;



ALTER TABLE `users`
  ADD COLUMN `dob` DATE NULL DEFAULT NULL AFTER `phone`,
  ADD COLUMN `gender` ENUM('male','female','other') NULL DEFAULT NULL AFTER `dob`;

  


drop the table terms and import it using the file.


-------------------------------------23-02-2026----------------------

ALTER TABLE `company_recruiter_profiles` CHANGE `user_id` `user_id` INT(11) NULL;



----------------------------------------24-02-2026------------------



ALTER TABLE company_recruiter_profiles 
ADD COLUMN status INT NOT NULL DEFAULT 1 COMMENT '0:Seed, 1:Active, 2:Blocked, 3:Student-Pending';

-- Step 2: Add 'is_verified' column
-- 0: Pending Admin Review, 1: Admin Approved
ALTER TABLE company_recruiter_profiles 
ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0:Pending, 1:Verified';



UPDATE company_recruiter_profiles 
SET status = 0, is_verified = 0 
WHERE user_id IS NULL;



------------------------------------------25-02-2026-------------------------------

CREATE TABLE IF NOT EXISTS `job_role_domains` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `job_role_id` INT NOT NULL,
  `domain_id` INT NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Flag to mark primary/recommended domains for this job role',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT 'Order to display suggested domains',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_job_role_domains_job_role` 
    FOREIGN KEY (`job_role_id`) 
    REFERENCES `job_roles` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
    
  CONSTRAINT `fk_job_role_domains_domain` 
    FOREIGN KEY (`domain_id`) 
    REFERENCES `domains` (`domain_id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
    
  CONSTRAINT `unique_job_role_domain` 
    UNIQUE KEY `unique_job_role_domain` (`job_role_id`, `domain_id`),
    
  KEY `idx_job_role_domains_job_role_id` (`job_role_id`),
  KEY `idx_job_role_domains_domain_id` (`domain_id`),
  KEY `idx_job_role_domains_ranking` (`is_primary`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




INSERT INTO `job_role_domains` (`job_role_id`, `domain_id`, `is_primary`, `display_order`) VALUES
(6, 1, 1, 0),  
(6, 9, 1, 1),  
(6, 17, 0, 0),  
(6, 14, 0, 0);



--------------------------------------26-02-2025---------------------------

--  COURSES
ALTER TABLE `courses` 
ADD COLUMN `status` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0=Pending, 1=Approved, 2=Rejected' 
AFTER `name`;
CREATE INDEX idx_courses_status ON `courses` (`status`);

--  DOMAINS
ALTER TABLE `domains` 
ADD COLUMN `status` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0=Pending, 1=Approved, 2=Rejected' 
AFTER `domain_name`;
CREATE INDEX idx_domains_status ON `domains` (`status`);

--  Skills
ALTER TABLE `skills` 
ADD COLUMN `status` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0=Pending, 1=Approved, 2=Rejected' 
AFTER `skill_name`;
CREATE INDEX idx_skills_status ON `skills` (`status`);

-- INDUSTRIES
ALTER TABLE `industries` 
ADD COLUMN `status` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0=Pending, 1=Approved, 2=Rejected' 
AFTER `name`;
CREATE INDEX idx_industries_status ON `industries` (`status`);

--  JOB_ROLES
ALTER TABLE `job_roles` 
ADD COLUMN `status` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0=Pending, 1=Approved, 2=Rejected' 
AFTER `title`;
CREATE INDEX idx_job_roles_status ON `job_roles` (`status`);

--  LOCATIONS
ALTER TABLE `locations` 
ADD COLUMN `status` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0=Pending, 1=Approved, 2=Rejected' 
AFTER `name`;
CREATE INDEX idx_locations_status ON `locations` (`status`);

-- SCHOOL_COLLEGES
ALTER TABLE `school_colleges` 
ADD COLUMN `status` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0=Pending, 1=Approved, 2=Rejected' 
AFTER `name`;
CREATE INDEX idx_school_colleges_status ON `school_colleges` (`status`);



-- Run only after you verify existing data is clean:

UPDATE `skills` SET `status` = 1;
UPDATE `courses` SET `status` = 1;
UPDATE `domains` SET `status` = 1;
UPDATE `industries` SET `status` = 1;
UPDATE `job_roles` SET `status` = 1;
UPDATE `locations` SET `status` = 1;
UPDATE `school_colleges` SET `status` = 1;













---------------------------------------24/03/26-------------------



CREATE TABLE need_assistance (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
 
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
 
    attachment VARCHAR(500),
 
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 
    INDEX (user_id),
 
    CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;


  --Add State column

ALTER TABLE`company_recruiter_profiles` 

ADD COLUMN `state` VARCHAR(100) NULL COMMENT 'State/Province name' AFTER`company_location_id`;

  --Add Country column

ALTER TABLE`company_recruiter_profiles` 

ADD COLUMN `country` VARCHAR(100) NULL COMMENT 'Country name' AFTER`state`;

  --Add Pincode column

ALTER TABLE`company_recruiter_profiles` 

ADD COLUMN `pincode` VARCHAR(20) NULL COMMENT 'Postal/ZIP code' AFTER`country`;
 
ALTER TABLE`company_recruiter_profiles` 

ADD COLUMN `address_line_1` VARCHAR(255) NULL COMMENT 'Primary address line (street, building, area)' AFTER`company_location_id`,

    ADD COLUMN `address_line_2` VARCHAR(255) NULL COMMENT 'Secondary address line (landmark, locality, etc.)' AFTER`address_line_1`;




11-04-2026
 education table 
ALTER TABLE educations
ADD COLUMN approval_status ENUM('approved','pending','rejected') 
NOT NULL DEFAULT 'approved' AFTER education_certificate,

ADD COLUMN removed_by_university TINYINT(1) 
NOT NULL DEFAULT 0 AFTER approval_status,

ADD COLUMN removal_reason TEXT 
NULL AFTER removed_by_university,

ADD COLUMN proof_document VARCHAR(255) 
NULL AFTER removal_reason,

ADD COLUMN reapproval_requested TINYINT(1) 
NOT NULL DEFAULT 0 AFTER proof_document,

ADD COLUMN approved_by_university_id INT(11) 
NULL AFTER reapproval_requested;



experice table 

ALTER TABLE experiences
ADD COLUMN approval_status ENUM('approved','pending','rejected') 
NOT NULL DEFAULT 'approved' AFTER status,

ADD COLUMN removed_by_company TINYINT(1) 
NOT NULL DEFAULT 0 AFTER approval_status,

ADD COLUMN removal_reason TEXT 
NULL AFTER removed_by_company,

ADD COLUMN proof_document VARCHAR(255) 
NULL AFTER removal_reason,

ADD COLUMN reapproval_requested TINYINT(1) 
NOT NULL DEFAULT 0 AFTER proof_document,

ADD COLUMN approved_by_company_id INT(11) 
NULL AFTER reapproval_requested;

university broadcast

CREATE TABLE `university_broadcasts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,

  `university_id` INT NOT NULL,

  `courses_selected` JSON NOT NULL,

  `industries_selected` JSON NOT NULL,

  `is_immediate` BOOLEAN DEFAULT TRUE,

  `start_date` DATE DEFAULT NULL,

  `companies_reached` INT NOT NULL DEFAULT 0,

  `credits_used` INT NOT NULL DEFAULT 0,

  `status` VARCHAR(255) DEFAULT 'Delivered',

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
  ON UPDATE CURRENT_TIMESTAMP
);


this is for employees to see the experience added by them and also the experience added by the company for them.
SELECT COUNT(*) AS ct
FROM experiences
WHERE company_id = 39 OR company_recruiter_profile_id = 39;

SELECT id, user_detail_id, organization_name, start_date, end_date, job_role_id, approval_status, company_recruiter_profile_id
FROM experiences
WHERE company_recruiter_profile_id = 39
ORDER BY updated_at DESC
LIMIT 100;
































*/
}