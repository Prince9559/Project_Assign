// models/Blog.js

module.exports = (sequelize, DataTypes) => {
  const Terms = sequelize.define(
    "Terms",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      question: {
        type: DataTypes.JSON,
        allowNull: true,
      },
       ans: {
        type: DataTypes.JSON,
        allowNull: true,
      },
     
    },
    {
      tableName: "terms",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Terms;
};
