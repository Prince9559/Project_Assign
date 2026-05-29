module.exports = (sequelize, DataTypes) => {
  const About = sequelize.define(
    "About",
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
      content: {
        type: DataTypes.TEXT, 
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
    },
    {
      tableName: "about",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return About;
};
