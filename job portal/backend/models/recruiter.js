// models/Blog.js

module.exports = (sequelize, DataTypes) => {
  const Recruiter = sequelize.define(
    "Recruiter",
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
      pro_plan: {
        type: DataTypes.JSON,
        allowNull: true,
      },
       enterpise: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "recuirter",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Recruiter;
};
