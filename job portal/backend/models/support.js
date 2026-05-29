// models/Blog.js

module.exports = (sequelize, DataTypes) => {
  const Support = sequelize.define(
    "Support",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      heading: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact_us: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      help_center: {
        type: DataTypes.JSON,
        allowNull: true,
      },
       policies: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "support",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Support;
};
