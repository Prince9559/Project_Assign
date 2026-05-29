module.exports = (sequelize, DataTypes) => {
  const UserPathwayPreference = sequelize.define(
    "UserPathwayPreference",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      resource_priority: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: ["internship", "project", "course"],
        get() {
          const rawValue = this.getDataValue("resource_priority");
          return Array.isArray(rawValue)
            ? rawValue
            : JSON.parse(rawValue || '["internship", "project", "course"]');
        },
      },
      max_timeline: {
        type: DataTypes.INTEGER,
        defaultValue: 365,
      },
      min_timeline: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      // What to include
      include_courses: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      include_projects: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      include_internships: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      include_jobs: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      // Preferences
      prefer_free_resources: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      prefer_short_duration: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      max_pathway_duration_months: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "User's maximum acceptable pathway duration",
      },
    },
    {
      tableName: "user_pathway_preferences",
      timestamps: true,
      createdAt: false,
      updatedAt: "updated_at",
    }
  );

  UserPathwayPreference.associate = function (models) {
    UserPathwayPreference.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return UserPathwayPreference;
};
