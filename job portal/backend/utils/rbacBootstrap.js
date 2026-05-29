// utils/rbacBootstrap.js
const {
  AccessScope,
  AccessRole,
  RolePermission,
  UserAccessMembership,
  Permission,
} = require("../models");


// Add this constant at the top of the file, after the imports
const HR_MANAGER_PERMISSION_KEYS = [
  // JOB MANAGEMENT
  'job.create',
  'job.edit.own',
  'job.edit.all',
  'job.view.own',
  'job.view.all',
  'job.toggle.active',
  'job.assign',
  'job.delete.own',

  // APPLICANT MANAGEMENT
  'applicant.view.own',
  'applicant.view.all',
  'applicant.schedule.interview',
  'applicant.give.feedback',
  'applicant.download.resume',

  // TEAM MANAGEMENT
  'user.view.list',
  'user.invite',

  // PROFILE MANAGEMENT
  'profile.edit.company',
  'profile.edit.contact',

  // FEED MANAGEMENT
  'feed.post',
  'feed.edit.own',
  'feed.delete.own',

  // ANALYTICS
  'analytics.view.dashboard',
];

/**
 * Bootstrap RBAC for a new company.
 * Safe to call multiple times (idempotent).
 */
exports.bootstrapCompanyRBAC = async (
  userId,
  companyProfileId,
  companyName
) => {
  // 1. Create/Get scope
  const [scope] = await AccessScope.findOrCreate({
    where: { scope_type: "COMPANY", scope_id: companyProfileId },
    defaults: { name: companyName || "My Company" },
  });

  // 2. Check if user already has membership
  let membership = await UserAccessMembership.findOne({
    where: { user_id: userId, scope_id: scope.id },
  });

  if (membership) {
    // Already in team → nothing to do
    return { scopeId: scope.id, isOwner: membership.is_primary };
  }

  // 3. Determine role: first user in scope = Owner
  const existingMembers = await UserAccessMembership.count({
    where: { scope_id: scope.id, status: "active" },
  });

  const isOwner = existingMembers === 0;
  let role;

  if (isOwner) {
    [role] = await AccessRole.findOrCreate({
      where: { scope_id: scope.id, name: "Owner" },
      defaults: {
        description: "Full administrator",
        is_system: true,
        created_by: userId,
      },
    });

    // Grant all permissions
    const allPerms = await Permission.findAll();
    await RolePermission.bulkCreate(
      allPerms.map((p) => ({
        role_id: role.id,
        permission_id: p.id,
        created_by: userId,
      })),
      { ignoreDuplicates: true }
    );
  } else {
    // Fallback: "Member" role
    [role] = await AccessRole.findOrCreate({
      where: { scope_id: scope.id, name: "Member" },
      defaults: {
        description: "Standard team member",
        is_system: true,
        created_by: userId,
      },
    });

    // Basic permissions
    const basicPerms = await Permission.findAll({
      where: { key: { [Op.in]: ["job.view.own", "applicant.view.own"] } },
    });
    await RolePermission.bulkCreate(
      basicPerms.map((p) => ({
        role_id: role.id,
        permission_id: p.id,
        created_by: userId,
      })),
      { ignoreDuplicates: true }
    );
  }

  // 4. Create membership
  membership = await UserAccessMembership.create({
    user_id: userId,
    scope_id: scope.id,
    role_id: role.id,
    is_primary: isOwner,
    status: "active",
    joined_at: new Date(),
    created_by: userId,
  });


  // 5. Create preset HR Manager role (non-system, editable/deletable)
  const [hrRole] = await AccessRole.findOrCreate({
    where: { scope_id: scope.id, name: "HR Manager" },
    defaults: {
      description: "Standard HR role for recruiting and employee management",
      is_system: false,
      created_by: userId,
    },
  });

  // Assign HR permissions to the role
  const hrPerms = await Permission.findAll({
    where: { key: HR_MANAGER_PERMISSION_KEYS },
  });

  if (hrPerms.length > 0) {
    await RolePermission.bulkCreate(
      hrPerms.map((p) => ({
        role_id: hrRole.id,
        permission_id: p.id,
        created_by: userId,
      })),
      { ignoreDuplicates: true }
    );
  }

  return { scopeId: scope.id, isOwner: isOwner };
};
