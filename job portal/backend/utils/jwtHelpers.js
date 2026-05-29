// utils/jwtHelpers.js
const jwt = require("jsonwebtoken");
const { getRBACContext } = require("./rbacContext");

exports.generateAuthToken = async (user) => {
  // Get LIVE RBAC context (for token payload)
  const rbac = await getRBACContext(user.id);

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.user_role,
      scopeId: rbac.scopeId,
      permissions: rbac.permissions, 
      isOwner: rbac.isOwner,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY }
  );
};
