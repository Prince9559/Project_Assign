// models/accessScope.js
module.exports = (sequelize, DataTypes) => {
  const AccessScope = sequelize.define(
    "AccessScope",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      scope_type: {
        type: DataTypes.ENUM("COMPANY", "UNIVERSITY"),
        allowNull: false,
      },
      scope_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment:
          "ID of the scoped entity (e.g., company_recruiter_profiles.id)",
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "Human-readable name (e.g., company name)",
      },
    },
    {
      tableName: "access_scopes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["scope_type", "scope_id"], unique: true }],
    }
  );

  AccessScope.associate = function (models) {
    // Scoped to Company
    AccessScope.belongsTo(models.CompanyRecruiterProfile, {
      foreignKey: "scope_id",
      as: "company",
      constraints: false, // scope_id may point to non-company
      scope: { scope_type: "COMPANY" },
    });

    // Scoped to University (future)
    AccessScope.belongsTo(models.UniversityDetail, {
      foreignKey: "scope_id",
      as: "university",
      constraints: false,
      scope: { scope_type: "UNIVERSITY" },
    });

    // Relationships
    AccessScope.hasMany(models.UserAccessMembership, {
      foreignKey: "scope_id",
      as: "memberships",
    });
    AccessScope.hasMany(models.AccessRole, {
      foreignKey: "scope_id",
      as: "roles",
    });
  };

  return AccessScope;
};
