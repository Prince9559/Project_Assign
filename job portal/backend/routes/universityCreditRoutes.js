// routes/universityCreditRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const universityCreditController = require("../controllers/universityCreditController");

const universityBroadcastController = require("../controllers/universityBroadcastController");
const universityNotificationBoostController = require("../controllers/universityNotificationBoostController");

// Add these to your mounted router
router.get("/broadcast/options", authMiddleware, universityBroadcastController.getBroadcastOptions);
router.post("/broadcast/send", authMiddleware, universityBroadcastController.sendBroadcast);
router.post(
  "/notifications/send",
  authMiddleware,
  universityBroadcastController.sendBroadcast
);
router.get("/broadcast/history", authMiddleware, universityBroadcastController.getBroadcastHistory);
//mounted on /api/university/
router.get("/credit-packages", universityCreditController.getCreditPackages);
router.post("/credit-orders",authMiddleware, universityCreditController.createCreditOrder);
router.post("/unlock-contact",authMiddleware, universityCreditController.unlockContact);
router.get(
  "/unlocked-contacts",authMiddleware,
  universityCreditController.getUnlockedContacts
);

router.get("/credit-status", authMiddleware, universityCreditController.getCreditStatus);
router.get(
  "/credit-dashboard",
  authMiddleware,
  universityCreditController.getCreditDashboard
);

// GET /credit-transactions?page=1&limit=10&action_type=used
router.get(
  "/credit-transactions",
  authMiddleware,
  universityCreditController.getCreditTransactions
);

// Notification Boost (separate credit pool from contact credits)
router.get(
  "/notification-boost/credits",
  authMiddleware,
  universityNotificationBoostController.getCredits
);
router.get(
  "/notification-boost/packs",
  authMiddleware,
  universityNotificationBoostController.getCreditPacks
);
router.get(
  "/notification-boost/options",
  authMiddleware,
  universityNotificationBoostController.getFormOptions
);
router.post(
  "/notification-boost/preview",
  authMiddleware,
  universityNotificationBoostController.previewBoost
);
router.post(
  "/notification-boost/submit",
  authMiddleware,
  universityNotificationBoostController.submitBoost
);
router.get(
  "/notification-boost/history",
  authMiddleware,
  universityNotificationBoostController.getHistory
);
router.get(
  "/notification-boost/requests/:id",
  authMiddleware,
  universityNotificationBoostController.getRequestDetail
);
router.post(
  "/notification-boost/payment/create-order",
  authMiddleware,
  universityNotificationBoostController.createBoostPaymentOrder
);

module.exports = router;
