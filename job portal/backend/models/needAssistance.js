module.exports = (sequelize, DataTypes) => {
  const NeedAssistance = sequelize.define(
    "NeedAssistance",
    {
      ticket_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      attachment: {
        type: DataTypes.STRING,
        allowNull: true, 
      },

      status: {
        type: DataTypes.ENUM(
          "open",
          "in_progress",
          "resolved",
          "closed"
        ),
        allowNull: false,
        defaultValue: "open",
      },
    },
    {
      tableName: "need_assistance",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  //  ASSOCIATION
  NeedAssistance.associate = (models) => {
    NeedAssistance.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return NeedAssistance;
};



