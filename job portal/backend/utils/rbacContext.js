// utils/rbacContext.js
const { 
  UserAccessMembership, 
  AccessRole, 
  RolePermission, 
  Permission,
  AccessScope 
} = require('../models');

/**
 * Get RBAC context for a user (used in token signing, responses, middleware)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} { scopeId, permissions, isOwner, roleName }
 */
exports.getRBACContext = async (userId) => {
  try {
    // Find active membership (only for COMPANY users with status=2)
    const membership = await UserAccessMembership.findOne({
      where: { 
        user_id: userId, 
        status: 'active' 
      },
      include: [
        { 
          model: AccessScope, 
          as: 'scope',
          attributes: ['id', 'name']
        },
        { 
          model: AccessRole, 
          as: 'role',
          attributes: ['id', 'name']
        }
      ],
      attributes: ['scope_id', 'is_primary', 'role_id']
    });

    if (!membership) {
      return { 
        scopeId: null, 
        permissions: [], 
        isOwner: false, 
        roleName: null,
        scopeName: null 
      };
    }

    // Fetch permissions
    const perms = await RolePermission.findAll({
      where: { role_id: membership.role_id },
      include: [{
        model: Permission,
        as: 'permission',
        attributes: ['key']
      }],
      attributes: []
    });

    return {
      scopeId: membership.scope_id,
      scopeName: membership.scope?.name || null,
      permissions: perms.map(p => p.permission.key),
      isOwner: membership.is_primary,
      roleName: membership.role?.name || null
    };
  } catch (err) {
    console.error('RBAC context fetch error:', err);
    return { 
      scopeId: null, 
      permissions: [], 
      isOwner: false, 
      roleName: null,
      scopeName: null 
    };
  }
};