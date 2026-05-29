// models/userAccessMembership.js
module.exports = (sequelize, DataTypes) => {
  const UserAccessMembership = sequelize.define(
    "UserAccessMembership",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      scope_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "access_scopes",
          key: "id",
        },
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "access_roles",
          key: "id",
        },
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("invited", "active", "suspended", "left"),
        defaultValue: "invited",
        allowNull: false,
      },
      joined_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
      tableName: "user_access_memberships",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["user_id"] },
        { fields: ["scope_id"] },
        { fields: ["user_id", "scope_id"], unique: true },
      ],
    }
  );

  UserAccessMembership.associate = function (models) {
    UserAccessMembership.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
    UserAccessMembership.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "invitedBy",
    });
    UserAccessMembership.belongsTo(models.AccessScope, {
      foreignKey: "scope_id",
      as: "scope",
    });
    UserAccessMembership.belongsTo(models.AccessRole, {
      foreignKey: "role_id",
      as: "role",
    });
  };

  return UserAccessMembership;
};
