// controllers/teamController.js
const {
  sequelize,
  User,
  UserAccessMembership,
  AccessRole,
  AccessScope,
  RolePermission,
  Permission,
  JobAccess,
  AuditLog,
  JobPost,
  JobRole,
  CompanyRecruiterProfile,
  ConversationParticipant,
} = require("../models");
const { Op } = require("sequelize");
const { sendEmail } = require("../services/emailService");
const { generateTemporaryPassword, formatDate } = require("../utils/authHelpers");
const { sendTeamInvitation, sendStatusChangeNotification } = require("../services/emailService");


exports.createRole = async (req, res) => {
  const { name, description, permissionKeys = [] } = req.body;
  const { id: userId, scopeId } = req.user;

  const permissions = permissionKeys;

  const transaction = await sequelize.transaction();

  try {
    // 1. Validate permissions exist
    const validPerms = await Permission.findAll({
      where: { key: permissions },
    });

    const invalid = permissions.filter(
      (p) => !validPerms.find((v) => v.key === p)
    );
    if (invalid.length > 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: `Invalid permissions: ${invalid.join(", ")}` });
    }

    // 2. Create role
    const role = await AccessRole.create(
      {
        scope_id: scopeId,
        name,
        description,
        is_system: false,
        created_by: userId,
      },
      { transaction }
    );

    // 3.  INSERT permissions with ON DUPLICATE KEY UPDATE (MySQL safe)
    if (validPerms.length > 0) {
      const permOps = validPerms.map((p) => ({
        role_id: role.id,
        permission_id: p.id,
        created_by: userId,
      }));

      // Use upsert for MySQL
      await Promise.all(
        permOps.map((op) => RolePermission.upsert(op, { transaction }))
      );
    }

    await transaction.commit();

    res.status(201).json({
      message: "Role created",
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: validPerms.map((p) => p.key),
      },
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Create role error:", err);
    res.status(500).json({ message: "Failed to create role" });
  }
};





exports.addTeamMember = async (req, res) => {
  const { first_name, last_name, email, password, roleId } = req.body;
  const { id: createdBy, scopeId } = req.user;

  const transaction = await sequelize.transaction();

  try {
    // 1. Validate role exists in scope
    const role = await AccessRole.findOne({
      where: { id: roleId, scope_id: scopeId },
    });
    if (!role) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid role" });
    }

    // 2. Create user (status=2 immediately — no OTP flow)
    const user = await User.create(
      {
        first_name,
        last_name,
        email,
        phone: "999999999", // or require phone
        password,
        user_role: "COMPANY",
        status: 2, // profile complete — RBAC active
        accepted_terms_at: new Date(),
      },
      { transaction }
    );

    // 3. Create membership
    await UserAccessMembership.create(
      {
        user_id: user.id,
        scope_id: scopeId,
        role_id: roleId,
        is_primary: false,
        status: "active",
        joined_at: new Date(),
        created_by: createdBy,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      message: "Team member added",
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roleName: role.name,
      },
    });
  } catch (err) {
    await transaction.rollback();
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Email already exists" });
    }
    console.error("Add member error:", err);
    res.status(500).json({ message: "Failed to add team member", error: err });
  }
};



// some extra other rbac controllers will be here
exports.getAllPermissions = async (req, res) => {
  try {
    const perms = await Permission.findAll({
      where: { is_deprecated: false },
      order: [
        ["module", "ASC"],
        ["name", "ASC"],
      ],
      attributes: ["key", "module", "name", "description"],
    });

    // Group by module for frontend
    const grouped = perms.reduce((acc, p) => {
      if (!acc[p.module]) acc[p.module] = [];
      acc[p.module].push({
        key: p.key,
        name: p.name,
        description: p.description,
      });
      return acc;
    }, {});

    res.json({ permissions: grouped });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch permissions", error: err });
  }
};


exports.getRoles = async (req, res) => {
  try {
    const roles = await AccessRole.findAll({
      where: { scope_id: req.user.scopeId },
      attributes: ["id", "name", "description", "is_system", "created_at"],
      order: [
        ["is_system", "DESC"],
        ["name", "ASC"],
      ],
      include: [
        {
          model: RolePermission,
          as: "rolePermissions",
          // attributes: [],
          include: [
            {
              model: Permission,
              as: "permission",
              attributes: ["key"],
            },
          ],
        },
      ],
    });

    const result = roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isSystem: r.is_system,
      createdAt: r.created_at,
      permissions: r.rolePermissions.map((rp) => rp.permission.key),
    }));

    res.json({ roles: result });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch roles", error: err });
  }
};


