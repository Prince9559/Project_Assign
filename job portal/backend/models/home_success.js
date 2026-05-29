// models/HomeSuccess.js

module.exports = (sequelize, DataTypes) => {
  const HomeSuccess = sequelize.define(
    "HomeSuccess",
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
      sub_heading: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      designation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "homeSuccess",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return HomeSuccess;
};
