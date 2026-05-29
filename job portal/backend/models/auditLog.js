// models/auditLog.js
module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    "AuditLog",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      event_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "e.g., 'role.created', 'permission.granted'",
      },
      actor_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      scope_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "access_scopes",
          key: "id",
        },
      },
      target_type: {
        type: DataTypes.STRING(30),
        allowNull: true,
        comment: "e.g., 'user', 'role', 'job'",
      },
      target_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "String to support UUIDs or compound IDs",
      },
      old_value: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      new_value: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "audit_logs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  AuditLog.associate = function (models) {
    AuditLog.belongsTo(models.User, {
      foreignKey: "actor_user_id",
      as: "actor",
    });
    AuditLog.belongsTo(models.AccessScope, {
      foreignKey: "scope_id",
      as: "scope",
    });
  };

  return AuditLog;
};