/**
 * Get a single role by ID with its permissions
 * Validates that the role belongs to the user's scope (company)
 */
exports.getRoleById = async (req, res) => {
  const { roleId } = req.params;
  const { scopeId } = req.user;

  try {
    // 1. Fetch role with permissions, scoped to user's company
    const role = await AccessRole.findOne({
      where: {
        id: roleId,
        scope_id: scopeId
      },
      attributes: [
        "id",
        "name",
        "description",
        "is_system",
        "created_at",
        "updated_at"
      ],
      include: [
        {
          model: RolePermission,
          as: "rolePermissions",
          // attributes: [], 
          include: [
            {
              model: Permission,
              as: "permission",
              attributes: ["id", "key", "name", "module", "description"],
            },
          ],
        },
      ],
      order: [
        [{ model: RolePermission, as: "rolePermissions" }, "created_at", "ASC"]
      ],
    });

    // 2. Handle not found
    if (!role) {
      return res.status(404).json({
        message: "Role not found",
        detail: "The requested role does not exist or you don't have access to it."
      });
    }

    // 3. Format response
    const roleData = {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.is_system,
      createdAt: role.created_at,
      updatedAt: role.updated_at,
      permissions: role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        key: rp.permission.key,
        name: rp.permission.name,
        module: rp.permission.module,
        description: rp.permission.description,
      })),
      permissionCount: role.rolePermissions.length,
    };

    // 4. Optional: Add metadata about users assigned to this role
    const memberCount = await UserAccessMembership.count({
      where: {
        role_id: roleId,
        scope_id: scopeId,
        status: "active"
      },
    });

    res.json({
      role: roleData,
      meta: {
        activeMembers: memberCount,
        canEdit: !role.is_system, // Frontend can use this to show/hide edit button
      },
    });

  } catch (err) {
    console.error("Get role by ID error:", err);
    res.status(500).json({
      message: "Failed to fetch role details",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

/**
 * Update role details: name, description, and/or permissions
 * All users with this role automatically inherit changes
 */
exports.updateRole = async (req, res) => {
  const { roleId } = req.params;
  const { name, description, permissionKeys } = req.body;
  const { id: userId, scopeId } = req.user;

  const transaction = await sequelize.transaction();

  try {
    // 1. Find and validate role exists in scope
    const role = await AccessRole.findOne({
      where: { id: roleId, scope_id: scopeId },
      transaction,
      lock: transaction.LOCK.UPDATE, // Prevent race conditions
    });

    if (!role) {
      await transaction.rollback();
      return res.status(404).json({ message: "Role not found" });
    }

    // 2. Block editing system roles (e.g., Owner, Admin)
    if (role.is_system) {
      await transaction.rollback();
      return res.status(400).json({ message: "Cannot modify system role" });
    }

    const updates = {};
    const changes = {}; // For audit log

    // 3. Validate & queue name update
    if (name !== undefined && name.trim() !== "") {
      const normalizedName = name.trim();

      // Check for duplicate name within same scope
      const existing = await AccessRole.findOne({
        where: {
          name: normalizedName,
          scope_id: scopeId,
          id: { [Op.ne]: roleId } // Exclude current role
        },
        transaction,
      });

      if (existing) {
        await transaction.rollback();
        return res.status(409).json({
          message: "Role name already exists",
          detail: `A role named "${normalizedName}" already exists in your company.`
        });
      }

      updates.name = normalizedName;
      changes.name = { old: role.name, new: normalizedName };
    }

    // 4. Validate & queue description update
    if (description !== undefined) {
      updates.description = description.trim() || null;
      changes.description = { old: role.description, new: updates.description };
    }

    // 5. Apply name/description updates if any
    if (Object.keys(updates).length > 0) {
      await role.update(updates, { transaction });
    }

    // 6. Handle permissions update (if provided)
    if (Array.isArray(permissionKeys)) {
      // Validate permissions exist and are not deprecated
      const validPerms = await Permission.findAll({
        where: { key: permissionKeys, is_deprecated: false },
        attributes: ["id", "key"],
        transaction,
      });

      const invalid = permissionKeys.filter(
        (p) => !validPerms.find((v) => v.key === p)
      );

      if (invalid.length > 0) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: `Invalid permissions: ${invalid.join(", ")}` });
      }

      // Remove permissions no longer assigned
      await RolePermission.destroy({
        where: {
          role_id: roleId,
          permission_id: {
            [Op.notIn]: validPerms.map((p) => p.id),
          },
        },
        transaction,
      });

      // Add/update new permissions
      if (validPerms.length > 0) {
        const permOps = validPerms.map((p) => ({
          role_id: roleId,
          permission_id: p.id,
          created_by: userId,
          updated_by: userId,
        }));

        await Promise.all(
          permOps.map((op) => RolePermission.upsert(op, { transaction }))
        );
      }

      changes.permissions = {
        old: (await role.getRolePermissions({ transaction })).map(rp => rp.permission_id),
        new: validPerms.map(p => p.id)
      };
    }

    // 7. Fetch fully updated role data for response
    const updatedRole = await AccessRole.findOne({
      where: { id: roleId },
      include: [
        {
          model: RolePermission,
          as: "rolePermissions",
          include: [
            {
              model: Permission,
              as: "permission",
              attributes: ["key", "name", "module", "description"]
            }
          ],
        },
      ],
      transaction,
    });

    await transaction.commit();

    // 8. Audit log the changes
    await AuditLog.create({
      event_type: "role.updated",
      actor_user_id: userId,
      scope_id: scopeId,
      target_type: "role",
      target_id: roleId.toString(),
      old_value: {
        name: role.name,
        description: role.description,
      },
      new_value: {
        name: updatedRole.name,
        description: updatedRole.description,
        permissions: updatedRole.rolePermissions.map(rp => rp.permission.key)
      },
      metadata: { changes },
    });

    res.json({
      message: "Role updated successfully",
      role: {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        isSystem: updatedRole.is_system,
        updatedAt: updatedRole.updated_at,
        permissions: updatedRole.rolePermissions.map((rp) => ({
          key: rp.permission.key,
          name: rp.permission.name,
          module: rp.permission.module,
          description: rp.permission.description,
        })),
      },
      propagationNote: "All users assigned to this role now reflect these changes",
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Update role error:", err);
    res.status(500).json({
      message: "Failed to update role",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};



exports.getTeamMembers = async (req, res) => {
  try {
    const members = await UserAccessMembership.findAll({
      where: {
        scope_id: req.user.scopeId,
        // status: "active",
      },
      attributes: ["id", "is_primary", "joined_at", "status"],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: AccessRole,
          as: "role",
          attributes: ["id", "name"],
        },
      ],
      order: [
        ["is_primary", "DESC"],
        ["joined_at", "ASC"],
      ],
    });

    const result = members.map((m) => ({
      id: m.id, // membership ID (for updates)
      userId: m.user.id,
      name: `${m.user.first_name} ${m.user.last_name}`,
      email: m.user.email,
      roleName: m.role.name,
      roleId: m.role.id,
      isOwner: m.is_primary,
      joinedAt: m.joined_at,
      status: m.status,
    }));

    res.json({ members: result });
  } catch (err) {
    console.error("Get team members error:", err);
    res.status(500).json({ message: "Failed to fetch team", error: err });
  }
};


exports.updateMemberRole = async (req, res) => {
  const { roleId } = req.body;
  const { id: membershipId } = req.params;
  const { id: actorId, scopeId } = req.user;

  const transaction = await sequelize.transaction();

  try {
    // 1. Validate membership exists and belongs to scope
    const membership = await UserAccessMembership.findOne({
      where: { id: membershipId, scope_id: scopeId },
      transaction,
    });
    if (!membership) {
      await transaction.rollback();
      return res.status(404).json({ message: "Member not found" });
    }

    // 2. Validate role exists in scope
    const role = await AccessRole.findOne({
      where: { id: roleId, scope_id: scopeId },
      transaction,
    });
    if (!role) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid role" });
    }

    // 3. Update role
    await membership.update({ role_id: roleId }, { transaction });
    await transaction.commit();

    res.json({
      message: "Role updated",
      member: {
        userId: membership.user_id,
        roleId: roleId,
        roleName: role.name,
      },
    });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ message: "Failed to update role", error: err });
  }
};


