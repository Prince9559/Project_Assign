const jwt = require('jsonwebtoken');
const { getUserPermissions } = require("../utils/permissionService");

const authMiddleware = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);  // let preflight through
  }
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header is missing or malformed' });
  }

  const token = authHeader.split(' ')[1]; // Expecting "Bearer token"
  if (!token) { // This check is now somewhat redundant but harmless
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      scopeId: decoded.scopeId || null,
      permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
      isOwner: !!decoded.isOwner
    };

    //  For now: always fetch fresh permissions (override token)
    // Remove this line later if using token-stored perms
    req.user.permissions = await getUserPermissions(req.user);


    next();
  } catch (err) {
    console.error("JWT Error:", err.name, err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
    
  }
};

module.exports = authMiddleware;
