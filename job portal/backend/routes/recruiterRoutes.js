// routes/recruiterRoutes.js

const express = require("express");
const router = express.Router();

const {
  createRecruiter,
  getAllRecruiters,
  getRecruiterById,
  updateRecruiter,
  deleteRecruiter,
} = require("../controllers/recruiterController");

router.post("/recruiter-post", createRecruiter);          
router.get("/recruiter-get", getAllRecruiters);          
router.get("/recruiter-get-id/:id", getRecruiterById);       
router.put("/recruiter-update/:id", updateRecruiter);        
router.delete("/recruiter-delete/:id", deleteRecruiter);     

module.exports = router;
