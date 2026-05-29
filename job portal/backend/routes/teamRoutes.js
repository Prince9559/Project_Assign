const express = require("express");
const { requirePermission } = require("../middleware/rbac");
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/teamController");

const router = express.Router();

// Public: permissions list (for role creation UI)
router.get("/permissions", ctrl.getAllPermissions);

// Protected: team management
router.use(auth);

// Role management
router.get("/roles", requirePermission("user.view.list"), ctrl.getRoles);
router.get("/roles/:roleId", requirePermission("user.manage.roles"), ctrl.getRoleById);
router.post("/roles", requirePermission("user.manage.roles"), ctrl.createRole);
router.delete("/roles/:id", requirePermission("user.manage.roles"), ctrl.deleteRole);
router.put("/roles/:roleId",requirePermission("user.manage.roles"),ctrl.updateRole);

// Member management
router.get("/members", requirePermission("user.view.list"), ctrl.getTeamMembers);
router.get("/members/:id", requirePermission("user.view.list"), ctrl.getMember); 
router.post("/members", requirePermission("user.manage.roles"), ctrl.addTeamMember);
router.patch("/members/:id/role", requirePermission("user.manage.roles"), ctrl.updateMemberRole);
router.delete("/members/:id", requirePermission("user.remove"), ctrl.removeMember);

// Direct password change by manager (Phase 1)
router.patch("/members/:membershipId/password", requirePermission("user.manage.roles"), ctrl.changeMemberPassword);
router.patch("/members/:membershipId/status", requirePermission("user.manage.roles"), ctrl.toggleMemberStatus);
router.patch("/members/:membershipId/details", requirePermission("user.manage.roles"), ctrl.updateMemberDetails);




// Job access management
router.get("/jobs", requirePermission("job.assign"), ctrl.getCompanyJobs);
router.get("/jobs/:jobId/access", requirePermission("job.assign"), ctrl.getJobAccess); 
router.post("/jobs/:jobId/assign", requirePermission("job.assign"), ctrl.assignJobAccess);
router.put("/jobs/:jobId/access/:userId", requirePermission("job.assign"), ctrl.updateJobAccess);
router.delete("/jobs/:jobId/access/:userId", requirePermission("job.assign"), ctrl.removeJobAccess);

module.exports = router;