module.exports = (sequelize, DataTypes) => {
  const AiPathwayStep = sequelize.define(
    "AiPathwayStep",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      pathway_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "user_pathways", key: "pathway_id" },
        onDelete: "CASCADE",
      },
      pathway_step_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
        comment: "pathway_steps.step_id when synced",
      },
      step_title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      resource_title: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      resource_type: {
        type: DataTypes.ENUM("job", "internship", "project", "course"),
        allowNull: false,
      },
      resource_link: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      platform_source: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      duration_label: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      skills: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      sub_skills: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "ai_pathway_steps",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  AiPathwayStep.associate = (models) => {
    AiPathwayStep.belongsTo(models.UserPathway, {
      foreignKey: "pathway_id",
      as: "pathway",
    });
  };

  return AiPathwayStep;
};
