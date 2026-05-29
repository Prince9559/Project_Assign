module.exports = (sequelize, DataTypes) => {
  const LearningResource = sequelize.define(
    "LearningResource",
    {
      resource_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      resource_type: {
        type: DataTypes.ENUM("course", "project", "internship", "job"),
        allowNull: false,
      },
      source_type: {
        type: DataTypes.ENUM("internal", "external_agency"),
        defaultValue: "internal",
      },
      job_post_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "job_posts",
          key: "job_id",
        },
        onDelete: "CASCADE",
      },
      external_provider_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      external_resource_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      external_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      difficulty_level: {
        type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
        defaultValue: "intermediate",
      },
      total_duration: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      available_seats: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
      },
      completion_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "learning_resources",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["resource_type"] },
        { fields: ["is_active"] },
        { fields: ["job_post_id"] },
      ],
    }
  );

  LearningResource.associate = function (models) {
    LearningResource.belongsTo(models.JobPost, {
      foreignKey: "job_post_id",
      as: "jobPost",
    });

    LearningResource.hasMany(models.ResourceSkill, {
      foreignKey: "resource_id",
      as: "resourceSkills",
    });

    LearningResource.hasMany(models.PathwayStep, {
      foreignKey: "resource_id",
      as: "pathwaySteps",
    });

    // Many-to-many through resource_skills
    LearningResource.belongsToMany(models.Skill, {
      through: models.ResourceSkill,
      foreignKey: "resource_id",
      otherKey: "skill_id",
      as: "skills",
    });
  };

  return LearningResource;
};
