// models/Blog.js

module.exports = (sequelize, DataTypes) => {
  const Students = sequelize.define(
    "Students",
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
      card_heading: {
        type: DataTypes.JSON,
        allowNull: true,
      },
       card_content: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      plan: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "student",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Students;
};