exports.removeMember = async (req, res) => {
  const { id: membershipId } = req.params;
  const { id: actorId, scopeId } = req.user;

  try {
    const membership = await UserAccessMembership.findOne({
      where: {
        id: membershipId,
        scope_id: scopeId,
        is_primary: false, // Prevent self-removal of Owner
      },
    });

    if (!membership) {
      return res
        .status(404)
        .json({ message: "Member not found or cannot remove owner" });
    }

    await membership.update({ status: "left" });
    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove member", error: err });
  }
};


exports.deleteRole = async (req, res) => {
  const { id: roleId } = req.params;
  const { scopeId } = req.user;

  const transaction = await sequelize.transaction();

  try {
    // 1. Find role
    const role = await AccessRole.findOne({
      where: { id: roleId, scope_id: scopeId },
      transaction,
    });

    if (!role) {
      await transaction.rollback();
      return res.status(404).json({ message: "Role not found" });
    }

    // 2. Block system roles
    if (role.is_system) {
      await transaction.rollback();
      return res.status(400).json({ message: "Cannot delete system role" });
    }

    // 3. Check if any active members use this role
    const memberCount = await UserAccessMembership.count({
      where: {
        role_id: roleId,
        scope_id: scopeId,
        status: 'active'
      },
      transaction,
    });

    if (memberCount > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Role is in use",
        detail: `Cannot delete: ${memberCount} member(s) are assigned to this role.`
      });
    }

    // 4. Delete
    await role.destroy({ transaction });
    await transaction.commit();

    res.status(204).send(); // No content
  } catch (err) {
    await transaction.rollback();
    console.error("Delete role error:", err);
    res.status(500).json({ message: "Failed to delete role" });
  }
};



