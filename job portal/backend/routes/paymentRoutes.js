const express = require("express");
const router = express.Router();
const {
  createOneTimePaymentOrder,
  verifyPayment,
  handleRazorpayWebhook,
  getPaymentQuote,
  getBillingDashboard,
  getBillingTransaction,
  downloadInvoice,
} = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware"); 

router.post("/one-time/create-order", authMiddleware, createOneTimePaymentOrder);
router.get(
  "/quote",
  authMiddleware,
  getPaymentQuote
);
router.post("/verify", verifyPayment); // no auth needed (Razorpay calls this)

router.post('/webhooks/razorpay', handleRazorpayWebhook);

router.get("/billing/dashboard", authMiddleware, getBillingDashboard);

router.get("/billing/transaction/:id", authMiddleware, getBillingTransaction);

router.get('/billing/invoice/:order_id/download', authMiddleware, downloadInvoice);

module.exports = router;
