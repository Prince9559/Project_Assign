// models/accessRole.js
module.exports = (sequelize, DataTypes) => {
  const AccessRole = sequelize.define(
    "AccessRole",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      scope_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "access_scopes",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_system: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
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
      tableName: "access_roles",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["scope_id"] },
        { fields: ["scope_id", "name"], unique: true },
      ],
    }
  );

  AccessRole.associate = function (models) {
    AccessRole.belongsTo(models.AccessScope, {
      foreignKey: "scope_id",
      as: "scope",
    });
    AccessRole.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });
    AccessRole.hasMany(models.UserAccessMembership, {
      foreignKey: "role_id",
      as: "members",
    });
    AccessRole.hasMany(models.RolePermission, {
      foreignKey: "role_id",
      as: "rolePermissions",
    });
  };

  return AccessRole;
};