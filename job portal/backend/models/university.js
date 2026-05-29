module.exports = (sequelize, DataTypes) => {
  const University = sequelize.define(
    "University",
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
      
      card_haeding: {
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
    },
    {
      tableName: "university",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return University;
};
