-- College Pack: 1 — campus hiring credit bundle (₹100 base, 1 college, 1 year validity in app)
-- Run against your MySQL database once. plan_type must be `college_credits` (see models/plan.js ENUM).

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
) VALUES (
  'College Pack: 1',
  'college-pack-1',
  'college_credits',
  'Campus hiring: 1 college, 1 year validity.',
  NULL,
  100.00,
  NULL,
  1,
  '{"expiry_days":365}',
  1,
  1,
  0,
  1,
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
  yearly_price = VALUES(yearly_price),
  yearly_credits = VALUES(yearly_credits),
  features = VALUES(features),
  display_order = VALUES(display_order),
  is_active = VALUES(is_active),
  is_visible = VALUES(is_visible),
  updated_at = NOW();
