module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define(
    "Assignment",
    {
      //user id of student
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      job_post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      application_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: DataTypes.TEXT,
      assignment_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      deadline: DataTypes.DATEONLY,
      name: DataTypes.STRING,
    },
    {
      tableName: "assignments",
      timestamp: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Assignment.associate = (models) => {
    Assignment.belongsTo(models.Application, { foreignKey: 'application_id' });
    Assignment.belongsTo(models.User, { foreignKey: 'user_id' });
    Assignment.belongsTo(models.JobPost, { foreignKey: 'job_post_id' });
  };

  return Assignment;
};
