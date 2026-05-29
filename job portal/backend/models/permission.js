// models/permission.js
module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    "Permission",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: "Code-safe permission key, e.g., 'job.create'",
      },
      module: {
        type: DataTypes.STRING(30),
        allowNull: false,
        comment: "Logical grouping, e.g., 'job', 'applicant'",
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "Human-readable name",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_deprecated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      tableName: "permissions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Permission.associate = function (models) {
    Permission.hasMany(models.RolePermission, {
      foreignKey: "permission_id",
      as: "rolePermissions",
    });
  };

  return Permission;
};
