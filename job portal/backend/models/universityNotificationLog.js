module.exports = (sequelize, DataTypes) => {
  const UniversityNotificationLog = sequelize.define(
    "UniversityNotificationLog",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      email_sent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notification_sent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      tableName: "university_notification_logs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      underscored: true,
    }
  );

  UniversityNotificationLog.associate = (models) => {
    UniversityNotificationLog.belongsTo(models.UniversityNotificationRequest, {
      foreignKey: "request_id",
      as: "request",
    });
  };

  return UniversityNotificationLog;
};
