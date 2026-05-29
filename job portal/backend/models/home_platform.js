// models/Blog.js

module.exports = (sequelize, DataTypes) => {
  const HomePlatform = sequelize.define(
    "HomePlatform",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      plat_heading: {
        type: DataTypes.STRING,
        allowNull: true,
      },
       plat_content: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      stats: {
        type: DataTypes.JSON,
        allowNull: true,
      },
       stats_content: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      
    },
    {
      tableName: "homePlat",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return HomePlatform;
};
