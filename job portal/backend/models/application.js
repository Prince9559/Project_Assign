const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define(
    "Application",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      job_post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      why_should_we_hire_you: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      confirm_availability: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      project: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      github_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      portfolio_link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      screening_answers: {
        type: DataTypes.JSON, 
        allowNull: false,
        defaultValue: [],
      },
      status: { 
        //can be Applied Shortlist NotInterested Interview Assignment Hired
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "applications",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      defaultValue: {
        createdAt: sequelize.literal("CURRENT_TIMESTAMP"),
        updatedAt: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    }
  );

  Application.associate = function (models) {
    // Core application relationships
    Application.belongsTo(models.JobPost, {
      foreignKey: 'job_post_id',
      as: 'jobPost'
    });

    Application.belongsTo(models.Location, {
      foreignKey: 'location_id',
      as: 'location'
    });

    // User relationship (single source of truth for user data)
    Application.belongsTo(models.UserDetail, {
      foreignKey: 'user_id',
      targetKey: 'user_id',
      as: 'user'
    });

    // Interview relationship
    Application.hasMany(models.InterviewInvitation, {
      foreignKey: 'application_id',
      as: 'interviews'
    });

    // Assignment relationship
    Application.hasMany(models.Assignment, {
      foreignKey: 'application_id',
      as: 'assignments'
    });

    Application.hasOne(models.Conversation, {
      foreignKey: "job_application_id",
      as: "conversation",
    });
  };

  return Application;
};
