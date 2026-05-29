const express = require('express');
const router = express.Router();
const faqController = require('../masterDataController/faqController');

//get FAQs by role
router.get('/:role', faqController.getFaqs);

//create new FAQ
router.post('/', faqController.createFaq);

//update FAQ by ID
router.put('/:id', faqController.updateFaq);

//delete FAQ by ID
router.delete('/:id', faqController.deleteFaq);

module.exports = router;