const express = require('express');
const router = express.Router();
const { raiseTicket, getTicketByRole } = require('../controllers/ticketController');

//Route to raise a support ticket
router.post('/raise', raiseTicket);

//router to get Ticket by role
router.get('/:role', getTicketByRole);

module.exports = router;