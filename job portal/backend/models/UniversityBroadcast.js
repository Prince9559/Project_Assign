module.exports = (sequelize, DataTypes) => {
  const UniversityBroadcast = sequelize.define("UniversityBroadcast", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    university_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    courses_selected: {
      type: DataTypes.JSON, // Stores array of course names or IDs
      allowNull: false,
    },
    industries_selected: {
      type: DataTypes.JSON, // Stores array of industry names or IDs
      allowNull: false,
    },
    is_immediate: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    companies_reached: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    credits_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Delivered',
    }
  }, {
    tableName: "university_broadcasts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  });

  return UniversityBroadcast;
};