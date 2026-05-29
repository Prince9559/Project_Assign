module.exports = (sequelize, DataTypes) => {
  const UniversityNotificationRequest = sequelize.define(
    "UniversityNotificationRequest",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      university_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      courses: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      industries: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      companies_targeted: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      credits_used: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      progress: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "university_notification_requests",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  UniversityNotificationRequest.associate = (models) => {
    UniversityNotificationRequest.belongsTo(models.UniversityDetail, {
      foreignKey: "university_id",
      as: "university",
    });
    UniversityNotificationRequest.hasMany(models.UniversityNotificationCourse, {
      foreignKey: "request_id",
      as: "courseRows",
    });
    UniversityNotificationRequest.hasMany(models.UniversityNotificationLog, {
      foreignKey: "request_id",
      as: "logs",
    });
  };

  return UniversityNotificationRequest;
};
