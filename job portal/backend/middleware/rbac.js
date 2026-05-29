// middleware/rbac.js
const { requirePermission } = require("../utils/permissionService");


module.exports = {
  requirePermission,

  // Optional: require ANY of several permissions
  requireAnyPermission: (permKeys) => {
    return async (req, res, next) => {
      const perms =
        await require("..utils/permissionService").getUserPermissions(req.user);
      const hasAny = permKeys.some((p) => perms.includes(p));
      if (!hasAny) {
        return res.status(403).json({
          error: "Forbidden",
          details: `Requires one of: ${permKeys.join(", ")}`,
        });
      }
      next();
    };
  },
};
