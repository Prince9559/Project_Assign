const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define('Location', {
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
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '0=Pending, 1=Approved, 2=Rejected'
    }
  }, {
    tableName: 'locations',
    timestamps: false
  });

  Location.associate = function(models) {
    Location.hasMany(models.UserDetail, {
      foreignKey: 'location_id',
      as: 'userDetails'
    });
    Location.belongsToMany(models.JobPost, {
      through: models.JobPostCity,
      foreignKey: 'city_id',
      otherKey: 'job_post_id',
      as: 'eligibleJobPosts'
    })
  };

  return Location;
};