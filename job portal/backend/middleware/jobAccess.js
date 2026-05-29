const { JobAccess } = require("../models");

// Access hierarchy: manage > edit > view
const ACCESS_LEVELS = {
  view: ["view", "edit", "manage"],
  edit: ["edit", "manage"],
  manage: ["manage"],
};

exports.requireJobAccess = (minLevel = "view") => {
  return async (req, res, next) => {
    const { id: userId } = req.user;
    const jobId =
      req.params.jobId ||
      req.body.jobId ||
      req.query.jobId ||
      req.params.job_id ||
      req.body.job_id ||
      req.query.job_id ||
      req.params.job_id;

    if (!jobId) {
      return res.status(400).json({ error: "Job ID required" });
    }

    const access = await JobAccess.findOne({
      where: {
        job_id: jobId,
        user_id: userId,
        access_level: { [Op.in]: ACCESS_LEVELS[minLevel] },
      },
    });

    if (!access) {
      return res.status(403).json({
        error: "Access denied",
        details: `Requires ${minLevel} access to job ${jobId}`,
      });
    }

    // Attach access level to req for controllers
    req.jobAccess = { level: access.access_level, jobId };
    next();
  };
};
