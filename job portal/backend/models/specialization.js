const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Specialization = sequelize.define('Specialization', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'specializations',
    timestamps: false
  });

  Specialization.associate = function(models) {
    Specialization.belongsTo(models.Course, { 
      foreignKey: 'course_id',
      as: 'course'
    });
    
    Specialization.hasMany(models.Education, {
      foreignKey: 'specialization_id',
      as: 'educations'
    });
  };

  return Specialization;
};