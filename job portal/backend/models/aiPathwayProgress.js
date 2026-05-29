module.exports = (sequelize, DataTypes) => {
  const AiPathwayProgress = sequelize.define(
    "AiPathwayProgress",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      pathway_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "user_pathways", key: "pathway_id" },
        onDelete: "CASCADE",
      },
      step_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "ai_pathway_steps", key: "id" },
        onDelete: "CASCADE",
      },
      status: {
        type: DataTypes.ENUM("pending", "in_progress", "completed"),
        allowNull: false,
        defaultValue: "pending",
      },
      completion_file: {
        type: DataTypes.STRING(1024),
        allowNull: true,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "ai_pathway_progress",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  AiPathwayProgress.associate = (models) => {
    AiPathwayProgress.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
    AiPathwayProgress.belongsTo(models.UserPathway, {
      foreignKey: "pathway_id",
      as: "pathway",
    });
    AiPathwayProgress.belongsTo(models.AiPathwayStep, {
      foreignKey: "step_id",
      as: "step",
    });
  };

  return AiPathwayProgress;
};