exports.assignJobAccess = async (req, res) => {
  const { jobId } = req.params;
  const { userId, accessLevel = 'edit' } = req.body;
  const { id: actorId, scopeId } = req.user;

  // Validate inputs
  if (!userId || !['view', 'edit', 'manage'].includes(accessLevel)) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    // 1. Verify job exists and belongs to company
    const job = await JobPost.findOne({
      where: {
        job_id: jobId
      }
    });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // 2. Verify user is in same company
    const membership = await UserAccessMembership.findOne({
      where: {
        user_id: userId,
        scope_id: scopeId,
        status: 'active'
      }
    });
    if (!membership) {
      return res.status(400).json({ message: 'User not in this company' });
    }

    // 3. Grant access (idempotent)
    await JobAccess.upsert({
      job_id: jobId,
      user_id: userId,
      access_level: accessLevel,
      assigned_by: actorId
    });

    // 4. Audit log
    await AuditLog.create({
      event_type: 'job.access.granted',
      actor_user_id: actorId,
      scope_id: scopeId,
      target_type: 'job',
      target_id: jobId.toString(),
      new_value: { userId, accessLevel }
    });

    res.json({
      message: 'Job access granted',
      access: { jobId, userId, accessLevel }
    });
  } catch (err) {
    console.error('Assign job access error:', err);
    res
      .status(500)
      .json({ message: "Failed to assign job access", error: err });
  }
};


