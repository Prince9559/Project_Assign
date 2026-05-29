module.exports = (sequelize, DataTypes) => {
  const UniversityNotificationCredit = sequelize.define(
    "UniversityNotificationCredit",
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
      total_credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1000,
      },
      used_credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      remaining_credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1000,
      },
    },
    {
      tableName: "university_notification_credits",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  UniversityNotificationCredit.associate = (models) => {
    UniversityNotificationCredit.belongsTo(models.UniversityDetail, {
      foreignKey: "university_id",
      as: "university",
    });
  };

  return UniversityNotificationCredit;
};
