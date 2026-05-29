const express = require("express");
const { getJobRoles, updateJobRole, deleteJobRole, addJobRole, searchJobRoles, getSuggestedDomains } = require("../masterDataController/jobRolesController");
const router = express.Router();


//get all Job roles & their descriptions
router.get("/", getJobRoles);

//search api for 3 characters
router.get('/search', searchJobRoles)

//add new Job role and their description
router.post("/", addJobRole);

//update job role and their description
router.put("/:job_role_id", updateJobRole);

//delete job role and their description
router.delete("/:job_role_id", deleteJobRole);



// NEW: Get suggested domains for a job role
router.get('/:jobRoleId/suggested-domains', getSuggestedDomains);


module.exports = router;
