// models/rolePermission.js
module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define(
    "RolePermission",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "access_roles",
          key: "id",
        },
      },
      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "permissions",
          key: "id",
        },
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "role_permissions",
      timestamps: true,
      createdAt: "created_at",
      // No `updatedAt` — treat as immutable grant
      updatedAt: false,
      indexes: [
        { fields: ["role_id"] },
        { fields: ["permission_id"] },
        { fields: ["role_id", "permission_id"], unique: true },
      ],
    }
  );

  RolePermission.associate = function (models) {
    RolePermission.belongsTo(models.AccessRole, {
      foreignKey: "role_id",
      as: "role",
    });
    RolePermission.belongsTo(models.Permission, {
      foreignKey: "permission_id",
      as: "permission",
    });
    RolePermission.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "grantedBy",
    });
  };

  return RolePermission;
};
