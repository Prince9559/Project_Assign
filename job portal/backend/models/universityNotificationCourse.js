module.exports = (sequelize, DataTypes) => {
  const UniversityNotificationCourse = sequelize.define(
    "UniversityNotificationCourse",
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
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      course_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      is_hiring: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      intake: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "university_notification_courses",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      underscored: true,
    }
  );

  UniversityNotificationCourse.associate = (models) => {
    UniversityNotificationCourse.belongsTo(models.UniversityNotificationRequest, {
      foreignKey: "request_id",
      as: "request",
    });
  };

  return UniversityNotificationCourse;
};
