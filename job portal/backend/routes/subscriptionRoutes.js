// routes/subscriptionRoutes.js
const express = require("express");
const router = express.Router();
const  authMiddleware = require("../middleware/authMiddleware");
const collegeCreditController = require("../controllers/collegeCreditController");

const {getPlans, initiateSubscription,getSubscriptionStatus, pauseSubscription, resumeSubscription, cancelSubscription } = require("../controllers/subscriptionController");

// Public: List plans
router.get("/plans", getPlans);

// Protected: Initiate subscription
router.post(
  "/initiate",
  authMiddleware,
  initiateSubscription
);

router.post("/pause", authMiddleware, pauseSubscription);
router.post("/resume", authMiddleware, resumeSubscription);
router.post("/cancel", authMiddleware, cancelSubscription);

// GET /api/subscriptions/status/:subscription_id
router.get("/status/:subscription_id",getSubscriptionStatus)


// mounted on  /api/subscriptions/
// College credit-specific routes
router.post(
  "/credits/order",
  authMiddleware,
  collegeCreditController.createCollegeCreditOrder
);
router.get(
  "/credits/plans",
  collegeCreditController.getCollegeCreditPlans
);

router.get("/credits/balance", authMiddleware, collegeCreditController.getCollegeCreditBalance);

// College-specific checkout flow
router.get('/jobs/:job_id/college-checkout', authMiddleware, collegeCreditController.getCollegeCheckoutPreview);
router.put('/jobs/:job_id/colleges', authMiddleware, collegeCreditController.updateJobColleges);
router.post('/jobs/:job_id/publish-college', authMiddleware, collegeCreditController.publishCollegeJob);
router.post('/jobs/:job_id/college-checkout-pay', authMiddleware, collegeCreditController.createCollegeCheckoutPayment);
// Add this new route!
// router.post("/credits/verify", authMiddleware, collegeCreditController.verifyCollegePayment);
module.exports = router;