exports.getMember = async (req, res) => {
  const { id } = req.params;
  const { scopeId } = req.user;

  try {
    const membership = await UserAccessMembership.findOne({
      where: { id, scope_id: scopeId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email','phone'] },
        { model: AccessRole, as: 'role', attributes: ['name'] }
      ]
    });

    if (!membership) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({
      member: {
        id: membership.id,
        userId: membership.user.id,
        name: `${membership.user.first_name} ${membership.user.last_name}`,
        first_name: membership.user.first_name,
        last_name:membership.user.last_name,
        email: membership.user.email,
        phone:membership.user.phone,
        roleName: membership.role.name,
        status: membership.status

      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch member', error: err });
  }
};

exports.getCompanyJobs = async (req, res) => {
  try {
    console.log('Fetching jobs for scopeId:', req.user.scopeId);
    const jobs = await JobPost.findAll({
      attributes: ['job_id', 'active_status', "post_type", 'created_at', 'opportunity_type'],
      order: [['created_at', 'DESC']],
      include: [
        {
          model: JobRole,
          attributes: ['title'],
        },
        {
          model: CompanyRecruiterProfile,
          as: "CompanyRecruiterProfile",
          where: { user_id: req.user.id },
          attributes: ["id"],
          required: true,
        }]
    });

    res.status(200).json({ jobs });
  } catch (err) {
    console.error('Get company jobs error:', err);
    res.status(500).json({ message: 'Failed to fetch jobs', error: err });
  }
};


exports.updateJobAccess = async (req, res) => {
  const { jobId, userId } = req.params;
  const { accessLevel } = req.body; // 'view' | 'edit' | 'manage'
  const { id: actorId, scopeId } = req.user;

  if (!["view", "edit", "manage"].includes(accessLevel)) {
    return res.status(400).json({ message: "Invalid access level" });
  }

  try {

    const scope = await AccessScope.findByPk(scopeId);
    // Validate job belongs to company
    const job = await JobPost.findOne({
      where: { job_id: jobId, company_recruiter_profile_id: scope.scope_id },
    });
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Validate user is in company
    const membership = await UserAccessMembership.findOne({
      where: { user_id: userId, scope_id: scopeId, status: "active" },
    });
    if (!membership)
      return res.status(400).json({ message: "User not in company" });

    // Update or create job_access
    await JobAccess.upsert({
      job_id: jobId,
      user_id: userId,
      access_level: accessLevel,
      assigned_by: actorId,
    });

    //  Deactivate/reactivate participant
    await ConversationParticipant.update(
      { is_active: true },
      {
        where: {
          user_id: userId,
          conversation_id: {
            [Op.in]: sequelize.literal(
              `(SELECT c.id FROM conversations c 
                JOIN applications a ON c.job_application_id = a.id 
                WHERE a.job_post_id = ${jobId})`
            ),
          },
        },
      }
    );

    res.json({
      message: "Job access updated",
      access: { jobId, userId, accessLevel },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update job access", error: err });
  }
};


exports.removeJobAccess = async (req, res) => {
  const { jobId, userId } = req.params;
  const { id: actorId, scopeId } = req.user;

  try {
    // Validate job

    const scope = await AccessScope.findByPk(scopeId);
    const job = await JobPost.findOne({
      where: { job_id: jobId, company_recruiter_profile_id: scope.scope_id },
    });
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Delete job_access
    const result = await JobAccess.destroy({
      where: { job_id: jobId, user_id: userId },
    });

    if (result === 0) {
      return res.status(404).json({ message: "Job access not found" });
    }

    //  Critical: Deactivate participant + leave rooms
    const deactivated = await ConversationParticipant.update(
      { is_active: false },
      {
        where: {
          user_id: userId,
          conversation_id: {
            [Op.in]: sequelize.literal(
              `(SELECT c.id FROM conversations c 
                JOIN applications a ON c.job_application_id = a.id 
                WHERE a.job_post_id = ${jobId})`
            ),
          },
        },
      }
    );

    //  Notify frontend to close chats
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${userId}`).emit("job_access_revoked", {
        jobId,
        message: "Your access to this job has been revoked",
      });
    }

    //  Audit log
    await AuditLog.create({
      event_type: "job.access.revoked",
      actor_user_id: actorId,
      scope_id: scopeId,
      target_type: "user",
      target_id: userId.toString(),
      old_value: { jobId, userId },
    });

    res.json({
      message: "Job access revoked",
      deactivatedParticipants: deactivated,
    });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: "Failed to revoke job access", error: err });
  }
};




exports.getJobAccess = async (req, res) => {
  const { jobId } = req.params;
  const { scopeId } = req.user;

  try {
    const accessList = await JobAccess.findAll({
      where: { job_id: jobId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
      attributes: [
        "id",
        "job_id",
        "user_id",
        "access_level",
        "assigned_by",
        "assigned_at",
      ],
    });

    const result = accessList.map((a) => ({
      id: a.id,
      userId: a.user_id,
      name: `${a.user.first_name} ${a.user.last_name}`,
      email: a.user.email,
      accessLevel: a.access_level,
      assignedAt: a.assigned_at,
    }));

    res.json({ access: result });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch job access", error: err });
  }
};





exports.changeMemberPassword = async (req, res) => {
  const { membershipId } = req.params;
  const { newPassword, sendEmail = true } = req.body;
  const { id: actorId, scopeId } = req.user;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Find membership with user details
    const membership = await UserAccessMembership.findOne({
      where: { id: membershipId, scope_id: scopeId },
      include: [
        { model: User, as: "user", attributes: ["id", "first_name", "last_name", "email"] },
        { model: AccessRole, as: "role", attributes: ["name"] }
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!membership) {
      await transaction.rollback();
      return res.status(404).json({ message: "Member not found" });
    }

    // 2. Prevent changing password of primary owner unless actor is also primary
    if (membership.is_primary) {
      const actorMembership = await UserAccessMembership.findOne({
        where: { user_id: actorId, scope_id: scopeId, is_primary: true }
      });
      if (!actorMembership) {
        await transaction.rollback();
        return res.status(403).json({ message: "Cannot change password of primary owner" });
      }
    }

    const user = membership.user;
    const oldEmail = user.email;

    // 3. Update password (model hook will hash it)
    user.password = newPassword;
    await user.save({ transaction });

    await transaction.commit();

    // 4. Send email with new password (outside transaction)
    if (sendEmail) {
      const actor = await User.findByPk(actorId, { attributes: ["first_name", "last_name"] });
      const scope = await AccessScope.findByPk(scopeId, { attributes: ["name"] });
      
      await sendTeamInvitation({
        toEmail: user.email,
        firstName: user.first_name,
        companyName: scope?.name || "Your Company",
        roleName: membership.role?.name || "Team Member",
        invitedBy: `${actor?.first_name} ${actor?.last_name}` || "Administrator",
        temporaryPassword: newPassword,
        loginUrl: process.env.FRONTEND_URL + "/login",
        adminEmail: process.env.ADMIN_EMAIL
      }).catch(err => {
        console.error("Failed to send password update email:", err);
      });
    }

    // 5. Audit log
    await AuditLog.create({
      event_type: "member.password_changed",
      actor_user_id: actorId,
      scope_id: scopeId,
      target_type: "user",
      target_id: user.id.toString(),
      old_value: { password: "[REDACTED]" },
      new_value: { password: "[REDACTED]", changed_at: new Date() },
      metadata: { changed_by: actorId, email_notified: sendEmail }
    });

    res.json({
      message: "Password updated successfully",
      member: {
        id: membership.id,
        userId: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        roleName: membership.role?.name
      },
      emailSent: sendEmail
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Change member password error:", err);
    res.status(500).json({ message: "Failed to update password", error: err.message });
  }
};



exports.updateMemberDetails = async (req, res) => {
  const { membershipId } = req.params;
  const { first_name, last_name, email, phone } = req.body;
  const { id: actorId, scopeId } = req.user;

  const transaction = await sequelize.transaction();

  try {
    // 1. Find membership
    const membership = await UserAccessMembership.findOne({
      where: { id: membershipId, scope_id: scopeId },
      include: [
        { model: User, as: "user", attributes: ["id", "first_name", "last_name", "email", "phone"] }
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!membership) {
      await transaction.rollback();
      return res.status(404).json({ message: "Member not found" });
    }

    const user = membership.user;
    const changes = {};

    // 2. Validate and queue updates
    if (first_name !== undefined && first_name.trim() !== "") {
      changes.first_name = { old: user.first_name, new: first_name.trim() };
      user.first_name = first_name.trim();
    }

    if (last_name !== undefined && last_name.trim() !== "") {
      changes.last_name = { old: user.last_name, new: last_name.trim() };
      user.last_name = last_name.trim();
    }

    // if (email !== undefined && email.trim() !== "") {
    //   const normalizedEmail = email.toLowerCase().trim();

    //   // Check if email is already taken by another user
    //   const existingUser = await User.findOne({
    //     where: {
    //       email: normalizedEmail,
    //       id: { [Op.ne]: user.id }
    //     },
    //     transaction
    //   });

    //   if (existingUser) {
    //     await transaction.rollback();
    //     return res.status(409).json({
    //       message: "Email already in use",
    //       detail: "This email is already associated with another account."
    //     });
    //   }

    //   changes.email = { old: user.email, new: normalizedEmail };
    //   user.email = normalizedEmail;
    //   // Note: If email changes, you may want to set email_verified_at to null
    //   // user.email_verified_at = null; // Uncomment if you add this field later
    // }

    if (phone !== undefined && phone.trim() !== "") {
      changes.phone = { old: user.phone, new: phone.trim() };
      user.phone = phone.trim();
    }

    // 3. Apply updates if any changes
    if (Object.keys(changes).length > 0) {
      await user.save({ transaction });
    }

    await transaction.commit();

    // 4. Audit log
    if (Object.keys(changes).length > 0) {
      await AuditLog.create({
        event_type: "member.details_updated",
        actor_user_id: actorId,
        scope_id: scopeId,
        target_type: "user",
        target_id: user.id.toString(),
        old_value: Object.fromEntries(
          Object.entries(changes).map(([key, val]) => [key, val.old])
        ),
        new_value: Object.fromEntries(
          Object.entries(changes).map(([key, val]) => [key, val.new])
        ),
      });
    }

    res.json({
      message: "Member details updated",
      member: {
        id: membership.id,
        userId: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        roleName: membership.role?.name,
        status: membership.status
      },
      changes: Object.keys(changes).length > 0 ? changes : null
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Update member details error:", err);
    res.status(500).json({ message: "Failed to update member details", error: err.message });
  }
};



exports.toggleMemberStatus = async (req, res) => {
  const { membershipId } = req.params;
  const { status, sendNotification = true, reason } = req.body;
  const { id: actorId, scopeId } = req.user;

  // Validate status value
  const validStatuses = ["invited", "active", "suspended", "left"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Find membership with user and role details
    const membership = await UserAccessMembership.findOne({
      where: { id: membershipId, scope_id: scopeId },
      include: [
        { model: User, as: "user", attributes: ["id", "first_name", "last_name", "email"] },
        { model: AccessRole, as: "role", attributes: ["id", "name"] }
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!membership) {
      await transaction.rollback();
      return res.status(404).json({ message: "Member not found" });
    }

    // 2. Prevent changing primary owner status to suspended/left
    if (membership.is_primary && (status === "suspended" || status === "left")) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "Cannot change status of primary owner",
        detail: "The primary owner account cannot be suspended or marked as left."
      });
    }

    // 3. Track old status for audit
    const oldStatus = membership.status;
    const oldStatusUpdatedAt = membership.updated_at;

    // 4. Update status
    membership.status = status;
    if (status === "active" && !membership.joined_at) {
      membership.joined_at = new Date();
    }
    await membership.save({ transaction });

    await transaction.commit();

    // 5. Send email notification (outside transaction)
    if (sendNotification && ["active", "suspended"].includes(status)) {
      const actor = await User.findByPk(actorId, { attributes: ["first_name", "last_name"] });
      const scope = await AccessScope.findByPk(scopeId, { attributes: ["name"] });
      
      await sendStatusChangeNotification({
        toEmail: membership.user.email,
        firstName: membership.user.first_name,
        companyName: scope?.name || "Your Company",
        roleName: membership.role?.name || "Team Member",
        isActive: status === "active",
        updatedBy: `${actor?.first_name} ${actor?.last_name}` || "Administrator",
        updatedAt: new Date(),
        loginUrl: process.env.FRONTEND_URL + "/login",
        adminEmail: process.env.ADMIN_EMAIL
      }).catch(err => {
        console.error("Failed to send status notification:", err);
      });
    }

    // 6. Audit log
    await AuditLog.create({
      event_type: "member.status_changed",
      actor_user_id: actorId,
      scope_id: scopeId,
      target_type: "membership",
      target_id: membershipId.toString(),
      old_value: { status: oldStatus, updated_at: oldStatusUpdatedAt },
      new_value: { status: status, updated_at: new Date() },
      metadata: { reason: reason || null }
    });

    res.json({
      message: "Member status updated",
      member: {
        id: membership.id,
        userId: membership.user_id,
        email: membership.user.email,
        name: `${membership.user.first_name} ${membership.user.last_name}`,
        status: membership.status,
        roleName: membership.role?.name,
        updatedAt: membership.updated_at
      }
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Toggle member status error:", err);
    res.status(500).json({ message: "Failed to update member status", error: err.message });
  }
};