// // utils/permissionService.js
// const { UserAccessMembership, RolePermission, Permission } = require('../models');

// const STRATEGY = process.env.PERM_CHECK_STRATEGY || 'token';

// /**
//  * Get permissions for a user.
//  * @param {Object} user - Must have: id, scopeId (if COMPANY)
//  */
// exports.getUserPermissions = async (user) => {
//   if (!user?.id) return [];

//   // Strategy 1: Use token-stored permissions (fast)
//   if (STRATEGY === 'token' && Array.isArray(user.permissions)) {
//     return user.permissions;
//   }

//   //  Strategy 2: Fetch fresh from DB (safe)
//   if (user.role === 'COMPANY' && user.scopeId) {
//     const membership = await UserAccessMembership.findOne({
//       where: {
//         user_id: user.id,
//         scope_id: user.scopeId,
//         status: 'active'
//       },
//       include: [{
//         model: RolePermission,
//         as: 'rolePermissions',
//         include: [{ model: Permission, as: 'permission' }]
//       }],
//       attributes: []
//     });
//     return membership?.rolePermissions?.map(rp => rp.permission.key) || [];
//   }

//   return []; // STUDENT/UNIVERSITY or no scope
// };

// /**
//  * Check single permission
//  */
// exports.hasPermission = async (user, permKey) => {
//   const perms = await this.getUserPermissions(user);
//   return perms.includes(permKey);
// };

// /**
//  * Middleware factory
//  */
// exports.requirePermission = (permKey) => {
//   return async (req, res, next) => {
//     const hasPerm = await this.hasPermission(req.user, permKey);
//     if (!hasPerm) {
//       return res.status(403).json({ error: 'Forbidden', details: `Missing: ${permKey}` });
//     }
//     next();
//   };
// };














// utils/permissionService.js
const { 
  UserAccessMembership, 
  AccessRole, 
  RolePermission, 
  Permission 
} = require('../models');

const STRATEGY = process.env.PERM_CHECK_STRATEGY || 'db'; // Default to 'db'

/**
 * Get permissions for a user.
 * @param {Object} user - Must have: id, scopeId (if COMPANY)
 */
exports.getUserPermissions = async (user) => {
  if (!user?.id) return [];

  // Strategy 1: Use token (if configured and data exists)
  if (STRATEGY === 'token' && Array.isArray(user.permissions)) {
    return user.permissions;
  }

  // Strategy 2: Fetch from DB (always safe)
  try {
    // Correct association path:
    // UserAccessMembership → AccessRole → RolePermission → Permission
    const membership = await UserAccessMembership.findOne({
      where: {
        user_id: user.id,
        scope_id: user.scopeId,
        status: 'active'
      },
      include: [{
        model: AccessRole,
        as: 'role',
        include: [{
          model: RolePermission,
          as: 'rolePermissions',
          include: [{
            model: Permission,
            as: 'permission',
            attributes: ['key']
          }],
          // attributes: []
        }],
        // attributes: []
      }],
      // attributes: []
    });


    return membership?.role?.rolePermissions?.map(rp => rp.permission.key) || [];
  } catch (err) {
    console.error('Permission fetch error:', err);
    return [];
  }
};

/**
 * Check single permission
 */
exports.hasPermission = async (user, permKey) => {
  const perms = await this.getUserPermissions(user);
  return perms.includes(permKey);
};

/**
 * Middleware factory
 */
exports.requirePermission = (permKey) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if(req.user.role=== 'COMPANY'){

    
    const hasPerm = await this.hasPermission(req.user, permKey);
    console.log(`Permission check for user ${req.user.id} on '${permKey}': ${hasPerm}`);
    if (!hasPerm) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        details: `Missing permission: ${permKey}` 
      });
    }
  }
    next();
  };
};