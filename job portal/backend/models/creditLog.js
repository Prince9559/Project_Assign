// models/CreditLog.js
module.exports = (sequelize, DataTypes) => {
  const CreditLog = sequelize.define(
    "CreditLog",
    {
      log_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      university_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "university_details",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      action_type: {
        type: DataTypes.ENUM("purchased", "used", "expired", "admin"),
        allowNull: false,
      },
      credits_before: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      credits_changed: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      credits_after: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reference_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "credit_logs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        { fields: ["university_id"] },
        { fields: ["university_id", "created_at"] },
      ],
    }
  );

  CreditLog.associate = function (models) {
    CreditLog.belongsTo(models.UniversityDetail, {
      foreignKey: "university_id",
      targetKey: "id", // ✅
      as: "university",
    });

    CreditLog.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      allowNull: true,
    });
  };

  return CreditLog;
};
