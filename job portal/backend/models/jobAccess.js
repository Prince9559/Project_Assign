module.exports = (sequelize, DataTypes) => {
  const JobAccess = sequelize.define(
    "JobAccess",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "job_posts", key: "job_id" },
        onDelete: "CASCADE",
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      access_level: {
        type: DataTypes.ENUM("view", "edit", "manage"),
        defaultValue: "view",
        allowNull: false,
      },
      assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      // Optional: auto-revoke after job closes
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "job_access",
      timestamps: false,
    }
  );

  JobAccess.associate = function (models) {
    JobAccess.belongsTo(models.JobPost, { foreignKey: "job_id", as: "job" });
    JobAccess.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    JobAccess.belongsTo(models.User, {
      foreignKey: "assigned_by",
      as: "assignedBy",
    });
  };

  return JobAccess;
};