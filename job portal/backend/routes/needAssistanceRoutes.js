const express = require('express');
const router = express.Router();
const {  createTicket,
  getAllTickets,
  getUserTickets,
  updateTicket,
  deleteTicket,
 } = require('../controllers/needAssistanceController');



router.get("/",getAllTickets); 
router.post("/",createTicket)
router.get("/:id",getUserTickets);
router.patch("/:id",updateTicket);
router.delete("/:id",deleteTicket);

module.exports = router;