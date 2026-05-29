module.exports = (sequelize, DataTypes) => {
  const ResourceSkill = sequelize.define(
    "ResourceSkill",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      resource_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "learning_resources",
          key: "resource_id",
        },
        onDelete: "CASCADE",
      },
      skill_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "skills",
          key: "skill_id",
        },
        onDelete: "CASCADE",
      },
      skill_importance: {
        type: DataTypes.ENUM("primary", "secondary", "bonus"),
        defaultValue: "primary",
      },
      skill_learning_duration: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true, // NULL for internships/projects/jobs as they are taught full no granular
      },
      skill_type: {
        type: DataTypes.ENUM("prerequisite", "outcome"),
        defaultValue: "outcome",
      },
      experience_months_provided: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
        comment:
          "How many months of experience this resource provides for this skill",
      },
      is_prerequisite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Does user need this skill BEFORE starting this resource?",
      },
    },
    {
      tableName: "resource_skills",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  ResourceSkill.associate = function (models) {
    ResourceSkill.belongsTo(models.LearningResource, {
      foreignKey: "resource_id",
      as: "resource",
    });

    ResourceSkill.belongsTo(models.Skill, {
      foreignKey: "skill_id",
      as: "Skill",
    });
  };

  return ResourceSkill;
};
